const { authenticateApiKey } = require('../../middleware/auth');
const prisma = require('../../config/database');
const redis = require('../../config/redis');

// Mock external DB and Cache
jest.mock('../../config/database', () => ({
  apiKey: {
    findUnique: jest.fn(),
  },
  apiLog: {
    create: jest.fn(),
  }
}));

jest.mock('../../config/redis', () => ({
  getCache: jest.fn(),
  setCache: jest.fn(),
}));

describe('Auth Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {},
      ip: '127.0.0.1',
      originalUrl: '/api/v1/states',
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    
    jest.clearAllMocks();
  });

  it('should return 401 if X-API-Key is missing', async () => {
    await authenticateApiKey(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'INVALID_API_KEY' })
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should use Redis cache if valid key is found', async () => {
    mockReq.headers['x-api-key'] = 'valid_cached_key';
    const mockCachedData = { id: 1, name: 'Cache', isActive: true, user: { status: 'ACTIVE', planType: 'PREMIUM' } };
    redis.getCache.mockResolvedValueOnce(mockCachedData);

    await authenticateApiKey(mockReq, mockRes, mockNext);

    expect(redis.getCache).toHaveBeenCalledWith('apiKey:valid_cached_key');
    expect(prisma.apiKey.findUnique).not.toHaveBeenCalled();
    expect(mockReq.user).toEqual(mockCachedData.user);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should check DB if Redis cache is missing and return 401 if invalid', async () => {
    mockReq.headers['x-api-key'] = 'invalid_db_key';
    redis.getCache.mockResolvedValueOnce(null);
    prisma.apiKey.findUnique.mockResolvedValueOnce(null);

    await authenticateApiKey(mockReq, mockRes, mockNext);

    expect(prisma.apiKey.findUnique).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should successfully authenticate via DB and populate Redis cache', async () => {
    mockReq.headers['x-api-key'] = 'valid_db_key';
    const mockDbKeyRow = { id: 2, isActive: true, user: { status: 'ACTIVE', planType: 'PRO' } };
    
    redis.getCache.mockResolvedValueOnce(null);
    prisma.apiKey.findUnique.mockResolvedValueOnce(mockDbKeyRow);

    await authenticateApiKey(mockReq, mockRes, mockNext);

    expect(prisma.apiKey.findUnique).toHaveBeenCalled();
    expect(redis.setCache).toHaveBeenCalledWith(
      'apiKey:valid_db_key',
      mockDbKeyRow,
      expect.any(Number)
    );
    expect(mockReq.user.planType).toBe('PRO');
    expect(mockNext).toHaveBeenCalled();
  });
});
