import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/mongodb.js';
import paypalRouter from './routes/paypalRoutes.js'; // Phải là paypalRoutes

const app = express();
const PORT = process.env.PORT || 3002;

connectDB();

app.use(express.json());
app.use(cors());

// ĐƯỜNG DẪN CHUẨN:
app.use('/payment', paypalRouter); 

app.get('/', (req, res) => res.send("Payment Service (PayPal) is Running..."));

app.listen(PORT, () => {
    console.log(`🚀 Payment Service running on http://localhost:${PORT}`);
});