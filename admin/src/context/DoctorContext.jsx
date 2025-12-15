import { useState } from "react"
import { createContext } from "react"
import axios from 'axios';
import { toast } from "react-toastify";


export const DoctorContext = createContext()

const DoctorContextProvider = (props) =>{

    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const backendUrl_auth_service =  import.meta.env.VITE_BACKEND_URL_AUTH_SERVICE
    const backendUrl_booking_service =  import.meta.env.VITE_BACKEND_URL_BOOKING_SERVICE


    const [dToken , setDToken] = useState(localStorage.getItem('dToken')?localStorage.getItem('dToken'): '')
    
    const [appointments, setAppointments] = useState([])
    const [dashData, setDashData] = useState(false)
    const [profileData, setProfileData] = useState (false)

    const getAppointments =async()=>{
        try{
            const {data} = await  axios.get(backendUrl_booking_service+ '/doc-appointments', {headers:{dToken}})
            if(data.success){
                setAppointments(data.appointments)
                console.log(data.appointments)
            }else{
                toast.error(data.message)
            }

        }catch(error){
            console.log(error)
            toast.error(error.message)
        }
    }

    const completeAppointment = async(appointmentId)=>{

        try{
            const {data} = await axios.post(backendUrl_booking_service +'/complete-appointment',{appointmentId}, {headers:{dToken}})
            if(data.success){
                toast.success(data.message)
                getAppointments()
            }else{
                toast.error(data.message)
            }

        }catch (error){
            console.log(error)
            toast.error(error.message)
        }
    }

        const cancelAppointment = async(appointmentId)=>{

        try{
            const {data} = await axios.post(backendUrl_booking_service +'/doc-cancel-appointment',{appointmentId}, {headers:{dToken}})
            if(data.success){
                toast.success(data.message)
                getAppointments()
            }else{
                toast.error(data.message)
            }

        }catch (error){
            console.log(error)
            toast.error(error.message)
        }
    }

    const getDashData = async ()=>{
        try{
            const {data} = await axios.get (backendUrl_auth_service+ '/doctorDashboard', {headers:{dToken}})
            if(data.success){
                setDashData(data.dashData)
                console.log(data,dashData)
            }else {
                toast.error(data.message)
            }
        }catch (error){
            console.log(error);
            toast.error(error.message)
        }
    }

    const getProfileData = async ()=>{
        try{ 
            const {data} = await axios.get(backendUrl_auth_service+'/doctor-profile', {headers:{dToken}})
            if (data.success){
                setProfileData(data.profileData)
                console.log(data.profileData)
            }
        }  catch (error){
            console.log(error);
            toast.error(error.message)
 
        } 
    }

    const value = {
        dToken, setDToken,
        backendUrl,
        appointments, setAppointments,
        getAppointments,
        completeAppointment, cancelAppointment,
        dashData, setDashData, getDashData,
        profileData, setProfileData, 
        getProfileData,
        backendUrl_booking_service,
        backendUrl_auth_service, 



    }

    return (
        <DoctorContext.Provider value={value}>
            {props.children}
        </DoctorContext.Provider>
    )
}

export default DoctorContextProvider