import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import authRoute from "./routes/authRoute.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Kết nối DB
await connectDB();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoute);

app.get("/", (req, res) => res.send("Auth Service is RUNNING!"));

app.listen(PORT, () => {
  console.log(`Auth Service: http://localhost:${PORT}`);
});