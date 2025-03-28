require('dotenv').config();
const express = require('express');
const Redis = require('ioredis');

const app = express();
const port = process.env.PORT || 3000;

// Redis client configuration
const redisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    db: process.env.REDIS_DB,
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    }
});

// Redis connection events
redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));
redisClient.on('ready', () => console.log('Redis Client Ready'));

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        // Check Redis connection
        await redisClient.ping();
        res.status(200).json({
            status: "I'm Alive!",
            redis: "Connected"
        });
    } catch (error) {
        res.status(500).json({
            status: "I'm Alive!",
            redis: "Disconnected",
            error: error.message
        });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 