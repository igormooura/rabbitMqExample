import express from 'express';
import cors from "cors";
import amqp, { Channel, Connection } from "amqplib";


const app = express();
const QUEUE_NAME = 'mensagens'

app.use(cors());
app.use(express.json());

let channel: Channel;
let connection: Connection;

async function connectRabbitMQ() {
    connection = await amqp.connect("amqp://localhost");
    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME)
    console.log("connected to rabbitmq")
}