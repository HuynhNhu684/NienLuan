import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import doctorRouter from "./routes/doctorRoute.js";


const app = express();
const PORT = process.env.PORT || 3002;


// Kết nối DB
connectDB();
connectCloudinary()


// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/doctor',doctorRouter)

app.get("/", (req, res) => res.send("Auth Service is RUNNING!"));

app.listen(PORT, () => {
  console.log(`Auth Service: http://localhost:${PORT}`);
});