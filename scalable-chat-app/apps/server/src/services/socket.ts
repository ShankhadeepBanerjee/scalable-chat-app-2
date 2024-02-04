import { Server } from "socket.io";
import Redis from "ioredis";
import prismaClient from "./prisma";
import { produceMessage } from "./kafka";

const pub = new Redis({
  host: "redis-3935722c-next-node-chat-app.a.aivencloud.com",
  port: 18566,
  username: "default",
  password: "AVNS_WdPrwldMpZpJ8wTY1C2",
});

const sub = new Redis({
  host: "redis-3935722c-next-node-chat-app.a.aivencloud.com",
  port: 18566,
  username: "default",
  password: "AVNS_WdPrwldMpZpJ8wTY1C2",
});

class SocketService {
  private _io: Server;
  constructor() {
    console.log("SocketService created");
    this._io = new Server({
      cors: {
        allowedHeaders: "*",
        origin: "*",
      },
    });

    sub.subscribe("MESSAGES");
  }

  public initListeners() {
    const io = this._io;
    console.log("Init socket listeners");

    io.on("connect", (socket) => {
      console.log("Socket connected", socket.id);

      socket.on("event:message", async ({ message }: { message: string }) => {
        console.log("New message", message);
        await pub.publish("MESSAGES", JSON.stringify({ message }));
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected");
      });
    });

    sub.on("message", async (channel, message) => {
      if (channel === "MESSAGES") {
        console.log("Sending message", message);
        io.emit("message", message);
        await produceMessage(message);
        console.log('Message produced in kafka');
      }
    });
  }

  get io() {
    return this._io;
  }
}

export default SocketService;
