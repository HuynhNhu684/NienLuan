import mongoose from "mongoose";
import dotenv from "dotenv";

const connectDB = async ()=>{
  mongoose.connection.on('connected', ()=> console.log("Database Connected"))

  // await mongoose.connect(`${process.env.MONGODB_URI}/prescripto`)
  await mongoose.connect(`${process.env.MONGODB_URI}`)
}

export default connectDB