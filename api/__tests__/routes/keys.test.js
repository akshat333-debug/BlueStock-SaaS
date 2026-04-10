const request = require('supertest');
const app = require('../../index');

jest.mock('@prisma/client', () => {
  const mCreate = jest.fn();
  const mFindMany = jest.fn();
  const mFindFirst = jest.fn();
  return {
    PrismaClient: jest.fn(() => ({
      apiKey: { create: mCreate, findMany: mFindMany },
      user: { 
          findFirst: mFindFirst, 
          create: jest.fn().mockResolvedValue({ id: 1, email: 'demo@villageapi.com' }) 
      }
    }))
  };
});

const { PrismaClient } = require('@prisma/client');
const prismaMock = new PrismaClient();

describe('API Keys Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prismaMock.user.findFirst.mockResolvedValue({ id: 1, email: 'demo@villageapi.com' });
  });

  it('GET /api/v1/keys should return list of test keys', async () => {
    const mockKeys = [
      { id: 1, name: 'Key 1', key: 'ak_123', isActive: true, createdAt: new Date() }
    ];
    prismaMock.apiKey.findMany.mockResolvedValueOnce(mockKeys);

    const res = await request(app).get('/api/v1/keys');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].key).toBe('ak_123');
  });

  it('POST /api/v1/keys should securely generate a hashed key/secret pair', async () => {
    prismaMock.apiKey.create.mockResolvedValueOnce({
      id: 2,
      name: 'New App Key',
      key: 'ak_mockkey',
      secretHash: 'hashed_secret', // Never returned to client
      isActive: true,
      createdAt: new Date()
    });

    const res = await request(app)
      .post('/api/v1/keys')
      .send({ name: 'New App Key' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    // Secret should only be revealed ONCE during creation
    expect(res.body.data.secret).toBeDefined();
    expect(res.body.data.secret.startsWith('as_')).toBe(true);
    expect(res.body.data.key).toBeDefined();
    expect(res.body.data.secretHash).toBeUndefined(); // Should not leak internal hash
  });
});
