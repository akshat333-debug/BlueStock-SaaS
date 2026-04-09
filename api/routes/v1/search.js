const express = require('express');
const prisma = require('../../config/database');
const { sendSuccess, sendError } = require('../../utils/response');
const { authenticateApiKey } = require('../../middleware/auth');
const { rateLimiter } = require('../../middleware/rateLimiter');

const router = express.Router();

router.use(authenticateApiKey, rateLimiter);

/**
 * Helper to build the hierarchy strings for responses.
 */
const getHierarchy = (vil) => ({
  village: vil.name,
  subDistrict: vil.subDistrict.name,
  district: vil.subDistrict.district.name,
  state: vil.subDistrict.district.state.name,
  country: vil.subDistrict.district.state.country.name
});

const getFullAddress = (h) => `${h.village}, ${h.subDistrict}, ${h.district}, ${h.state}, ${h.country}`;

/**
 * GET /api/v1/autocomplete
 * Typeahead suggestions for dropdowns. Leverages pg_trgm for fast partial matches.
 * Query Params: q (required), limit (optional, max 20)
 */
router.get('/autocomplete', async (req, res) => {
  try {
    const q = req.query.q;
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 10));

    if (!q || q.length < 2) {
      return sendError(res, 400, 'INVALID_QUERY', 'Search query (q) must be at least 2 characters.');
    }

    // Determine state limits based on plan
    let stateFilter = '';
    const user = req.user;
    
    if (user.planType !== 'PRO' && user.planType !== 'UNLIMITED') {
       // Fetch user allowed states
       const allowedStates = await prisma.userStateAccess.findMany({
         where: { userId: user.id },
         select: { stateId: true }
       });
       
       if (allowedStates.length === 0) {
          return sendSuccess(res, [], 0); // They have no access anywhere
       }
       
       const stateIds = allowedStates.map(s => s.stateId).join(',');
       // This restricts searches to their allowed states
       stateFilter = `AND s.id IN (${stateIds})`;
    }

    // Using raw SQL to leverage the `pg_trgm` extension on villages.name
    const rawQuery = `
      SELECT v.id as v_id, v.code as v_code, v.name as v_name,
             sd.name as sd_name, d.name as d_name, s.name as s_name, c.name as c_name
      FROM villages v
      JOIN sub_districts sd ON v."subDistrictId" = sd.id
      JOIN districts d ON sd."districtId" = d.id
      JOIN states s ON d."stateId" = s.id
      JOIN countries c ON s."countryId" = c.id
      WHERE v.name ILIKE $1 ${stateFilter}
      ORDER BY similarity(v.name, $2) DESC, v.name ASC
      LIMIT $3
    `;

    // The ILIKE acts as a pre-filter, while similarity sorts the best matches
    const searchPattern = `%${q}%`;
    const results = await prisma.$queryRawUnsafe(rawQuery, searchPattern, q, limit);

    const formattedData = results.map((row) => {
      const hierarchy = {
        village: row.v_name,
        subDistrict: row.sd_name,
        district: row.d_name,
        state: row.s_name,
        country: row.c_name
      };
      return {
        value: row.v_code,
        label: row.v_name,
        fullAddress: getFullAddress(hierarchy),
        hierarchy: hierarchy
      };
    });

    return sendSuccess(res, formattedData, formattedData.length);
  } catch (err) {
    if (err.message.includes('function similarity(character varying, unknown) does not exist')) {
       console.error('[Search Route Error] pg_trgm extension not installed on NeonDB.');
       // Fallback for development without trgm installed
       return fallbackBasicSearch(req, res);
    }
    console.error('[Route Error]', err);
    return sendError(res, 500, 'INTERNAL_ERROR', 'Failed to perform autocomplete search.');
  }
});


/**
 * Fallback mechanism if pg_trgm is not yet configured on the DB.
 */
async function fallbackBasicSearch(req, res) {
  const q = req.query.q;
  const limit = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 10));

  let stateFilter = {};
  if (req.user.planType !== 'PRO' && req.user.planType !== 'UNLIMITED') {
     const allowedStates = await prisma.userStateAccess.findMany({
       where: { userId: req.user.id },
       select: { stateId: true }
     });
     if (allowedStates.length === 0) return sendSuccess(res, [], 0);
     stateFilter = { in: allowedStates.map(s => s.stateId) };
  }

  const villages = await prisma.village.findMany({
    where: {
      name: { contains: q, mode: 'insensitive' },
      ...(Object.keys(stateFilter).length > 0 && {
         subDistrict: { district: { stateId: stateFilter } }
      })
    },
    take: limit,
    include: {
      subDistrict: {
        include: {
          district: {
            include: { state: { include: { country: true } } }
          }
        }
      }
    }
  });

  const formattedData = villages.map((vil) => {
    const hierarchy = getHierarchy(vil);
    return {
      value: vil.code,
      label: vil.name,
      fullAddress: getFullAddress(hierarchy),
      hierarchy
    };
  });

  return sendSuccess(res, formattedData, formattedData.length);
}


/**
 * GET /api/v1/search
 * Advanced search with explicit filters.
 * Query Params: q, state, district, subDistrict, page, limit
 */
router.get('/search', async (req, res) => {
  try {
    const { q, state, district, subDistrict } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const skip = (page - 1) * limit;

    const whereClause = {};

    if (q) {
      whereClause.name = { contains: q, mode: 'insensitive' };
    }

    if (subDistrict) {
      whereClause.subDistrict = { name: { equals: subDistrict, mode: 'insensitive' } };
    } else if (district) {
      whereClause.subDistrict = { district: { name: { equals: district, mode: 'insensitive' } } };
    } else if (state) {
      whereClause.subDistrict = { district: { state: { name: { equals: state, mode: 'insensitive' } } } };
    }

    // Access control check
    if (req.user.planType !== 'PRO' && req.user.planType !== 'UNLIMITED') {
      const allowedStates = await prisma.userStateAccess.findMany({
        where: { userId: req.user.id },
        select: { stateId: true }
      });
      if (allowedStates.length === 0) return sendSuccess(res, [], 0);
      
      const stateIds = allowedStates.map(s => s.stateId);
      
      // Merge with any existing subDistrict logic
      whereClause.subDistrict = {
         ...whereClause.subDistrict,
         district: {
            ...((whereClause.subDistrict && whereClause.subDistrict.district) || {}),
            stateId: { in: stateIds }
         }
      };
    }

    const [count, villages] = await Promise.all([
      prisma.village.count({ where: whereClause }),
      prisma.village.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          subDistrict: {
            include: {
              district: {
                include: { state: { include: { country: true } } }
              }
            }
          }
        }
      })
    ]);

    const formattedData = villages.map((vil) => {
      const hierarchy = getHierarchy(vil);
      return {
        id: vil.code,
        name: vil.name,
        fullAddress: getFullAddress(hierarchy),
        hierarchy
      };
    });

    return sendSuccess(res, formattedData, count);
  } catch (err) {
    console.error('[Route Error]', err);
    return sendError(res, 500, 'INTERNAL_ERROR', 'Failed to perform search.');
  }
});

module.exports = router;
