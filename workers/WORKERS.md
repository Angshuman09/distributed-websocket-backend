# Worker (`worker.ts`) — Explanation

This file defines the **BullMQ worker** responsible for processing chat jobs from the queue and publishing the result back via Redis Pub/Sub.

---

#  Role of this file in the system

In your architecture:

* **WebSocket server** → receives messages from clients → adds jobs to queue
* **Queue (Redis)** → stores pending jobs
* **Worker (this file)** → processes jobs
* **Redis Pub/Sub** → sends results back to server

So this file is the **background processor** of your chat system.

---

#  Code Breakdown

```ts
import { Worker } from "bullmq"
import { connection } from "../../queue/dist/queue.js"
```

* `Worker` → BullMQ class that consumes jobs
* `connection` → shared Redis connection from queue module

---

#  Redis Pub/Sub publisher

```ts
const pub = connection.duplicate()
```

Why duplicate?

Redis clients cannot safely do **queue + pub/sub** on the same connection.

So we create a second connection for publishing results.

---

#  Worker creation

```ts
new Worker(
  "chat",
  async job => {
```

This creates a worker that listens to the **"chat" queue**.

Every time a job is added:

```ts
chatQueue.add("chat", { msg })
```

this worker receives it as `job`.

---

#  Job processing

```ts
if (job.name === "chat") {
  const { msg } = job.data
```

Each job has:

* `job.name` → job type
* `job.data` → payload

Example job:

```json
{
  "name": "chat",
  "data": { "msg": "Hello" }
}
```

---

# ⏱ Simulated heavy work

```ts
await new Promise(r => setTimeout(r, 500))
```

This simulates CPU‑heavy or slow work such as:

* AI processing
* PDF parsing
* database operations
* file conversion

In real systems, this could take seconds.

---

# 📤 Preparing result

```ts
const result = {
  msg,
  time: Date.now()
}
```

Worker attaches metadata before returning.

So processed message becomes:

```json
{
  "msg": "Hello",
  "time": 1730000000000
}
```

---

# 📡 Publish result to Redis

```ts
await pub.publish("chat-results", JSON.stringify(result))
```

Worker does **not talk directly to WebSocket clients**.

Instead:

Worker → Redis channel → WebSocket server → clients

This keeps services decoupled and scalable.