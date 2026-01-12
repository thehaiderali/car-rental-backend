import "dotenv/config"
import mongoose from "mongoose";
import {z} from "zod"

export async function connectDB(conn) {
    if(conn==""){
        console.log("Database Connection Cannot be empty");
        return;
    }
    else{
        mongoose.connect(conn)
        .then(()=>console.log("MongoDB Connected Successfully"))
        .catch(()=>console.log("DataBase Connection Failed"))
    }
}



export const userAuthSchema=z.object({
    username:z.string().min(3),
    password:z.string().min(6)
})


export const bookingCreate=z.object({
    carName:z.string().min(2).max(50),
    days:z.number().min(1).max(365).nonnegative(),
    // MISTAKE #18: Missing min and max for rentPerDay
    // Spec says: "rentPerDay must be between 100 and 2000"
    // Your schema only checks nonnegative() which allows 0-infinity
    rentPerDay:z.number().min(100).max(2000),
})

// MISTAKE #19: All fields are REQUIRED in this schema
// The spec allows PARTIAL updates - you can update just status, or just carName, etc.
// Your current schema fails validation if you only send { status: "completed" }
// because it requires ALL fields to be present
// SOLUTION: Make all fields optional using .optional()
export const bookingUpdate=z.object({
    carName:z.string().min(2).max(50).optional(),
    days:z.number().min(1).max(365).nonnegative().optional(),
    rentPerDay:z.number().min(100).max(2000).optional(),
    status:z.enum(["booked","completed","cancelled"]).optional()
}).refine(data => Object.keys(data).length > 0, {
    // This ensures at least ONE field is provided (can't send empty body)
    message: "At least one field must be provided for update"
});