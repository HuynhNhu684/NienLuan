import express from 'express';
import { createOrder, captureOrder } from '../controllers/paypalController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Frontend gọi API này để lấy OrderID (Có xác thực)
router.post('/create-order', authMiddleware, createOrder);

// Frontend gọi API này sau khi user bấm thanh toán xong
router.post('/capture-order', authMiddleware, captureOrder);

export default router;