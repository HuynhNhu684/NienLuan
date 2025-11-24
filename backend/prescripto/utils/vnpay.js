// backend/utils/vnpay.js
import { VNPay } from 'vnpay';

const vnpay = new VNPay({
  tmnCode: 'OBWJUQHK',
  secureSecret: '82O89B73OYOP2KE79BUYKOATFZR761NF',
  testMode: true,
  hashAlgorithm: 'SHA256', // BẮT BUỘC CHO SANDBOX
});

export default vnpay;