const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const { sendSuccess, sendError } = require('../utils/response');

const prisma = new PrismaClient();

/**
 * Helper to generate a secure random API key.
 * Format: ak_{random16chars} (Public Key) -> as_{random32chars} (Secret)
 */
function generateApiKeyPair() {
    const key = `ak_${crypto.randomBytes(8).toString('hex')}`;
    const secret = `as_${crypto.randomBytes(16).toString('hex')}`;
    
    // Hash the secret for storage
    const hashedSecret = crypto.createHash('sha256').update(secret).digest('hex');
    
    return { key, secret, hashedSecret };
}

/**
 * @route GET /api/v1/keys
 * @desc List all API keys for the current authenticated user/org.
 * NOTE: For the hackathon demo, we are skipping a real UI Login and passing hardcoded userId=1.
 */
router.get('/', async (req, res) => {
    try {
        const userId = 1; // MOCKED DEMO USER ID
        
        const keys = await prisma.apiKey.findMany({
            where: { userId },
            select: {
                id: true,
                name: true,
                key: true,
                isActive: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: { createdAt: 'desc' }
        });

        // Format dates for UI natively
        const formatted = keys.map(k => ({
            id: k.id,
            name: k.name,
            key: k.key,
            isActive: k.isActive,
            createdAt: k.createdAt.toISOString().split('T')[0],
            lastUsedAt: 'Never' // Simplified for demo
        }));

        sendSuccess(res, formatted);
    } catch (error) {
        console.error('Error fetching keys:', error);
        sendError(res, 500, 'Failed to fetch API keys', 'INTERNAL_ERROR');
    }
});

/**
 * @route POST /api/v1/keys
 * @desc Create a new API Key with "Reveal Once" secret.
 */
router.post('/', async (req, res) => {
    try {
        const userId = 1; // MOCKED DEMO USER ID
        const { name } = req.body;

        if (!name || name.trim() === '') {
            return sendError(res, 400, 'Key name is required', 'VALIDATION_ERROR');
        }

        const { key, secret, hashedSecret } = generateApiKeyPair();

        const newKey = await prisma.apiKey.create({
            data: {
                userId,
                name: name.trim(),
                key,
                hashedSecret
            }
        });

        // Return the plaintext secret ONLY this one time.
        sendSuccess(res, {
            id: newKey.id,
            name: newKey.name,
            key: newKey.key,
            secret, // Critical: REVEAL ONCE
            isActive: newKey.isActive,
            createdAt: newKey.createdAt.toISOString().split('T')[0],
            lastUsedAt: 'Never'
        }, 201);
    } catch (error) {
        console.error('Error creating key:', error);
        sendError(res, 500, 'Failed to create API key', 'INTERNAL_ERROR');
    }
});

module.exports = router;
