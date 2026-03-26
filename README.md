# Distributed WebSocket Backend

This project demonstrating distributed systems concepts using WebSocket, Redis pub/sub, and job queues. This project shows how to build a backend architecture where multiple components communicate asynchronously through message queues and pub/sub patterns.

## Architecture

![System Architecture](./public/architecture.png)

### Components

1. **WebSocket Server** - Handles WebSocket connections, broadcasts messages, and queues jobs
2. **Redis Pub/Sub** - Enables communication between different processes
3. **Job Queue (BullMQ)** - Manages background tasks asynchronously
4. **Worker Process** - Processes queued jobs and publishes results back via Redis

## Tech Stack

- **Express** - Web framework
- **ws** - WebSocket implementation
- **BullMQ** - Redis-based job queue
- **ioredis** - Redis client for Node.js
- **redis** - Redis client
- **Docker** - For running Redis locally

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Docker (for Redis)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Angshuman09/distributed-websocket-backend.git
cd distributed-websocket-backend
```

2. Start Redis with Docker:
```bash
docker run -d -p 6379:6379 redis:latest
```

3. Install dependencies for each component:
```bash
# Server dependencies (express, ws)
cd server
npm install

# Queue dependencies (bullmq)
cd ../queue
npm install

# Worker dependencies (bullmq, ioredis, redis)
cd ../workers
npm install
```

### Running the System

Start each component in separate terminal windows:

```bash
# Terminal 1: WebSocket server
cd server
npm run dev

# Terminal 2: Queue processor
cd queue
npm run dev

# Terminal 3: Worker process
cd workers
npm run dev
```

### Example Communication

![WebSocket Communication Example](./public/results.png)

The screenshot shows the message flow:
- Client sends: `{"msg":"hi I am here :)","time":1772710371837}`
- Client sends: `{"msg":"good to see u are here ","time":1772710399261}`
- Server broadcasts: `hi I am here :)`

## How It Works

### WebSocket Server (Express + ws)

The server component:
- Creates a WebSocket server on port 3000
- Handles client connections and disconnections
- Broadcasts incoming messages to all connected clients
- Adds jobs to the BullMQ queue for processing

### Job Queue (BullMQ)

The queue system:
- Stores jobs in Redis
- Manages job state (waiting, active, completed, failed)
- Delivers jobs to worker processes
- Provides job persistence and retry mechanisms

### Worker Process (BullMQ + ioredis/redis)

The worker:
- Listens for jobs from the queue
- Processes job data (message transformation, computation, etc.)
- Publishes results to Redis pub/sub channel
- Operates independently from the WebSocket server

### Redis Pub/Sub

Redis enables:
- Communication between worker and WebSocket server
- Decoupled architecture (worker doesn't need to know about clients)
- Message broadcasting across different processes

## Project Structure

```
distributed-websocket-backend/
├── server/           # WebSocket server implementation
├── queue/            # Job queue management
├── workers/          # Background worker processes
├── public/           # Static assets and documentation
└── README.md         # Project documentation
```

## Message Flow

1. **Client sends message** → WebSocket server receives it
2. **Server broadcasts** → Message sent to all connected clients
3. **Server adds job** → Job queued for processing
4. **Queue delivers** → Job sent to available worker
5. **Worker processes** → Executes job logic
6. **Worker publishes** → Result sent to Redis pub/sub
7. **Server subscribes** → Receives processed result from Redis
8. **Server broadcasts** → Final result sent to clients

## Learning Resources

To understand this project better, learn about:
- **WebSocket Protocol** - Real-time bidirectional communication
- **Redis** - In-memory data structures and pub/sub messaging
- **Job Queues** - Background task processing patterns
- **Distributed Systems** - How independent services communicate

## Author

**Angshuman09**

- GitHub: [@Angshuman09](https://github.com/Angshuman09)
