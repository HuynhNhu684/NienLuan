import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    appointmentId: { type: String, required: true },
    userId: { type: String, required: true },
    txnRef: { type: String, required: true }, // Mã đơn hàng PayPal
    amount: { type: Number, required: true }, // Số tiền (USD hoặc VND đã quy đổi)
    status: { type: String, default: 'COMPLETED' },
    date: { type: Date, default: Date.now }
});

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;