import 'dotenv/config';
import express, { Request, Response } from 'express';
import { redisService } from './services/redis.service';

const app = express();
const port = Number(process.env.PORT) || 8080;
const API_PREFIX = '/api';
const isDevelopment = process.env.NODE_ENV !== 'production';

// Health check endpoint
app.get(`${API_PREFIX}/health`, async (req: Request, res: Response) => {
    try {
        // Check Redis connection
        await redisService.ping();
        res.status(200).json({
            status: "I'm Alive!",
            redis: "Connected"
        });
    } catch (error) {
        res.status(500).json({
            status: "I'm Alive!",
            redis: "Disconnected",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Redis exchange endpoint
app.get(`${API_PREFIX}/redisexchange`, async (req: Request, res: Response) => {
    try {
        const testKey = 'test:key';
        const testValue = 'Hello Redis!';

        // Set the test key
        await redisService.getClient().set(testKey, testValue);

        // Get the test key
        const retrievedValue = await redisService.getClient().get(testKey);

        res.status(200).json({
            success: true,
            message: 'Redis exchange successful',
            data: {
                key: testKey,
                setValue: testValue,
                retrievedValue: retrievedValue
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Redis exchange failed',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Start the server with IPv4 and IPv6 support
const server = app.listen(port, '::', () => {
    if (isDevelopment) {
        console.log(`Server is running on port ${port}`);
        console.log(`Health check endpoint: http://localhost:${port}${API_PREFIX}/health`);
        console.log(`Redis exchange endpoint: http://localhost:${port}${API_PREFIX}/redisexchange`);

        // Log server addresses
        const addresses = server.address();
        if (typeof addresses === 'object' && addresses) {
            console.log('Server listening on:');
            console.log(`IPv4: http://0.0.0.0:${port}`);
            console.log(`IPv6: http://[::]:${port}`);
        }
    }
}); 