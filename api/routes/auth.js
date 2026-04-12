const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const { sendSuccess, sendError } = require('../utils/response');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'bluestock-saas-dev-secret-2024';
const JWT_EXPIRY = '24h';

/**
 * POST /api/auth/register
 * B2B Self-Registration (Section 9.1)
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, businessName, gstNumber, phone } = req.body;

    if (!email || !password || !businessName) {
      return sendError(res, 400, 'INVALID_QUERY', 'Email, password, and business name are required.');
    }

    if (password.length < 8) {
      return sendError(res, 400, 'INVALID_QUERY', 'Password must be at least 8 characters.');
    }

    // Block free email providers
    const freeProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'];
    const domain = email.split('@')[1]?.toLowerCase();
    if (freeProviders.includes(domain)) {
      return sendError(res, 400, 'INVALID_QUERY', 'Please use a business email address.');
    }

    // Check for existing user
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return sendError(res, 409, 'CONFLICT', 'An account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        businessName,
        gstNumber: gstNumber || null,
        phone: phone || null,
        planType: 'FREE',
        status: 'PENDING_APPROVAL',
        role: 'USER',
      },
      select: { id: true, email: true, businessName: true, status: true, planType: true }
    });

    return sendSuccess(res, {
      message: 'Registration successful. Your account is pending admin approval.',
      user
    });
  } catch (err) {
    console.error('[Auth Register Error]', err);
    return sendError(res, 500, 'INTERNAL_ERROR', 'Registration failed.');
  }
});

/**
 * POST /api/auth/login
 * JWT Login (Section 10.1 — 24h expiry)
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, 'INVALID_QUERY', 'Email and password are required.');
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return sendError(res, 401, 'UNAUTHORIZED', 'Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return sendError(res, 401, 'UNAUTHORIZED', 'Invalid email or password.');
    }

    if (user.status === 'SUSPENDED') {
      return sendError(res, 403, 'ACCESS_DENIED', 'Your account has been suspended.');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, planType: user.planType },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    return sendSuccess(res, {
      token,
      expiresIn: JWT_EXPIRY,
      user: {
        id: user.id,
        email: user.email,
        businessName: user.businessName,
        planType: user.planType,
        status: user.status,
        role: user.role
      }
    });
  } catch (err) {
    console.error('[Auth Login Error]', err);
    return sendError(res, 500, 'INTERNAL_ERROR', 'Login failed.');
  }
});

/**
 * Middleware: authenticateJWT
 * Validates JWT from Authorization: Bearer <token>
 */
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 401, 'UNAUTHORIZED', 'Missing or invalid Authorization header.');
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.jwtUser = decoded;
    next();
  } catch (err) {
    return sendError(res, 401, 'UNAUTHORIZED', 'Invalid or expired token.');
  }
};

/**
 * GET /api/auth/me — returns current user profile from JWT
 */
router.get('/me', authenticateJWT, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.jwtUser.userId },
      select: { id: true, email: true, businessName: true, planType: true, status: true, role: true, createdAt: true }
    });
    if (!user) return sendError(res, 404, 'NOT_FOUND', 'User not found.');
    return sendSuccess(res, user);
  } catch (err) {
    return sendError(res, 500, 'INTERNAL_ERROR', 'Failed to fetch profile.');
  }
});

module.exports = router;
module.exports.authenticateJWT = authenticateJWT;
