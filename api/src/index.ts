import express, { Express, Request, Response } from "express";
import amqp, { Connection } from "amqplib";
import mysql2, { Pool } from "mysql2/promise";
import dotenv from "dotenv";
import { validateIncomingEventType, listHooks } from "./queries";

dotenv.config();

const RABBIT_SERVICE = process.env.RABBIT_SERVICE || "";
const RABBIT_QUEUE = process.env.RABBIT_QUEUE || "";

const app: Express = express();
const port = process.env.PORT;
let connection: Connection;
let database: Pool;

const delay = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const connectSQL = async () => {
  try {
    console.log("Connecting to database");
    const conn = mysql2.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      port: parseInt(process.env.DB_PORT!, 10),
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      waitForConnections: true,
      namedPlaceholders: true,
      connectionLimit: 50,
      queueLimit: 0,
      insecureAuth: true,
    });

    database = conn;
  } catch (err) {
    console.log("Err : ", err);
    await delay(5000);
    connectSQL();
  }
};

/**
 * Connect to AMQP
 */
async function connectRabbit() {
  try {
    console.log("connecting to Rabbit");
    const rabbit = await amqp.connect(`amqp://${RABBIT_SERVICE}`);

    rabbit.on("close", async () => {
      setTimeout(() => connectRabbit(), 5000);
    });
    const initChannel = await rabbit.createChannel();
    await initChannel.assertQueue(RABBIT_QUEUE, { durable: false });
    connection = rabbit;
  } catch (err) {
    console.error("connect error : ", err);
    await delay(5000);
    connectRabbit();
  }
}

app.on("ready", () => {
  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
});

app.get("/status", async (_: Request, res: Response) => {
  return res.status(200).json({ status: "OK" });
});

app.get("/", async (req: Request, res: Response) => {
  try {
    if (!req.query.event) {
      return res.status(400).json({ error: "invalid event type" });
    }
    const event = req.query.event as string;
    const valid = await validateIncomingEventType(database, event.toUpperCase());
    if (!valid) {
      return res.status(400).json({ error: "invalid event type" });
    }
    const hooks = await listHooks(database, event.toUpperCase());
    const channel = await connection.createChannel();
    for (const hook of hooks) {
      console.log("Sending request - ", hook);
      const message = {
        id: hook.id,
        url: hook.url,
      };
      channel.sendToQueue(RABBIT_QUEUE, Buffer.from(JSON.stringify(message)));
    }

    res.status(200).json({ message: "success" });
  } catch (e) {
    console.error("Error: ", e);
    return res.status(500).json({ error: "internal server error" });
  }
});

/*
 * Initialise app
 */
(async function () {
  await connectSQL();
  console.log('database connected');
  await connectRabbit();
  console.log("channel connected");

  // trigger express to start listening for requests
  app.emit("ready");
})();
