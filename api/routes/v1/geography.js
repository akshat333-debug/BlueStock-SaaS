const express = require('express');
const prisma = require('../../config/database');
const { sendSuccess, sendError } = require('../../utils/response');
const { authenticateApiKey, verifyStateAccess } = require('../../middleware/auth');
const { rateLimiter } = require('../../middleware/rateLimiter');

const router = express.Router();

// Apply auth and rate limiting to all routes in this file
router.use(authenticateApiKey, rateLimiter);

/**
 * Helper to extract pagination
 */
const getPagination = (req) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
  const skip = (page - 1) * limit;
  return { skip, take: limit, page, limit };
};

/**
 * GET /api/v1/states
 * List all states available
 */
router.get('/states', async (req, res) => {
  try {
    const states = await prisma.state.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, code: true, name: true, country: { select: { name: true } } }
    });

    return sendSuccess(res, states, states.length);
  } catch (err) {
    console.error('[Route Error]', err);
    return sendError(res, 500, 'INTERNAL_ERROR', 'Failed to retrieve states.');
  }
});

/**
 * GET /api/v1/states/:id/districts
 * List districts for a specific state. Validates user's state access.
 */
router.get('/states/:id/districts', verifyStateAccess('id'), async (req, res) => {
  try {
    const stateId = parseInt(req.params.id, 10);
    const { skip, take } = getPagination(req);

    const [count, districts] = await Promise.all([
      prisma.district.count({ where: { stateId } }),
      prisma.district.findMany({
        where: { stateId },
        orderBy: { name: 'asc' },
        skip,
        take,
        select: { id: true, code: true, name: true, state: { select: { name: true } } }
      })
    ]);

    return sendSuccess(res, districts, count);
  } catch (err) {
    console.error('[Route Error]', err);
    return sendError(res, 500, 'INTERNAL_ERROR', 'Failed to retrieve districts.');
  }
});

/**
 * GET /api/v1/districts/:id/subdistricts
 * Note: Access checking relies on the implicit relationship to the state.
 */
router.get('/districts/:id/subdistricts', async (req, res) => {
  try {
    const districtId = parseInt(req.params.id, 10);
    const { skip, take } = getPagination(req);

    // Ensure access control — find the state the district belongs to
    const district = await prisma.district.findUnique({
      where: { id: districtId },
      select: { stateId: true }
    });

    if (!district) {
      return sendError(res, 404, 'NOT_FOUND', 'District not found.');
    }

    // Call verify access logic manually (reusing the logic from auth.js if we want to be strict)
    // For now, depending on B2B strictness, we'll verify they have access to `district.stateId`.
    const authModule = require('../../middleware/auth'); 
    
    // Create mock req/res cycle to reuse `verifyStateAccess` manually if needed, 
    // OR we simply do it procedurally here since it's a sub-entity.
    if (req.user.planType !== 'PRO' && req.user.planType !== 'UNLIMITED') {
       const accessCheck = await prisma.userStateAccess.findUnique({
          where: { userId_stateId: { userId: req.user.id, stateId: district.stateId } }
       });
       if (!accessCheck) {
          return sendError(res, 403, 'ACCESS_DENIED', 'Your subscription plan does not have access to this region.');
       }
    }

    const [count, subDistricts] = await Promise.all([
      prisma.subDistrict.count({ where: { districtId } }),
      prisma.subDistrict.findMany({
        where: { districtId },
        orderBy: { name: 'asc' },
        skip,
        take,
        select: { id: true, code: true, name: true, district: { select: { name: true } } }
      })
    ]);

    return sendSuccess(res, subDistricts, count);
  } catch (err) {
    console.error('[Route Error]', err);
    return sendError(res, 500, 'INTERNAL_ERROR', 'Failed to retrieve sub-districts.');
  }
});

/**
 * GET /api/v1/subdistricts/:id/villages
 */
router.get('/subdistricts/:id/villages', async (req, res) => {
  try {
    const subDistrictId = parseInt(req.params.id, 10);
    const { skip, take } = getPagination(req);

    // Ensure access control context
    const subDistrict = await prisma.subDistrict.findUnique({
      where: { id: subDistrictId },
      include: { district: { select: { stateId: true } } }
    });

    if (!subDistrict) {
      return sendError(res, 404, 'NOT_FOUND', 'SubDistrict not found.');
    }

    if (req.user.planType !== 'PRO' && req.user.planType !== 'UNLIMITED') {
       const accessCheck = await prisma.userStateAccess.findUnique({
          where: { userId_stateId: { userId: req.user.id, stateId: subDistrict.district.stateId } }
       });
       if (!accessCheck) {
          return sendError(res, 403, 'ACCESS_DENIED', 'Your subscription plan does not have access to this region.');
       }
    }

    const [count, villages] = await Promise.all([
      prisma.village.count({ where: { subDistrictId } }),
      prisma.village.findMany({
        where: { subDistrictId },
        orderBy: { name: 'asc' },
        skip,
        take,
        select: { id: true, code: true, name: true, subDistrict: { select: { name: true } } }
      })
    ]);

    return sendSuccess(res, villages, count);
  } catch (err) {
    console.error('[Route Error]', err);
    return sendError(res, 500, 'INTERNAL_ERROR', 'Failed to retrieve villages.');
  }
});

module.exports = router;
