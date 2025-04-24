import * as amqp from 'amqplib/callback_api';

const queue = 'task_queue';
const msg = process.argv.slice(2).join(' ') || "Hello World!";

amqp.connect('amqp://localhost', (error0, connection) => {
    if (error0) {
        throw error0;
    }

    connection.createChannel((error1, channel) => {
        if (error1) {
            throw error1;
        }

        channel.assertQueue(queue, {
            durable: true
        });

        channel.sendToQueue(queue, Buffer.from(msg), {
            persistent: true
        });

        console.log(" [x] Sent '%s'", msg);
    });
});
