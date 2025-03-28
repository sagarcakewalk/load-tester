import Redis from 'ioredis';

class RedisService {
    private static instance: RedisService;
    private client: Redis;
    private isDevelopment: boolean;

    private constructor() {
        this.isDevelopment = process.env.NODE_ENV !== 'production';
        console.log('NODE_ENV:', process.env.NODE_ENV);

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
            retryStrategy: (times: number) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            }
        };

        if (this.isDevelopment) {
            console.log('Redis Configuration:', {
                ...redisConfig,
                password: redisConfig.password ? '[REDACTED]' : undefined
            });
        }

        this.client = new Redis(redisConfig);
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this.client.on('error', (err: Error) => console.error('Redis Client Error', err));
        this.client.on('connect', () => console.log('Redis Client Connected'));
        this.client.on('ready', () => console.log('Redis Client Ready'));
    }

    public static getInstance(): RedisService {
        if (!RedisService.instance) {
            RedisService.instance = new RedisService();
        }
        return RedisService.instance;
    }

    public async ping(): Promise<string> {
        return await this.client.ping();
    }

    public getClient(): Redis {
        return this.client;
    }
}

export const redisService = RedisService.getInstance(); 