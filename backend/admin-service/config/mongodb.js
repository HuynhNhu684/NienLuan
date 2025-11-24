import mongoose from "mongoose";
import dotenv from "dotenv";

const connectDB = async ()=>{
  mongoose.connection.on('connected', ()=> console.log("Database Connected"))

  //await mongoose.connect(`${process.env.MONGODB_URI}/prescripto`)
  await mongoose.connect(`${process.env.MONGODB_URI}`)

}

export default connectDB


// import mongoose from "mongoose";
// import dotenv from "dotenv";

// dotenv.config();

// const connectDB = async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URI}/prescripto?retryWrites=true&w=majority&appName=Cluster0`, {
//       ssl: true,
//       tlsAllowInvalidCertificates: true,
//       serverSelectionTimeoutMS: 30000,
//     });

//     console.log("✅ MongoDB Connected Successfully");
//   } catch (error) {
//     console.error("❌ MongoDB Connection Error:", error);
//   }
// };

// export default connectDB;

