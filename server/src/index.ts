import express from "express"
import { createServer } from "http"
import { WebSocketServer } from "ws"
import { chatQueue, connection } from "../../queue/dist/queue.js"

const app = express()

const httpServer = createServer(app)

const wss = new WebSocketServer({
  server: httpServer
})

const sub = connection.duplicate()
sub.subscribe("chat-results")

sub.on("message", (_: any, msg: any) => {
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(msg)
    }
  })
})

let count = 0;

wss.on("connection", ws => {
    count++;
    console.log(`client connected, total clients: ${count}`);
  ws.on("message", async message => {
    const msg = message.toString()
    await chatQueue.add("chat", { msg })
  })
})

httpServer.listen(3000, () => {
  console.log("chat server running ws://localhost:3000")
})