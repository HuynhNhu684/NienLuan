import validator from "validator"
import bcrypt from 'bcrypt'
//import { v2 as cloudinary} from "cloudinary"
import doctorModel from "../models/doctorModel.js"
import jwt from 'jsonwebtoken'
//import appointmentModel from "../models/appointmentModel.js"
import userModel from "../models/userModel.js"

// Api for admin Login
const  loginAdmin = async (req,res) =>{
    try {

        const {email, password} = req.body

        if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){
            const token = jwt.sign(email+password,process.env.JWT_SECRET)
            res.json({success:true,token})

        }else {
            res.json({success:false,message:"Invalid credentials"})
        }

    }catch (error){
        console.log(error);
        res.json({success:false,message:error.message})
    }
}

//api register user
const registerUser = async (req, res)=>{

  try{ 

      const {name, email, password}=req.body

      if(!name || !password || !email){
        return res.json({success:false, message:"Missing Details"})
      }

      //tinh hop le email
      if(!validator.isEmail(email)){
        return res.json({success:false, message:"Enter avalid email"})
      }

      //ktra mk
      if(password.length < 8){
        return res.json({success:false, message:"Enter a strong password"})
      }

      //bam mk
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)

      const userData = {
        name,
        email,
        password : hashedPassword

      }

      const newUser = new userModel(userData)
      const user = await newUser.save()

      const token = jwt.sign({id:user._id}, process.env.JWT_SECRET)

      res.json({success:true, token})
  }catch(error){
      console.log(error);
      res.json({ success: false, message: error.message });

  }
}


//API user login
const loginUser = async (req,res)=>{

    try{

      const {email, password} = req.body
      const user = await userModel.findOne({email})

      if(!user){
        return res.json({success:false,message:'User does not exist'})
      }

      const isMatch = await bcrypt.compare(password, user.password)

      if(isMatch){
        const token = jwt.sign({id:user._id}, process.env.JWT_SECRET)
        res.json({success:true, token})
      }else{
        res.json({success:false, message:"Invaild credentials"})
      }

     }catch(error){
        console.log(error);
        res.json({ success: false, message: error.message });

  }
}

//API for doctor Login
const loginDoctor = async (req, res)=>{

    try{

        const {email, password }= req.body
        const doctor = await doctorModel.findOne({email})

        if(!doctor){
            return res.json({success:false, message:'Invalid credentials'})
        }

        const isMatch = await bcrypt.compare(password, doctor.password)

        if(isMatch){

            const token =  jwt.sign({id:doctor._id},process.env.JWT_SECRET)
            res.json({success:true, token})

        }else{
            res.json({success:false, message:'Invalid credentials'})
        }

    }catch(error){
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export {
  loginAdmin,
  registerUser, 
  loginDoctor, 
  loginUser
}