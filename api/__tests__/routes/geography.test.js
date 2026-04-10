const request = require('supertest');
const app = require('../../index'); // Your express app
const prisma = require('../../config/database');
const redis = require('../../config/redis');

// Mock out the rate limiter to prevent limits during tests
jest.mock('../../middleware/rateLimiter', () => ({
  rateLimiter: (req, res, next) => next(),
}));

jest.mock('../../config/database', () => ({
  apiKey: {
    findUnique: jest.fn(),
  },
  apiLog: {
    create: jest.fn(),
  },
  state: {
    findMany: jest.fn(),
  },
  district: {
    findMany: jest.fn(),
  }
}));

jest.mock('../../config/redis', () => ({
  getCache: jest.fn(),
  setCache: jest.fn(),
}));

describe('Geography API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validKeyHeader = 'ak_test_key_123';

  it('GET /api/v1/states should require authentication', async () => {
    const res = await request(app).get('/api/v1/states');
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('INVALID_API_KEY');
  });

  it('GET /api/v1/states should return list of states if authenticated', async () => {
    // 1. Mock Auth Cache
    redis.getCache.mockImplementation((key) => {
      if (key === `apiKey:${validKeyHeader}`) {
         return { isActive: true, user: { status: 'ACTIVE', planType: 'PREMIUM', id: 1 } };
      }
      return null;
    });

    // 2. Mock Prisma States Return
    const mockStates = [
      { id: 1, name: 'Maharashtra', code: 'MH' },
      { id: 2, name: 'Karnataka', code: 'KA' }
    ];
    prisma.state.findMany.mockResolvedValueOnce(mockStates);

    // 3. Fire Request
    const res = await request(app)
      .get('/api/v1/states')
      .set('X-API-Key', validKeyHeader);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(mockStates);
    expect(prisma.state.findMany).toHaveBeenCalled();
  });
});
