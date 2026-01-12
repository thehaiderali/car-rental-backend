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
        // MISTAKE #1: Wrong HTTP status code
        // Creating a resource should return 201 (Created), not 200 (OK)
        // 201 indicates successful resource creation
        return res.status(201).json({
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


// MISTAKE #2: DUPLICATE ROUTE DEFINITION
// You have TWO router.get("/bookings") handlers (line 47 and line 109)
// Express only registers the FIRST matching route
// The second one (summary endpoint) is COMPLETELY IGNORED and unreachable
// SOLUTION: Combine all GET /bookings logic into ONE handler with conditional logic

router.get("/bookings",checkAuth,async(req,res)=>{
    try {
        const {userId}=req.user;
        const {summary, bookingId} = req.query;

        // Handle SUMMARY request first (query: ?summary=true)
        if(summary === 'true') {
            const bookings = await Booking.find({ userId: userId });
            if (!bookings || bookings.length === 0) {
                return res.status(404).json({ 
                    success:false,
                    error: "No bookings found for this user."
                });
            }
            
            let totalBookings=0;
            let totalAmountSpent=0;

            for (const booking of bookings){
                // MISTAKE #3: Use strict equality (===) instead of ==
                // == does type coercion which can cause unexpected bugs
                if(booking.status === "booked" || booking.status === "completed"){
                    totalBookings+=1;
                    // MISTAKE #4: Only count totalAmountSpent for booked/completed
                    // Your original code counted ALL bookings including cancelled
                    totalAmountSpent+=booking.totalCost;
                }
            }
            const upcomingBookings=bookings.filter((b)=>b.status === "booked")
            return res.status(200).json({
                success:true,
                data:{
                    userId:req.user.userId,
                    totalBookings,
                    totalAmountSpent,
                    upcomingBookings
                }
            });
        }

        // Handle SINGLE BOOKING by query param (query: ?bookingId=xxx)
        if(bookingId) {
            const booking = await Booking.findById(bookingId);
            if(!booking){
                return res.status(404).json({
                    success:false,
                    error:"No Booking Found for Given Id"
                });
            }
            if (booking.userId.toString() !== req.user.userId){
                // MISTAKE #5: Should be 403 (Forbidden) not 400 (Bad Request)
                // 403 means authenticated but not authorized to access this resource
                return res.status(403).json({
                    success:false,
                    error:"No Booking Found for Given Id"
                });
            }
            return res.status(200).json({
                success:true,
                data:booking
            });
        }

        // Handle ALL BOOKINGS (default behavior, no query params)
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
        // MISTAKE #6: Should be 404 (Not Found), not 400 (Bad Request)
        return res.status(404).json({
            success:false,
            error:"No Booking Found for Given Id"
        })
    }
    // MISTAKE #7: Use strict inequality (!==) instead of (!=)
    else if (booking.userId.toString() !== req.user.userId){
        // MISTAKE #8: Should be 403 (Forbidden), not 400
         return res.status(403).json({
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


// MISTAKE #9: REMOVED THIS DUPLICATE ROUTE
// This was the second router.get("/bookings") that was unreachable
// All its logic has been moved into the first GET /bookings handler above
/*
router.get("/bookings",checkAuth,async(req,res)=>{
    try {
        const summary=req.query.summary;
        if(!summary){
            return res.status(400).json({
                success:false,
                error:"Invalid Query Params "
            })
        }
        // ... rest of summary logic
    }
})
*/

router.put("/bookings/:bookingId",checkAuth,async(req,res)=>{
    try {
        const bookingId=req.params.bookingId;
        const booking=await Booking.findById(bookingId);
        if(!booking){
            // MISTAKE #10: Should be 404 (Not Found), not 400
            return res.status(404).json({
                success:false,
                error:"Booking Not Found for Given Id"
            })
        }
        if(booking.userId.toString() !== req.user.userId){
            // MISTAKE #11: Should be 403 (Forbidden), not 401 (Unauthorized)
            // 401 = not authenticated (no valid token)
            // 403 = authenticated but not authorized (token valid, but wrong user)
            return res.status(403).json({
                success:false,
                error:"Not Authorized to update Booking with Given Id"
            })
        }

        // MISTAKE #12: Too strict validation - blocks ALL updates on completed/cancelled
        // According to spec:
        // - CAN update status from completed → cancelled
        // - CAN update status from booked → completed/cancelled
        // - CANNOT update carName/days/rentPerDay on completed/cancelled
        // - CANNOT update status from completed/cancelled → booked
        
        const {success,data}=bookingUpdate.safeParse(req.body);
        if(!success){
            return res.status(400).json({
                success:false,
                error:"Invalid Request Schema"
            })
        }

        // Check if trying to update car details on completed/cancelled booking
        if ((booking.status === "completed" || booking.status === "cancelled") && 
            (data.carName || data.days || data.rentPerDay)) {
            return res.status(400).json({
                success:false,
                error:"Cannot modify car details for a completed or cancelled booking"
            });
        }

        // Check invalid status transitions
        if (data.status) {
            if ((booking.status === "completed" || booking.status === "cancelled") && 
                data.status === "booked") {
                return res.status(400).json({
                    success:false,
                    error:"Cannot change status from completed/cancelled to booked"
                });
            }
        }

        // MISTAKE #13: Missing totalCost recalculation
        // When days or rentPerDay changes, totalCost must be recalculated
        if (data.days || data.rentPerDay) {
            const updatedDays = data.days || booking.days;
            const updatedRent = data.rentPerDay || booking.rentPerDay;
            data.totalCost = updatedDays * updatedRent;
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
    try {
        const booking=await Booking.findById(req.params.bookingId);
        if(!booking){
            // MISTAKE #14: Should be 404, not 400
            return res.status(404).json({
                success:false,
                message:"Booking for Given Id not Found"
            })
        }
        // MISTAKE #15: Use strict equality
        if(booking.status === "cancelled"){
            return res.status(400).json({
                success:false,
                message:"Cannot Delete Already Cancelled Booking"
            })
        }
        
        // MISTAKE #16: Use strict inequality
        if(booking.userId.toString() !== req.user.userId){
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
    } catch (error) {
        // MISTAKE #17: Missing try-catch block in original code
        // Added error handling for consistency
        console.log("Error in Deleting Booking  : ",error);
        return res.status(500).json({
            success:false,
            error:"Internal Server Error"
        })
    }

})


export default router