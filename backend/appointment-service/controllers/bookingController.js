import appointmentModel from "../models/appointmentModel.js";
import doctorModel from "../models/doctorModel.js";
import userModel from "../models/userModel.js";
import amqp from 'amqplib'; 

// --- HÀM HỖ TRỢ: BẮN TIN NHẮN SANG RABBITMQ ---
const sendToQueue = async (data) => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        const channel = await connection.createChannel();
        const queue = 'notification_queue'; 

        await channel.assertQueue(queue, { durable: true });
        
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)));
        console.log("🐰 Booking Service: Đã bắn tin nhắn sang Notification Service:", data.type);

        setTimeout(() => connection.close(), 500);
    } catch (error) {
        console.error("⚠️ Lỗi RabbitMQ (Booking):", error.message);
    }
};

// =======================================================
// API: Đặt lịch hẹn
// =======================================================
const bookAppointment = async (req, res) => {
    try {
        const { userId, docId, slotDate, slotTime } = req.body;

        const docData = await doctorModel.findById(docId).select("-password");
        if (!docData.available) {
            return res.json({ success: false, message: 'Doctor not available' });
        }

        let slots_booked = docData.slots_booked;

        // --- KIỂM TRA VÀ CẬP NHẬT SLOT ---
        if (slots_booked[slotDate]) {
            // Nếu ngày đó đã có lịch, kiểm tra xem giờ đó đã bị đặt chưa
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({ success: false, message: 'Slot not available' });
            }
        } else {
            // Nếu ngày đó chưa có lịch nào, tạo mảng rỗng
            slots_booked[slotDate] = [];
        }

        // 🔥 FIX QUAN TRỌNG: Thêm giờ vừa đặt vào danh sách đã đặt 🔥
        slots_booked[slotDate].push(slotTime);

        const userData = await userModel.findById(userId).select("-password");
        
        // Lưu ý: dòng delete này chỉ xóa trên biến tạm memory, không ảnh hưởng DB, 
        // nhưng nếu bạn lưu docData xuống DB thì sẽ mất dữ liệu. 
        // Ở logic dưới bạn không lưu docData mà chỉ lưu slots_booked nên dòng này an toàn (nhưng hơi thừa).
        delete docData.slots_booked; 

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now()
        };

        const newAppointment = new appointmentModel(appointmentData);
        await newAppointment.save();

        await doctorModel.findByIdAndUpdate(docId, { slots_booked });

        // --- GỌI HÀM GỬI RABBITMQ ---
        if(userData) {
            await sendToQueue({
                type: 'APPOINTMENT_CONFIRMED', 
                email: userData.email,         
                userName: userData.name,
                doctorName: docData.name,      
                appointmentId: newAppointment._id,
                date: slotDate,
                time: slotTime
            });
        }

        res.json({ success: true, message: 'Appointment Booked' });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};
