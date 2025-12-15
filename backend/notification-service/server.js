import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/mongodb.js';
import startConsumer from './services/rabbitConsumer.js';

const app = express();
const PORT = process.env.PORT || 3003;

// Kết nối DB & RabbitMQ
connectDB();
startConsumer();

app.use(express.json());
app.use(cors());

// Health Check API
app.get('/', (req, res) => res.send("Notification Service is Running..."));

app.listen(PORT, () => {
    console.log(`🚀 Notification Service running on port ${PORT}`);
});