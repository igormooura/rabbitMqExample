import { config } from "dotenv";
import amqp, { Channel } from "amqplib";

export const createMessageChannel = async (): Promise<Channel | null> => {
    config();

    try {
        const connection = await amqp.connect(process.env.AMQP_SERVER as string);
        const channel = await connection.createChannel();
        await channel.assertQueue(process.env.QUEUE_NAME as string);
        console.log('Connected to RabbitMQ');

        return channel;

    } catch (err) {
        console.log("Error while trying to connect to RabbitMQ:", err);
        return null;
    }
};
