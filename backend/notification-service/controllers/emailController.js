import nodemailer from 'nodemailer';
import NotificationLog from '../models/NotificationLog.js';

// Cấu hình gửi mail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// --- HÀM FORMAT NGÀY ---
const formatDate = (dateString) => {
    if (!dateString) return '';
    return dateString.toString().replace(/_/g, '/');
};

// --- HÀM TẠO GIAO DIỆN EMAIL (STYLE CORPORATE) ---
const getEmailTemplate = (type, data) => {
    const { appointmentId, doctorName, date, time, userName } = data;
    const formattedDate = formatDate(date);
    
    // Màu thương hiệu (Xanh Prescripto)
    const brandColor = "#0F67B1"; 

    // Nội dung động
    let subjectHeader = "";
    let bodyText = "";
    let callToAction = "";
    let noteBoxContent = ""; // Nội dung trong khung lưu ý

    if (type === 'APPOINTMENT_CANCELLED') {
        // --- TRƯỜNG HỢP 1: KHÁCH TỰ HỦY ---
        subjectHeader = "XÁC NHẬN HỦY LỊCH HẸN";
        bodyText = `Hệ thống đã ghi nhận yêu cầu hủy lịch khám của Quý khách. Lịch hẹn #${appointmentId.slice(-6).toUpperCase()} đã được hủy thành công trên hệ thống.`;
        callToAction = "Nếu Quý khách muốn đặt lại lịch, vui lòng truy cập website hoặc liên hệ tổng đài.";
        noteBoxContent = `<strong>⚠️ LƯU Ý:</strong><br> ${callToAction}`;

    } else if (type === 'DOCTOR_CANCELLED') {
        // --- TRƯỜNG HỢP 2: BÁC SĨ HỦY (MỚI THÊM) ---
        subjectHeader = "THÔNG BÁO THAY ĐỔI LỊCH KHÁM";
        bodyText = `Kính gửi Quý khách,<br><br>
        Chúng tôi vô cùng tiếc phải thông báo rằng lịch hẹn khám bệnh của Quý khách <strong>(Mã: #${appointmentId.slice(-6).toUpperCase()})</strong> đã bị hủy do Bác sĩ phụ trách có lịch trình đột xuất không thể tránh khỏi.<br><br>
        Chúng tôi thành thật xin lỗi vì sự bất tiện này và mong Quý khách thông cảm.`;
        
        // Phần đền bù (Voucher)
        noteBoxContent = `
            <strong>🎁 QUÀ TẶNG ĐỀN BÙ & XIN LỖI:</strong><br>
            Để tạ lỗi vì sự thay đổi này, Prescripto xin gửi tặng Quý khách ưu đãi <strong>GIẢM 10%</strong> cho lần khám tiếp theo.<br>
            <br>
            👉 <em>Vui lòng xuất trình Email này tại quầy lễ tân khi đến khám để được áp dụng ưu đãi.</em>
        `;
    
    } else {
        // --- TRƯỜNG HỢP 3: ĐẶT LỊCH THÀNH CÔNG ---
        subjectHeader = "XÁC NHẬN ĐẶT LỊCH KHÁM";
        bodyText = "Cảm ơn Quý khách đã tin tưởng lựa chọn Prescripto. Chúng tôi xin xác nhận lịch hẹn khám bệnh của Quý khách với thông tin chi tiết dưới đây:";
        noteBoxContent = `
            <strong>⚠️ LƯU Ý QUAN TRỌNG:</strong><br>
            Vui lòng đến sớm trước <strong>15 phút</strong> so với giờ hẹn để hoàn tất thủ tục hành chính.<br>
            Quý khách vui lòng mang theo email này khi đến phòng khám để thuận tiện cho việc check-in.
        `;
    }

    // HTML Template
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #2c3e50; margin: 0; padding: 0; }
            .brand-header { color: ${brandColor}; font-size: 20px; font-weight: 700; text-transform: uppercase; margin-bottom: 10px; border-bottom: 2px solid ${brandColor}; padding-bottom: 10px; display: inline-block; }
            .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; max-width: 600px; }
            .info-table td { padding: 8px 0; vertical-align: top; }
            .label-col { width: 140px; color: #7f8c8d; font-weight: 500; }
            .value-col { font-weight: 600; color: #000; }
            .note-box { background-color: #f8f9fa; border-left: 4px solid ${brandColor}; padding: 15px; font-size: 13px; color: #555; margin: 25px 0; }
            .signature { margin-top: 30px; font-weight: bold; }
            .legal-footer { margin-top: 40px; border-top: 1px solid #eee; padding-top: 15px; font-size: 11px; color: #95a5a6; font-style: italic; text-align: justify; line-height: 1.4; max-width: 600px; }
            a { color: ${brandColor}; text-decoration: none; }
        </style>
    </head>
    <body>
        <div class="brand-header">PRESCRIPTO MEDICAL</div>

        <p>Kính gửi: <strong>${userName || 'Quý Khách hàng'}</strong>,</p>

        <p>${bodyText}</p>

        <table class="info-table">
            <tr>
                <td class="label-col">Mã hồ sơ:</td>
                <td class="value-col">#${appointmentId ? appointmentId.slice(-6).toUpperCase() : 'N/A'}</td>
            </tr>
            <tr>
                <td class="label-col">Bác sĩ:</td>
                <td class="value-col">${doctorName}</td>
            </tr>
            <tr>
                <td class="label-col">Ngày hẹn cũ:</td>
                <td class="value-col">${formattedDate}</td>
            </tr>
            <tr>
                <td class="label-col">Thời gian:</td>
                <td class="value-col" style="color: ${brandColor}; font-size: 15px;">${time}</td>
            </tr>
        </table>

        <div class="note-box">
            ${noteBoxContent}
        </div>

        <div class="signature">
            Trân trọng,<br>
            <span style="color: ${brandColor};">Phòng Chăm sóc Khách hàng</span><br>
            Hệ thống Y tế Prescripto
        </div>

        <div class="legal-footer">
            <strong>Thông báo bảo mật:</strong> Email này chứa thông tin bảo mật của Hệ thống Y tế Prescripto. Mọi hành vi sao chép hoặc sử dụng trái phép đều bị nghiêm cấm.
        </div>
    </body>
    </html>
    `;
};

// --- HÀM GỬI EMAIL ---
export const sendEmailNotification = async (data) => {
    // Kiểm tra dữ liệu đầu vào
    if (!data || !data.email) {
        console.error("❌ LỖI: Thiếu email nhận hoặc dữ liệu rỗng!");
        return;
    }

    const { email, type } = data;

    console.log("-------------------------------------------------");
    console.log(`📨 Đang chuẩn bị gửi mail loại: [${type}]`);
    console.log(`👉 Tới: ${email}`);
    
    const htmlContent = getEmailTemplate(type, data);
    
    let subject = "";
    switch (type) {
        case 'APPOINTMENT_CANCELLED':
            subject = "❌ Xác nhận Hủy Lịch Hẹn - Prescripto Medical";
            break;
        case 'DOCTOR_CANCELLED':
            subject = "⚠️ Thông báo Hủy Lịch & Quà Tặng Đền Bù - Prescripto Medical";
            break;
        default:
            subject = "✅ Xác Nhận Đặt Lịch Khám - Prescripto Medical";
    }

    try {
        const info = await transporter.sendMail({
            from: `"Prescripto Support Team" <${process.env.EMAIL_USER}>`, 
            to: email,
            subject: subject,
            html: htmlContent
        });

        console.log(`✅ Mail SENT! Message ID: ${info.messageId}`);
        await NotificationLog.create({ toEmail: email, subject, status: 'SUCCESS' });

    } catch (error) {
        console.error("❌ LỖI GỬI MAIL (Chi tiết):", error);
        // Ghi log lỗi vào DB để tra soát sau này
        await NotificationLog.create({ toEmail: email, subject, status: 'FAILED', error: error.message });
    }
};