import express from "express";
import cors from 'cors'
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import appointmentRoute from "./routes/appointmentRoute.js";



//ap config
const app = express();
const port = process.env.PORT || 3001;
connectDB()
connectCloudinary()

//middlewares
app.use(express.json())
app.use(cors())

//api endpoints
app.use('/appointment',appointmentRoute)

// localhost:4000.api/admin/add-doctor

app.get('/',(req, res)=>{
  res.send('API WORKING')
})

app.listen(port, ()=> console.log("Server Started", port))