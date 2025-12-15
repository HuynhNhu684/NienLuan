// import React from 'react';
// import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import { useContext } from 'react';
// import { AppContext } from '../context/AppContext';

// const PayPalPayment = ({ appointmentId, token, onSuccess }) => {
    
//     // Lấy config từ biến môi trường
//     const initialOptions = {
//         "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID,
//         currency: "USD",
//         intent: "capture",
//     };

//     const backendUrl = import.meta.env.VITE_BACKEND_URL_PAYMENT_SERVICE;

//     return (
//         <PayPalScriptProvider options={initialOptions}>
//             <PayPalButtons
//                 style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay" }}
                
//                 // 1. GỌI BACKEND ĐỂ TẠO ĐƠN (Backend tự lấy giá tiền)
//                 createOrder={async (data, actions) => {
//                     try {
//                         const response = await axios.post(
//                             `${backendUrl}/create-order`, 
//                             { appointmentId }, // Chỉ gửi ID, không gửi amount
//                             { headers: { Authorization: `Bearer ${token}` } }
//                         );
//                         return response.data.id; // Trả về Order ID cho PayPal
//                     } catch (error) {
//                         console.error("Lỗi tạo đơn:", error);
//                         toast.error("Không thể khởi tạo thanh toán");
//                         throw error;
//                     }
//                 }}

//                 // 2. KHI NGƯỜI DÙNG THANH TOÁN XONG
//                 onApprove={async (data, actions) => {
//                     try {
//                         const response = await axios.post(
//                             `${backendUrl}/capture-order`,
//                             { orderID: data.orderID, appointmentId },
//                             { headers: { Authorization: `Bearer ${token}` } }
//                         );

//                         if (response.data.success) {
//                             toast.success("Thanh toán thành công!");
//                             if (onSuccess) onSuccess(); // Reload lại danh sách
//                         }
//                     } catch (error) {
//                         console.error("Lỗi capture:", error);
//                         toast.error("Lỗi xử lý giao dịch");
//                     }
//                 }}

//                 // XỬ LÝ LỖI
//                 onError={(err) => {
//                     console.error("PayPal Error:", err);
//                     toast.error("Có lỗi xảy ra với PayPal");
//                 }}
//             />
//         </PayPalScriptProvider>
//     );
// };

// export default PayPalPayment;



import React from 'react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import axios from 'axios';
import { toast } from 'react-toastify';

const PayPalPayment = ({ appointmentId, token, onSuccess }) => {
    
    // LOG 1: Kiểm tra xem biến môi trường đã nhận chưa
    const backendUrl = import.meta.env.VITE_BACKEND_URL_PAYMENT_SERVICE;
    console.log("--- DEBUG FRONTEND ---");
    console.log("URL Backend:", backendUrl);
    console.log("Client ID:", import.meta.env.VITE_PAYPAL_CLIENT_ID);
    console.log("Appointment ID:", appointmentId);
    console.log("Token:", token ? "Có token" : "Không có token");

    const initialOptions = {
        "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID,
        currency: "USD",
        intent: "capture",
    };

    return (
        <PayPalScriptProvider options={initialOptions}>
            <PayPalButtons
                style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay" }}
                
                createOrder={async (data, actions) => {
                    try {
                        console.log("⏳ Đang gọi API tạo đơn...");
                        const response = await axios.post(
                            `${backendUrl}/create-order`, 
                            { appointmentId }, 
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        console.log("✅ Kết quả tạo đơn:", response.data);
                        return response.data.id; 
                    } catch (error) {
                        // LOG 2: In chi tiết lỗi ra màn hình Console
                        console.error("❌ LỖI TẠO ĐƠN:", error);
                        console.error("Chi tiết lỗi từ Backend:", error.response?.data);
                        
                        toast.error(error.response?.data?.message || "Lỗi khởi tạo thanh toán");
                        throw error;
                    }
                }}

                onApprove={async (data, actions) => {
                    try {
                        console.log("⏳ Đang xác nhận thanh toán...");
                        const response = await axios.post(
                            `${backendUrl}/capture-order`,
                            { orderID: data.orderID, appointmentId },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );

                        if (response.data.success) {
                            console.log("✅ Thanh toán thành công!");
                            toast.success("Thanh toán thành công!");
                            if (onSuccess) onSuccess(); 
                        }
                    } catch (error) {
                        console.error("❌ LỖI CAPTURE:", error);
                        console.error("Chi tiết lỗi:", error.response?.data);
                        toast.error("Lỗi xử lý giao dịch");
                    }
                }}
            />
        </PayPalScriptProvider>
    );
};

export default PayPalPayment;