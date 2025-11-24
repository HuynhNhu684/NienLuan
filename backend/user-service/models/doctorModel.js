import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
    name: { type: String, required: true },       // Tên bác sĩ
    email: { type: String, required: true, unique: true }, // Email (duy nhất)
    password: { type: String, required: true },       // Mật khẩu
    image: { type: String, required: true },       // Ảnh đại diện
    speciality: { type: String, required: true },       // Chuyên khoa
    degree: { type: String, required: true },       // Bằng cấp
    experience: { type: String, required: true },       // Kinh nghiệm
    about: { type: String, required: true },       // Giới thiệu bản thân
    available: { type: Boolean, default: true },      // Có đang hoạt động hay không
    fees: { type: Number, required: true },       // Phí khám
    address: { type: Object, required: true },       // Địa chỉ (dạng object)
    date: { type: Number, required: true },       // Ngày tạo hoặc ngày tham chiếu nào đó
    slots_booked: { type: Object, default: {} }           // Các slot (lịch hẹn) đã được đặt
}, { minimize: false });

const doctorModel = mongoose.models.doctor || mongoose.model('doctor', doctorSchema);
export default doctorModel;
