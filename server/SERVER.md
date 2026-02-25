# Server (WebSocket + Queue Bridge) Architecture Explanation

This file is the **real-time gateway** of the chat system.
It connects three parts:

* WebSocket clients (browser / frontend)
* Redis Pub/Sub (results from workers)
* BullMQ queue (jobs to workers)

So the server acts as a **bridge between clients and background workers**.

---

## 1. Create Express App

```ts
const app = express()
```

Creates a basic HTTP app.
Right now we don’t use routes — but Express lets us expand later.

---

## 2. Create HTTP Server

```ts
const httpServer = createServer(app)
```

Why needed?

Because WebSocket servers attach to a **raw HTTP server**, not directly to Express.

Architecture:

```
Express → HTTP Server → WebSocket Server
```

---

## 3. Create WebSocket Server

```ts
const wss = new WebSocketServer({
  server: httpServer
})
```

This means:

 WebSocket and HTTP share the same port (3000)

So:

* HTTP → future REST APIs
* WS → realtime chat

Same server.

---

# Redis Pub/Sub (Worker → Server → Clients)

Workers publish processed chat messages to Redis.

Server subscribes and forwards them to clients.

---

## 4. Create Redis Subscriber

```ts
const sub = connection.duplicate()
```

Important concept:

Redis connections cannot be used for both:

* normal commands
* subscriptions

So we duplicate.

```
Main Redis → queue ops
Sub Redis  → pub/sub
```

---

## 5. Subscribe to Worker Results

```ts
sub.subscribe("chat-results")
```

Workers publish results like:

```
pub.publish("chat-results", JSON.stringify(result))
```

So server listens to that channel.

---

## 6. Forward Results to All Clients

```ts
sub.on("message", (_: any, msg: any) => {
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(msg)
    }
  })
})
```

Flow:

```
Worker → Redis → Server → WebSocket → All Clients
```

Why loop clients?

Because this is a broadcast chat.

If you want rooms later → filter clients.

---

# WebSocket Client Handling

## 7. Track Connections

```ts
let count = 0;
```

Simple metric: number of connected users.

---

## 8. On Client Connect

```ts
wss.on("connection", ws => {
  count++;
  console.log(`client connected, total clients: ${count}`);
```

Every browser connection triggers this.

---

## 9. On Client Message

```ts
ws.on("message", async message => {
  const msg = message.toString()
  await chatQueue.add("chat", { msg })
})
```

Critical architecture step

Client message is **NOT processed here**.

Instead:

```
Client → Server → Queue → Worker
```

Why?

Scalability.

Server stays lightweight.
Workers handle heavy logic.

---

# Start Server

```ts
httpServer.listen(3000, () => {
  console.log("chat server running ws://localhost:3000")
})
```

Now both HTTP and WS run on:

```
ws://localhost:3000
```