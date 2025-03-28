# Load Tester

A simple Express.js server with a health check endpoint, built with TypeScript and Redis.

## Prerequisites

Make sure you have pnpm installed. If not, you can install it globally using:
```bash
npm install -g pnpm
```

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Create a `.env` file in the root directory with the following content:
```env
PORT=8080
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

## Running the Server

Development mode (with auto-reload):
```bash
pnpm dev
```

Production mode:
```bash
pnpm build
pnpm start
```

## API Endpoints

All API endpoints are prefixed with `/api`

### Health Check
- URL: `/api/health`
- Method: GET
- Response: 
```json
{
    "status": "I'm Alive!",
    "redis": "Connected"
}
```

### Redis Exchange
- URL: `/api/redisexchange`
- Method: GET
- Description: Demonstrates Redis set and get operations
- Response: 
```json
{
    "success": true,
    "message": "Redis exchange successful",
    "data": {
        "key": "test:key",
        "setValue": "Hello Redis!",
        "retrievedValue": "Hello Redis!"
    }
}
```

The server runs on port 8080 by default. You can change this by setting the `PORT` environment variable.

## Project Structure

```
src/
├── services/
│   └── redis.service.ts    # Redis connection and operations
└── server.ts              # Main application entry point
```

## Deployment to fly.io

1. Install the fly.io CLI:
```bash
curl -L https://fly.io/install.sh | sh
```

2. Login to fly.io:
```bash
fly auth login
```

3. Launch the app (first time only):
```bash
fly launch
```

4. Set up Redis on fly.io:
```bash
fly redis create
```

5. Get the Redis connection details and set them as secrets:
```bash
fly secrets set REDIS_HOST=<your-redis-host>
fly secrets set REDIS_PORT=<your-redis-port>
fly secrets set REDIS_PASSWORD=<your-redis-password>
```

6. Deploy the application:
```bash
fly deploy
```

7. Monitor the deployment:
```bash
fly status
```

8. View logs:
```bash
fly logs
```

The application will be available at `https://load-tester.fly.dev` (or your custom domain if configured).

## Docker Build

To build the Docker image locally:
```bash
docker build -t load-tester .
```

To run the Docker container locally:
```bash
docker run -p 8080:8080 --env-file .env load-tester
``` 