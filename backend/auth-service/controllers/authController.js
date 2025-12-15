import validator from "validator"
import bcrypt from 'bcrypt'
import doctorModel from "../models/doctorModel.js"
import jwt from 'jsonwebtoken'
import appointmentModel from "../models/appointmentModel.js"
import userModel from "../models/userModel.js"
import { v2 as cloudinary} from "cloudinary"



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


// api user profile data
const userProfile = async (req, res)=>{
  try{

    const {userId} =req.body

    const userData = await userModel.findById(userId).select('-password')

    res.json({success:true, userData})
  }catch (error){
        console.log(error);
        res.json({ success: false, message: error.message });


  }
}

// apt update profile
const updateUserProfile = async (req, res) =>{
  try{

    const {userId, name, phone, address, dob, gender} =req.body
    const imageFile =req.file

    if(!name || !phone || !dob || !gender){
        return res.json({success:false, message:"Data Missing"})
    }

    await userModel.findByIdAndUpdate(userId,{name, phone, address: JSON.parse(address), dob, gender})

    if (imageFile){
      // upload img to cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path,{resource_type:"image"})
        const imageURL = imageUpload.secure_url

        await userModel.findByIdAndUpdate(userId,{image:imageURL})
    }

    res.json({success:true, message:"Profile Updated"})

  }catch(error){
      console.log(error);
      res.json({ success: false, message: error.message });

  }
}

//API to get doctoc profile for Doctor Panel
const doctorProfile = async (req, res)=>{
    try{

        const {docId} =req.body
        const profileData = await doctorModel.findById(docId).select('-password')

        res.json({success:true, profileData})

    }catch(error){
        console.log(error);
        res.json({ success: false, message: error.message });
 
    }
}

//API to Update doctor Profilr data from Doctor Panel

const updateDoctorProfile = async (req, res) =>{
    try{

        const {docId , fees, address, available} =req.body

        await doctorModel.findByIdAndUpdate(docId, {fees, address, available})

        res.json({success:true, message:'Profile Updated'})

    }catch(error){
        console.log(error);
        res.json({ success: false, message: error.message });
 
    }
}

// API for adding doctor
const addDoctor = async (req,res) => {

    try {

        const {
            name,
            email,
            password, 
            speciality, 
            degree,  
            experience, 
            about, 
            fees, 
            address
        } = req.body
        const imageFile = req.file

        // checking for all data to add doctor
        if(!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address){
            return res.json({success:false, message:"Missing Details"})
        }

        // ktra tinh hop le cuae email
        if(!validator.isEmail(email)){
            return res.json({success:false, message:"Please enter a valid email"})
        }

        //ktra mk
        if(password.length < 8){
            return res.json({success:false, message:"Please enter a strong password"})
        }

        //bam mk doctor
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)

        //anh
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image"})
        const imageUrl = imageUpload.secure_url

        const doctorData = {
             name,
            email,
            image:imageUrl,
            password:hashedPassword,
            speciality, 
            degree,  
            experience, 
            about, 
            fees, 
            address:JSON.parse(address),
            date:Date.now()
        }

        const newDoctor = new doctorModel(doctorData)
        await newDoctor.save()

        res.json({success:true, message:"Doctor Added"})
    }catch (error) {
        console.log(error);
        res.json({success:false, message:error.message})

    }
}




//API to get all doctors list for admin panel
const allDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select('-password');
    res.json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const doctorList = async (req,res) =>{
    try{
        const doctors = await doctorModel.find({}).select(['-password', '-email'])

        res.json({success:true, doctors})
    }catch(error){
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
//API to get dashboard data for doctor panel
const doctorDashboard = async (req, res) => {

    try {

        const {docId} = req.body

        const appointments =await appointmentModel.find({docId})

        let earnings = 0

        appointments.map((item)=>{
            if(item.isCompleted || item.payment){
                earnings += item.amount
            }
        })

        let patients = []

        appointments.map((item)=>{
            if(!patients.includes(item.userId)){
                patients.push(item.userId)
            }
        })

        const dashData = {
            earnings,
            appointments: appointments.length,
            patients: patients.length,
            latestAppointments: appointments.reverse().slice(0,5)
        }

        res.json({success:true, dashData})
        
    }catch (error){
        console.log(error);
        res.json({ success: false, message: error.message });
 
    }
}


//Api to get dashboard data for admin panel
const adminDashboard = async (req, res)=>{
    try{

        const doctors = await doctorModel.find({})
        const users = await userModel.find({})
        const appointments = await appointmentModel.find({})

        const dashData = {
            doctors: doctors.length,
            appointments: appointments.length,
            patients: users.length,
            latestAppointments: appointments.reverse().slice(0, 5)
        }

        res.json({ success: true, dashData })

    }catch (error){
         console.log(error)
         res.json({ success: false, message: error.message });

    }
}

const changeAvailablity = async (req, res)=>{
    try{

        const {docId}= req.body

        const docData = await doctorModel.findById(docId)
        await doctorModel.findByIdAndUpdate(docId,{available: !docData.available})
        res.json({success:true, message: 'Availablity Changes'})

    }catch(error){
        console.log(error);
        res.json({ success: false, message: error.message });
  
    }
}




export {
  loginAdmin,
  registerUser, 
  loginDoctor, 
  loginUser, 
  userProfile,
  updateUserProfile,
  doctorProfile,
  updateDoctorProfile,
  addDoctor,
  allDoctors, doctorList,
  doctorDashboard,
  adminDashboard, 
  changeAvailablity

}