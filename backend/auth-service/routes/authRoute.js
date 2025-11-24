import express from "express";
import { loginAdmin, loginDoctor, loginUser, registerUser } from "../controllers/authController.js";

const authRouter = express.Router();

// API: Đăng ký & Đăng nhập
authRouter.post('/user/register', registerUser);
authRouter.post('/user/login', loginUser);
authRouter.post('/doctor/login', loginDoctor);
authRouter.post('/admin/login', loginAdmin);


export default authRouter;
