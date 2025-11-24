import validator from "validator"
import bcrypt from 'bcrypt'
import userModel from "../models/userModel.js"
import jwt from 'jsonwebtoken'
import { v2 as cloudinary} from "cloudinary"
import doctorModel from "../models/doctorModel.js"
import appointmentModel from "../models/appointmentModel.js"
import razorpay from 'razorpay'
import { VNPay, ProductCode, VnpLocale, dateFormat } from 'vnpay';


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

// api user profile data
const getProfile = async (req, res)=>{
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
const updateProfile = async (req, res) =>{
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

// API to book appointment
const bookAppointment = async (req, res) => {

  try{

    const {userId , docId, slotDate, slotTime} = req.body

    const docData = await doctorModel.findById(docId).select('-password')

    if(!docData.available){
      return res.json({success:false, message:'Doctor not available'})
    }

    let slots_booked = docData.slots_booked

    //checking for slot availability
    if(slots_booked[slotDate]){
      if(slots_booked[slotDate].includes(slotTime)){
          return res.json({success:false, message:'Doctor not available'})
      }else{
        slots_booked[slotDate].push(slotTime)
      }
    }else{
      slots_booked[slotDate] = []
      slots_booked[slotDate].push(slotTime)
    }

    const userData = await userModel.findById(userId).select('-password')

    delete docData.slots_booked

    const appointmentData = {
      userId,
      docId,
      userData,
      docData,
      amount:docData.fees,
      slotTime,
      slotDate,
      date: Date.now()
    }

    const newAppointment = new appointmentModel(appointmentData)
    await newAppointment.save()

    //save new slost data in docData
    await doctorModel.findByIdAndUpdate(docId,{slots_booked})

    res.json({success:true, message:'Appointment Booked'})
  }catch(error){
      console.log(error);
      res.json({ success: false, message: error.message });

  }
}

//api to get user appointments for fontend my -appointment pase
const listAppointment = async (req,res)=>{
  try{

    const {userId}=req.body
    const appointments = await appointmentModel.find({userId})

    res.json({success:true, appointments})

  }catch (error){
    console.log(error)
    res.json({ success: false, message: error.message });

  }
}


// api to cancel appointment
const cancelAppointment = async (req, res)=>{

  try{

    const {userId, appointmentId} = req.body

    const appointmentData = await appointmentModel.findById(appointmentId)

    //xac minh appoinment user
    if(appointmentData.userId !== userId){
      return res.json({success:false, message:"Unauthorized action"})
    }
    
    await appointmentModel.findByIdAndUpdate(appointmentId, {cancelled:true})

        //phat hanh 

    const {docId, slotDate, slotTime} = appointmentData

    const docData = await doctorModel.findById(docId)

    let slots_booked = docData.slots_booked

    slots_booked[slotDate] = slots_booked[slotDate].filter(e=> e !== slotTime)

    await doctorModel.findByIdAndUpdate(docId, {slots_booked})

    res.json({success:true, message:'Appointment Cancelled'})

  }catch(error){
    console.log(error)
    res.json({ success: false, message: error.message });

  }
}


// const razorpayInstance = new razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID,
//     key_secret: process.env.RAZORPAY_KEY_SECRET
// })

// // API to make payment of appointment using razorpay
// const paymentRazorpay = async (req, res)=>{

//   try{

//       const {appointmentId} = req.body
//       const appointmentData = await appointmentModel.findById(appointmentId)

//       if(!appointmentData || appointmentData.cancelled){
//         return res.json({success:false, message:"Appointment Cacelled or not found"})
//       }

//       //option cho thanh toan
//       const options ={
//         amount: appointmentData.amount *100,
//         currency: process.env.CURRENCY,
//         receipt: appointmentId
//       }

//       //tao 1 don hang
//       const order = await razorpayInstance.orders.create(options)

//       res.json({success:true, order})

//   }catch(error){
//     console.log(error)
//     res.json({ success: false, message: error.message });
//   }
 
// }

// // xac minh thanh toan
// const verifyRazorpay = async (req,res)=>{
//   try{

//     const {razorpay_order_id} = req.body
//     const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)

//     console.log(orderInfo)
//     if(orderInfo.status === 'paid'){
//       await appointmentModel.findByIdAndUpdate(orderInfo.receipt,{payment:true})
//       res.json({success:true, message:"Payment Successfull"})
//     }else{
//       res.json({success:false ,message:'Payment Failed'})
//     }

//   }catch(error){
//     console.log(error)
//     res.json({ success: false, message: error.message });

//   }

// }

  // API tạo link thanh toán VNPay
const createVNPayPayment = async (req, res) => {
  try {
    const { appointmentId, amount } = req.body;

    const vnpay = new VNPay({
      tmnCode: 'OBWJUQHK',
      secureSecret: '82O89B73OYOP2KE79BUYKOATFZR761NF',
      testMode: true,
    });

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const paymentUrl = await vnpay.buildPaymentUrl({
      vnp_Amount: amount * 100,
      vnp_IpAddr: req.ip,
      vnp_TxnRef: appointmentId,
      vnp_OrderInfo: `Pay for appointment ${appointmentId}`,
      vnp_OrderType: ProductCode.Other,
      // vnp_ReturnUrl: `http://localhost:4000/api/user/check-payment-vnpay`,
      // Thay toàn bộ dòng cũ bằng dòng này
vnp_ReturnUrl: 'http://localhost:4000/api/user/check-payment-vnpay',
      vnp_Locale: VnpLocale.VN,
      vnp_CreateDate: dateFormat(new Date()),
      vnp_ExpireDate: dateFormat(tomorrow),
    });

    res.json({ success: true, paymentUrl });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const checkVNPayPayment = async (req, res) => {
  try {
    const vnpay = new VNPay({
      tmnCode: 'OBWJUQHK',
      secureSecret: '82O89B73OYOP2KE79BUYKOATFZR761NF',
      testMode: true,
    });

    const verifyResult = vnpay.verifyReturnUrl(req.query);

    if (!verifyResult.isValidSignature) {
      return res.json({ success: false, message: 'Invalid signature' });
    }

    const appointmentId = req.query.vnp_TxnRef;
    const status = req.query.vnp_ResponseCode;

    if (status === '00') {
      // Payment success
      await appointmentModel.findByIdAndUpdate(appointmentId, { payment: true });
      return res.json({ success: true, message: 'Payment successful' });
    }

    res.json({ success: false, message: 'Payment failed' });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};



export {registerUser,
    loginUser,
    getProfile,
    updateProfile, 
    bookAppointment, 
    listAppointment, 
    cancelAppointment, 
    // paymentRazorpay, 
    // verifyRazorpay
    createVNPayPayment,
    checkVNPayPayment,
    }