import express from "express";
import {
    appointmentAdminCancel, 
    appointmentComplete, 
    appointmentDoctorCancel, 
    appointmentsAdmin, 
    appointmentsDoctor, 
    bookAppointment, 
    cancelAppointment, 
    listAppointment,
    // 👇 THÊM 2 CÁI NÀY VÀO
    getAppointmentDetails,  
    updatePaymentStatus     
} from "../controllers/bookingController.js";

import authAdmin from "../middlewares/authAdmin.js";
import authDoctor from "../middlewares/authDoctor.js";
import authUser from "../middlewares/authUser.js";

const appointmentRoute = express.Router()

// Các route cũ
appointmentRoute.get('/ad-appointments', authAdmin, appointmentsAdmin)
appointmentRoute.post('/ad-cancel-appointment', authAdmin, appointmentAdminCancel)
appointmentRoute.get('/doc-appointments',authDoctor, appointmentsDoctor)
appointmentRoute.post('/complete-appointment', authDoctor, appointmentComplete)
appointmentRoute.post('/doc-cancel-appointment', authDoctor, appointmentDoctorCancel)
appointmentRoute.post('/book-appointment', authUser, bookAppointment)
appointmentRoute.get('/user-appointments',authUser, listAppointment)
appointmentRoute.post('/cancel-appointment', authUser, cancelAppointment)

// 👇 API CHO PAYMENT SERVICE (QUAN TRỌNG)
// 1. Lấy thông tin giá tiền
appointmentRoute.get('/details/:appointmentId', getAppointmentDetails)

// 2. Cập nhật trạng thái "Đã thanh toán"
appointmentRoute.post('/update-payment', updatePaymentStatus)

export default appointmentRoute