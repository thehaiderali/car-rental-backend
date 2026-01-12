import {Router} from "express"
import { bookingCreate, bookingUpdate } from "../utils/utils.js";
import { checkAuth } from "../middleware/auth.js";
import { Booking } from "../models/booking.model.js";

const router = Router();


router.post("/bookings",checkAuth,async (req,res)  => {
    try {
       
         const {success,data}=bookingCreate.safeParse(req.body)
        if(!success){
        return res.status(400).json({
            success:false,
            error:"Invalid Request Schema"
        })
    }
        const newBooking=await Booking.create({
            carName:data.carName,
            days:data.days,
            rentPerDay:data.rentPerDay,
            userId:req.user.userId,
        })
        return res.status(200).json({
            success:true,
            data:{
                message:"Booking created successfully",
                bookingId:newBooking._id,
                totalCost:newBooking.totalCost
            }
        })

    }

     catch (error) {
        console.log("Error in Booking Creation  : ",error);
        return res.status(500).json({
            success:false,
            error:"Internal Server Error"
        })
    }
} )



router.get("/bookings",checkAuth,async(req,res)=>{
    try {
        
        const {userId}=req.user;
        const bookings = await Booking.find({ userId: userId });
        if (!bookings || bookings.length === 0) {
            return res.status(404).json({ 
                success:false,
                error: "No bookings found for this user."
             });
        }
        return res.status(200).json({
            success:true,
            data:bookings
        })

    } catch (error) {
        console.log("Error in Fetching Bookings  : ",error);
        return res.status(500).json({
            success:false,
            error:"Internal Server Error"
        })
    }
})


router.get("/bookings/:bookingId",checkAuth,async(req,res)=>{
   try {
    
    const bookingId=req.params.bookingId;
    const booking=await Booking.findById(bookingId);
    if(!booking){
        return res.status(400).json({
            success:false,
            error:"No Booking Found for Given Id"
        })
    }
    else if (booking.userId.toString()!=req.user.userId){
         return res.status(400).json({
            success:false,
            error:"No Booking Found for Given Id"
        })
    }
    else {
        return res.status(200).json({
            success:true,
            data:booking
        })
    }

   } catch (error) {

    console.log("Error in Fetching Bookings  : ",error);
        return res.status(500).json({
            success:false,
            error:"Internal Server Error"
        })

   }


})


router.get("/bookings",checkAuth,async(req,res)=>{
    try {
        const summary=req.query.summary;
        if(!summary){
            return res.status(400).json({
                success:false,
                error:"Invalid Query Params "
            })
        }
        const bookings = await Booking.find({ userId: req.user.userId });
        if (!bookings || bookings.length === 0) {
            return res.status(404).json({ 
                success:false,
                error: "No bookings found for this user."
             });
        }
        let totalBookings=0;
        let totalAmountSpent=0;

        for (const booking of bookings){
            if(booking.status=="booked" || booking.status=="completed"){
                totalBookings+=1
            }
            totalAmountSpent+=booking.totalCost;
        }
        const upcomingBookings=bookings.filter((b)=>b.status=="booked")
        return res.status(200).json({
            success:true,
            data:{
                userId:req.user.userId,
                totalBookings,
                totalAmountSpent,
                upcomingBookings
            }
        })
        
        
    } catch (error) {
        console.log("Error in Fetching Bookings  : ",error);
        return res.status(500).json({
            success:false,
            error:"Internal Server Error"
        })
    }
})

router.put("/bookings/:bookingId",checkAuth,async(req,res)=>{
    try {
        const bookingId=req.params.bookingId;
        const booking=await Booking.findById(bookingId);
        if(!booking){
            return res.status(400).json({
                success:false,
                error:"Booking Not Found for Given Id"
            })
        }
        if(booking.userId.toString()!==req.user.userId){
            return res.status(401).json({
                success:false,
                error:"Not Authorized to update Booking with Given Id"
            })
        }
        if(booking.status=="completed" || booking.status=="cancelled"){
             return res.status(401).json({
                success:false,
                error:"Fields for a Completed/Cancelled Ride Cannot be Changed "
            })
        }
        const {success,data}=bookingUpdate.safeParse(req.body);
        if(!success){
            return res.status(400).json({
                success:false,
                error:"Invalid Request Schema"
            })
        }
        const newbooking=await Booking.findByIdAndUpdate(bookingId,{...data},{new:true})
        return res.status(200).json({
            success:true,
            message:"Booking updated successfully",
            data:newbooking
        })

        
    } catch (error) {
        console.log("Error in Updating Bookings  : ",error);
        return res.status(500).json({
            success:false,
            error:"Internal Server Error"
        })
    }
})

router.delete("/bookings/:bookingId",checkAuth,async(req,res)=>{
    const booking=await Booking.findById(req.params.bookingId);
    if(!booking){
        return res.status(400).json({
            success:false,
            message:"Booking for Given Id not Found"
        })
    }
    if(booking.status=="cancelled"){
        return res.status(400).json({
            success:false,
            message:"Cannot Delete Already Cancelled Booking"
        })
    }
    
    if(booking.userId.toString()!=req.user.userId){
        return res.status(403).json({
            success:false,
            message:"Not Authorized to Update Status of Given Booking Id"
        })
    }
    const newbooking=await Booking.findByIdAndUpdate(req.params.bookingId,{status:"cancelled"});
    return res.status(200).json({
        success:true,
        data:{
            message:`Booking with ID : ${booking._id} cancelled successfully`
        }
    })

})


export default router