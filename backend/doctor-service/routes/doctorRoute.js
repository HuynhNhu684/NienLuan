import express from "express";
import { appointmentCancel, appointmentComplete, appointmentsDoctor, doctorDashboard, doctorList, doctorProfile,updateDoctorProfile } from "../controllers/doctorController.js";
import authDoctor from "../middlewares/authDoctor.js";
// import authAdmin from "../../admin-service/middlewares/authAdmin.js";

const doctorRouter = express.Router()

doctorRouter.get('/list', doctorList)
// doctorRouter.post('/change-availability', authAdmin,changeAvailablity)
doctorRouter.get('/appointments',authDoctor, appointmentsDoctor)
doctorRouter.post('/complete-appointment', authDoctor, appointmentComplete)
doctorRouter.post('/cancel-appointment', authDoctor, appointmentCancel)
doctorRouter.get('/dashboard', authDoctor, doctorDashboard)
doctorRouter.get('/profile', authDoctor, doctorProfile)
doctorRouter.post('/update-profile', authDoctor, updateDoctorProfile)

export default doctorRouter
