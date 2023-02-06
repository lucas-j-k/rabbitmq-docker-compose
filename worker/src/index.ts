import amqp, { ConsumeMessage, Connection } from "amqplib";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();
let connection: Connection;

const RABBIT_SERVICE = process.env.RABBIT_SERVICE || "";
const RABBIT_QUEUE = process.env.RABBIT_QUEUE || "";
const connectTriesLimit = 5;

type HookPayload = {
  id: number;
  url: string;
};

const delay = async (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const connect = async () => {
  for (let i = 1; i <= connectTriesLimit; i += 1) {
    try {
      if (connection) continue;
      const rabbit = await amqp.connect(`amqp://${RABBIT_SERVICE}`);
      rabbit.on("close", async () => {
        setTimeout(() => connect(), 5000);
      });
      const initChannel = await rabbit.createChannel();
      await initChannel.assertQueue(RABBIT_QUEUE, { durable: false });
      connection = rabbit;
    } catch (err) {
      console.log('connection error : ', err);
      await delay(5000);
      continue;
    }
  }
  if (!connection) {
    console.log('Unable to connect to rabbit - closing');
    process.exit(1);
  }
}

/**
 * Initialise listener
 */
const init = async () => {
  await connect();
  
  const channel = await connection.createChannel();

  await channel.assertQueue(RABBIT_QUEUE, {
    autoDelete: false,
    durable: false,
  });
  channel.prefetch(1);
  console.log('Channel listening for messages');

  channel.consume(RABBIT_QUEUE, async (msg: ConsumeMessage | null) => {
    if (msg) {
      try {
        const hook = JSON.parse(msg.content.toString()) as HookPayload;
        console.log("posting to hook : ", hook);
        const response = await axios.post(hook.url);
        console.log("Post response : ", response.status, response.statusText);
        channel.ack(msg);
      } catch (err) {
        console.log("Error making HTTP request: ", err);
        channel.ack(msg); // Todo : nack/retry logic
      }
    }
  });
};

init();
