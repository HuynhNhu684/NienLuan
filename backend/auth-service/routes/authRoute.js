import express from "express";
import { addDoctor, adminDashboard, allDoctors, changeAvailablity, doctorDashboard, doctorList, doctorProfile, loginAdmin, loginDoctor, loginUser, registerUser, updateDoctorProfile, updateUserProfile, userProfile } from "../controllers/authController.js";
import authUser from "../middlewares/authUser.js";
import upload from "../middlewares/multer.js";
import authDoctor from "../middlewares/authDoctor.js";
import authAdmin from "../middlewares/authAdmin.js";

const authRouter = express.Router();

// API: Đăng ký & Đăng nhập
authRouter.post('/user/register', registerUser);
authRouter.post('/user/login', loginUser);
authRouter.post('/doctor/login', loginDoctor);
authRouter.post('/admin/login', loginAdmin);
authRouter.get('/list', doctorList)
authRouter.get('/user-profile',authUser, userProfile)
authRouter.post('/update-user-profile', upload.single('image'),authUser, updateUserProfile)
authRouter.get('/doctor-profile', authDoctor, doctorProfile)
authRouter.post('/update-doctor-profile', authDoctor, updateDoctorProfile)
authRouter.post('/add-doctor',authAdmin,upload.single('image'),addDoctor)
authRouter.post('/all-doctors',authAdmin,allDoctors)
authRouter.get('/doctorDashboard', authDoctor, doctorDashboard)
authRouter.get('/adminDashboard', authAdmin, adminDashboard)
authRouter.post('/change-availability', authAdmin,changeAvailablity)



export default authRouter;
