import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";

import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const app = express();
const PORT = process.env.PORT || 3003;
const { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } = require('vnpay');
// Kết nối DB
connectDB();
connectCloudinary()


// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/user',userRouter)
app.post('/api/create-qr', async (req, res) =>{
  const vnpay = new VNPay({
    tmnCode:'OBWJUQHK',
    secureSecret:'82O89B73OYOP2KE79BUYKOATFZR761NF',
    vnpayHost: ' https://sandbox.vnpayment.vn',
    testMode: true , // tuy chon
    hashAlgorithm: 'SHA512', //tuy chon
    loggerFn: ignoreLogger, //tuy chon
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate()+1);

  const vnpayResponse = await vnpay.buildPaymentUrl({
    vnp_Amount: 50000,
    vnp_IpAddr: '127.0.0.1',
    vnp_TxnRef: 12345,
    vnp_OrderInfo: 12345,
    vnp_OrderType: ProductCode.Other,
    vnp_ReturnUrl:`http://localhost:3003/api/check-payment-vnpay`,
    vnp_Locale: VnpLocale.VN,
    vnp_CreateDate: dateFormat(new Date()),
    vnp_ExpireDate: dateFormat(tomorrow),
  });

  return res.status(201).json(vnpayResponse)
})

app.get('/api/check-payment-vnpay', (req,res) =>{
  console.log(req.query);
})

app.get("/", (req, res) => res.send("User Service is RUNNING!"));

app.listen(PORT, () => {
  console.log(`User Service: http://localhost:${PORT}`);
});