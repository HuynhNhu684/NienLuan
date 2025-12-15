import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
    toEmail: { type: String, required: true },
    subject: { type: String, required: true },
    status: { type: String, enum: ['SUCCESS', 'FAILED'], default: 'SUCCESS' },
    error: { type: String },
    sentAt: { type: Date, default: Date.now }
});

const NotificationLog = mongoose.model('NotificationLog', logSchema);
export default NotificationLog;