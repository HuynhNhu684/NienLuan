// import mongoose from "mongoose";

// const connectDB = async () => {
//     try {
//         await mongoose.connect(process.env.MONGODB_URI);
//         console.log("✅ Payment MongoDB Connected");
//     } catch (error) {
//         console.error("❌ MongoDB Error:", error.message);
//         process.exit(1);
//     }
// };

// export default connectDB;

import mongoose from "mongoose";
import dotenv from "dotenv";

const connectDB = async ()=>{
  mongoose.connection.on('connected', ()=> console.log("Database Connected"))

  // await mongoose.connect(`${process.env.MONGODB_URI}/prescripto`)
  await mongoose.connect(`${process.env.MONGODB_URI}`)
}

export default connectDB