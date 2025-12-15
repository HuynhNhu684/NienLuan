import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import authRoute from "./routes/authRoute.js";
import connectCloudinary from "./config/cloudinary.js";
import client from "prom-client"; 

const app = express();
const PORT = process.env.PORT || 3000;

// Kết nối DB
connectDB();
connectCloudinary();


// Middleware
app.use(express.json());
app.use(cors());
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({timeout: 5000});

// Routes
app.use("/auth", authRoute);

app.get("/", (req, res) => res.send("Auth Service is RUNNING!"));
app.get("/metrics", async(req, res)=>{
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

app.listen(PORT, () => {
  console.log(`Auth Service: http://localhost:${PORT}`);
});