// =======================================================
// API: Hủy lịch (KHÁCH HỦY - Logic bình thường)
// =======================================================
const cancelAppointment = async (req, res) => {
    try {
        // 👇 SỬA 1: Lấy userId chứ không phải docId
        const { userId, appointmentId } = req.body; 

        const appointmentData = await appointmentModel.findById(appointmentId);

        // 👇 SỬA 2: Kiểm tra xem userId này có phải chủ lịch hẹn không
        if (appointmentData.userId.toString() !== userId) {
            return res.json({ success: false, message: 'Unauthorized action' });
        }

        // 2. Không cho hủy nếu đã thanh toán
        if (appointmentData.payment) {
            return res.json({ 
                success: false, 
                message: 'Cannot cancel: Patient has already paid.' 
            });
        }

        // 3. Cập nhật DB: Hủy lịch
        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

        // 4. Cập nhật DB: Trả Slot cho bác sĩ
        const { docId, slotDate, slotTime } = appointmentData;
        const docData = await doctorModel.findById(docId);
        let slots_booked = docData.slots_booked;

        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime);
        await doctorModel.findByIdAndUpdate(docId, { slots_booked });

        // 5. Gửi Mail xác nhận hủy
        const userData = await userModel.findById(userId);

        if (userData) {
            await sendToQueue({
                type: 'APPOINTMENT_CANCELLED',
                email: userData.email,
                userName: userData.name,
                appointmentId: appointmentId,
                doctorName: docData.name,
                date: slotDate,
                time: slotTime
            });
            console.log("📢 Đã gửi lệnh RabbitMQ: APPOINTMENT_CANCELLED (Khách hủy)");
        }

        res.json({ success: true, message: 'Appointment Cancelled' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// =======================================================
// CÁC HÀM KHÁC
// =======================================================

const listAppointment = async (req, res) => {
    try {
        const { userId } = req.body;
        const appointments = await appointmentModel.find({ userId });
        res.json({ success: true, appointments });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const appointmentsAdmin = async (req, res) => {
    try {
        const appointments = await appointmentModel.find({});
        res.json({ success: true, appointments });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const appointmentAdminCancel = async (req, res) => {
    try {
        const { appointmentId } = req.body;

        const appointmentData = await appointmentModel.findById(appointmentId);
        if (!appointmentData) {
            return res.json({ success: false, message: 'Appointment not found' });
        }

        // 🔥 FIX: Không cho Admin hủy nếu đã thanh toán
        if (appointmentData.payment) {
            return res.json({
                success: false,
                message: 'Cannot cancel: Appointment has already been paid.'
            });
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

        const { docId, slotDate, slotTime } = appointmentData;
        const docData = await doctorModel.findById(docId);

        if (docData) {
            let slots_booked = docData.slots_booked;
            if (slots_booked[slotDate]) {
                slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime);
                await doctorModel.findByIdAndUpdate(docId, { slots_booked });
            }
        }

        const userData = await userModel.findById(appointmentData.userId);
        if (userData) {
            await sendToQueue({
                type: 'APPOINTMENT_CANCELLED',
                email: userData.email,
                userName: userData.name,
                appointmentId,
                doctorName: docData ? docData.name : 'Doctor',
                date: slotDate,
                time: slotTime,
                reason: "Cancelled by Administrator"
            });
        }

        res.json({ success: true, message: 'Appointment Cancelled by Admin' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const appointmentsDoctor = async (req, res) => {
    try {
        const { docId } = req.body;
        const appointments = await appointmentModel.find({ docId });
        res.json({ success: true, appointments });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


// ====================================================================
// API: BÁC SĨ HỦY LỊCH (CÓ VOUCHER)
// ====================================================================
const appointmentDoctorCancel = async (req, res) => {
    try {
        const { docId, appointmentId } = req.body;
        const appointmentData = await appointmentModel.findById(appointmentId);

        // 1. Kiểm tra quyền sở hữu
        if (appointmentData.docId && appointmentData.docId.toString() !== docId) {
            return res.json({ success: false, message: 'Unauthorized action' });
        }

        // 2. CHECK QUAN TRỌNG: Nếu đã thanh toán thì không cho hủy
        if (appointmentData.payment) {
            return res.json({ 
                success: false, 
                message: 'Cannot cancel: Patient has already paid.' 
            });
        }

        // 3. Tiến hành hủy
        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

        const { slotDate, slotTime } = appointmentData;
        const docData = await doctorModel.findById(docId);
        let slots_booked = docData.slots_booked;

        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime);
        await doctorModel.findByIdAndUpdate(docId, { slots_booked });

        // 👇👇 BÁC SĨ HỦY -> DÙNG TYPE 'DOCTOR_CANCELLED' (Có Voucher) 👇👇
        const userData = await userModel.findById(appointmentData.userId);
        if (userData) {
            await sendToQueue({
                type: 'DOCTOR_CANCELLED', // <--- Cái này mới là mail xin lỗi + Voucher
                email: userData.email,
                userName: userData.name,
                appointmentId: appointmentId,
                doctorName: docData.name,
                date: slotDate,
                time: slotTime
            });
            console.log("📢 Đã gửi lệnh RabbitMQ: DOCTOR_CANCELLED");
        }
        // 👆👆 ---------------------------------------------------- 👆👆

        res.json({ success: true, message: 'Appointment Cancelled' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};
// ====================================================================

const appointmentComplete = async (req, res) => {
    try {
        const { docId, appointmentId } = req.body;
        const appointmentData = await appointmentModel.findById(appointmentId);

        if (appointmentData && appointmentData.docId.toString() === docId) {
            await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true });
            return res.json({ success: true, message: 'Appointment Completed' });
        }
        res.json({ success: false, message: 'Mark Failed' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const getAppointmentDetails = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const appointment = await appointmentModel.findById(appointmentId);
        if (!appointment) return res.json({ success: false, message: 'Appointment not found' });
        res.json({ success: true, appointment });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const updatePaymentStatus = async (req, res) => {
    try {
        const { appointmentId, paymentSuccess } = req.body; 
        if (paymentSuccess) {
            await appointmentModel.findByIdAndUpdate(appointmentId, { payment: true });
            return res.json({ success: true, message: 'Payment updated.' });
        }
        res.json({ success: false, message: 'Payment failed.' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error updating payment status" });
    }
};

export { 
    appointmentsAdmin, 
    appointmentAdminCancel, 
    appointmentsDoctor,
    appointmentDoctorCancel,
    appointmentComplete,
    bookAppointment,
    listAppointment,
    cancelAppointment,
    getAppointmentDetails,
    updatePaymentStatus
};