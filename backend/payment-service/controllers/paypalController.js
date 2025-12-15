import axios from 'axios';
import Payment from '../models/Payment.js';

// ... (Giữ nguyên hàm getPayPalAccessToken bên trên) ...
const getPayPalAccessToken = async () => {
    // ... code cũ giữ nguyên ...
    console.log("🔄 Đang lấy Token PayPal...");
    const auth = Buffer.from(
        process.env.PAYPAL_CLIENT_ID + ":" + process.env.PAYPAL_CLIENT_SECRET
    ).toString("base64");

    try {
        const response = await axios.post(
            `${process.env.PAYPAL_API_URL}/v1/oauth2/token`,
            "grant_type=client_credentials",
            { headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" } }
        );
        console.log("✅ Đã lấy được Token PayPal");
        return response.data.access_token;
    } catch (error) {
        console.error("❌ Lỗi lấy Token PayPal:", error.response?.data || error.message);
        throw new Error("Không thể xác thực với PayPal (Kiểm tra Client ID / Secret)");
    }
};

// ==========================================
// 2. API TẠO ĐƠN HÀNG (CREATE ORDER)
// ==========================================
export const createOrder = async (req, res) => {
    console.log("\n----- BẮT ĐẦU TẠO ĐƠN -----");
    try {
        const { appointmentId } = req.body;
        console.log("1. Nhận Appointment ID:", appointmentId);

        // --- GỌI BOOKING SERVICE ---
        const bookingUrl = `${process.env.BOOKING_SERVICE_URL}/details/${appointmentId}`;
        console.log("2. Đang gọi Booking Service tại:", bookingUrl);

        let bookingRes;
        try {
            bookingRes = await axios.get(bookingUrl);
        } catch (err) {
            console.error("❌ LỖI GỌI BOOKING SERVICE:", err.message);
            if (err.code === 'ECONNREFUSED') {
                console.error("👉 Server Booking chưa chạy hoặc sai Port!");
            } else if (err.response?.status === 404) {
                console.error("👉 Sai đường dẫn API (Route) bên Booking Service!");
            }
            return res.status(500).json({ success: false, message: "Không kết nối được Booking Service" });
        }

        if (!bookingRes.data.success) {
            console.error("❌ Booking Service trả về lỗi logic:", bookingRes.data);
            return res.status(404).json({ success: false, message: "Không tìm thấy lịch hẹn trong DB" });
        }

        const appointment = bookingRes.data.appointment;
        
        // ========== ĐOẠN ĐÃ SỬA ========== 
        // 1. Lấy thẳng giá tiền từ DB (Vì DB giờ là USD rồi)
        // 2. Không nhân 1000, Không chia 25000 nữa
        const feesUSD = appointment.amount; 

        console.log("3. Giá thanh toán (USD):", feesUSD);
        // =================================

        // --- GỌI PAYPAL ---
        const accessToken = await getPayPalAccessToken();
        const orderData = {
            intent: "CAPTURE",
            purchase_units: [{
                reference_id: appointmentId,
                amount: { 
                    currency_code: "USD", 
                    value: feesUSD.toString() // Chuyển sang chuỗi để gửi PayPal
                },
                description: `Thanh toan lich hen ${appointmentId}`
            }]
        };

        const paypalRes = await axios.post(
            `${process.env.PAYPAL_API_URL}/v2/checkout/orders`,
            orderData,
            { headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" } }
        );

        console.log("✅ Tạo đơn PayPal thành công. Order ID:", paypalRes.data.id);
        res.json({ id: paypalRes.data.id });

    } catch (error) {
        console.error("❌ LỖI NGHIÊM TRỌNG (CREATE ORDER):", error.message);
        if (error.response) console.error("Chi tiết từ PayPal:", error.response.data);
        res.status(500).json({ success: false, message: "Lỗi server tạo đơn hàng" });
    }
};

// ... (Giữ nguyên hàm captureOrder bên dưới) ...
export const captureOrder = async (req, res) => {
    console.log("\n----- BẮT ĐẦU CAPTURE -----");
    try {
        const { orderID, appointmentId } = req.body;
        console.log("1. Nhận Order ID:", orderID);

        const accessToken = await getPayPalAccessToken();

        // --- TRỪ TIỀN TRÊN PAYPAL ---
        const captureRes = await axios.post(
            `${process.env.PAYPAL_API_URL}/v2/checkout/orders/${orderID}/capture`,
            {},
            { headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" } }
        );

        const captureData = captureRes.data;
        if (captureData.status === "COMPLETED") {
            console.log("✅ PayPal Capture thành công!");

            // --- LƯU LỊCH SỬ VÀO DB ---
            const amountPaid = captureData.purchase_units[0].payments.captures[0].amount.value;
            await Payment.create({
                appointmentId,
                userId: req.userId || "guest",
                txnRef: captureData.id,
                amount: amountPaid
            });
            console.log("✅ Đã lưu Payment vào DB");

            // --- CẬP NHẬT TRẠNG THÁI BÊN BOOKING ---
            try {
                await axios.post(`${process.env.BOOKING_SERVICE_URL}/update-payment`, {
                    appointmentId: appointmentId,
                    paymentSuccess: true
                });
                console.log("✅ Đã update trạng thái Booking");
            } catch (err) {
                console.error("⚠️ Lỗi update Booking (Không ảnh hưởng tiền):", err.message);
            }

            return res.json({ success: true, message: "Thanh toán thành công!", data: captureData });
        } else {
            console.error("❌ PayPal chưa hoàn tất:", captureData.status);
            return res.status(400).json({ success: false, message: "Thanh toán chưa hoàn tất" });
        }

    } catch (error) {
        console.error("❌ LỖI CAPTURE:", error.message);
        if (error.response) console.error("Chi tiết từ PayPal:", error.response.data);
        res.status(500).json({ success: false, message: "Lỗi xử lý thanh toán" });
    }
};