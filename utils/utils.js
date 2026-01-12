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
    rentPerDay:z.number().nonnegative(),
})

export const bookingUpdate=z.object({
    carName:z.string().min(2).max(50),
    days:z.number().min(1).max(365).nonnegative(),
    rentPerDay:z.number().nonnegative(),
    status:z.enum(["booked","completed","cancelled"])
})
