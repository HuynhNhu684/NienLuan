import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import adminRoute from "./routes/adminRoute.js";
import connectCloudinary from "./config/cloudinary.js";


const app = express();
const PORT = process.env.PORT || 3001;

// Kết nối DB
connectDB();
connectCloudinary()


// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/admin',adminRoute)

app.get("/", (req, res) => res.send("Auth Service is RUNNING!"));

app.listen(PORT, () => {
  console.log(`Auth Service: http://localhost:${PORT}`);
});