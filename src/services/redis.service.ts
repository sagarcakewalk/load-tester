import Redis from 'ioredis';

class RedisService {
    private static instance: RedisService;
    private client: Redis;
    private isDevelopment: boolean;

    private constructor() {
        this.isDevelopment = process.env.NODE_ENV !== 'production';

        // Validate required environment variables
        const requiredEnvVars = ['REDIS_HOST', 'REDIS_PORT'];
        const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

        if (missingEnvVars.length > 0) {
            throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
        }

        const redisConfig = {
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
            password: process.env.REDIS_PASSWORD || undefined,
            db: Number(process.env.REDIS_DB || 0),
            // Performance optimizations
            maxRetriesPerRequest: 1,
            retryStrategy: (times: number) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
            connectTimeout: 10000,
            commandTimeout: 5000,
            keepAlive: 30000,
            family: 4, // Force IPv4 for better performance
            enableOfflineQueue: false,
            enableReadyCheck: false,
            lazyConnect: true,
            // Connection pool settings
            maxConnections: 10,
            minConnections: 2
        };

        // Log configuration in both environments
        console.log(`[Redis] Connecting to ${redisConfig.host}:${redisConfig.port}`);
        if (this.isDevelopment) {
            console.log('[Redis] Configuration:', {
                ...redisConfig,
                password: redisConfig.password ? '[REDACTED]' : undefined
            });
        }

        this.client = new Redis(redisConfig);
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        // Always log critical connection events
        this.client.on('error', (err: Error) => {
            console.error('[Redis] Connection Error:', err.message);
        });

        this.client.on('connect', () => {
            console.log('[Redis] Connected successfully');
        });

        this.client.on('ready', () => {
            console.log('[Redis] Ready to accept commands');
        });

        this.client.on('close', () => {
            console.log('[Redis] Connection closed');
        });

        this.client.on('reconnecting', () => {
            console.log('[Redis] Reconnecting...');
        });

        // Additional debug logs for development
        if (this.isDevelopment) {
            this.client.on('end', () => {
                console.log('[Redis] Connection ended');
            });

            this.client.on('wait', () => {
                console.log('[Redis] Waiting for connection');
            });
        }
    }

    public static getInstance(): RedisService {
        if (!RedisService.instance) {
            RedisService.instance = new RedisService();
        }
        return RedisService.instance;
    }

    public async ping(): Promise<string> {
        try {
            // Use a shorter timeout for health checks
            return await Promise.race([
                this.client.ping(),
                new Promise<string>((_, reject) =>
                    setTimeout(() => reject(new Error('Redis ping timeout')), 1000)
                )
            ]);
        } catch (error) {
            throw new Error(`Redis ping failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    public getClient(): Redis {
        return this.client;
    }
}

export const redisService = RedisService.getInstance(); 