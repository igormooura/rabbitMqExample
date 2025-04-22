const express = require("express");
const amqp = require("amqplib");
const cors = require("cors");

const app = express();
const PORT = 3000;
const RABBITMQ_URL = "amqp://localhost";
const QUEUE = "messages";

let channel = null;
let connection = null;

async function connectRabbitMQ() {
  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE, { durable: false });

    console.log("Conectado ao RabbitMQ");
    
    channel.consume(QUEUE, (msg) => {
      if (msg) {
        const message = msg.content.toString();
        console.log("Mensagem recebida", message);
        channel.ack(msg); // Acknowledge da mensagem
      }
    });

  } catch (error) {
    console.error("Falha ao conectar no RabbitMQ:", error);
  }
}

connectRabbitMQ();

app.use(cors());
app.use(express.json());

app.post("/send", async(req, res) =>{
    const {message} = req.body

    try{
        channel.sendToQueue(QUEUE, Buffer.from(message)); // envia pra fila
        res.status.json({status: "Message sent"})
    } catch (error) {
        console.error("error:", error)
    }
});

