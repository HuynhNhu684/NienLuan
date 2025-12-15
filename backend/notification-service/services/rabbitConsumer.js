import amqp from 'amqplib';
import { sendEmailNotification } from '../controllers/emailController.js';

const QUEUE_NAME = 'notification_queue';

const startConsumer = async () => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        const channel = await connection.createChannel();

        await channel.assertQueue(QUEUE_NAME, { durable: true });
        console.log(`🐰 Waiting for messages in ${QUEUE_NAME}...`);

        channel.consume(QUEUE_NAME, (msg) => {
            if (msg !== null) {
                const data = JSON.parse(msg.content.toString());
                console.log("📥 Received task:", data);

                // Gọi controller gửi mail
                sendEmailNotification(data);

                channel.ack(msg); // Xác nhận đã xử lý
            }
        });
    } catch (error) {
        console.error("❌ RabbitMQ Connect Error:", error);
        setTimeout(startConsumer, 5000); // Thử lại sau 5s nếu lỗi
    }
};

export default startConsumer;