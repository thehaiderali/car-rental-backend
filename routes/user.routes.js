import dotenv from "dotenv"
dotenv.config()
import {Router} from "express";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";
import { userAuthSchema } from "../utils/utils.js";
import bcrypt from "bcryptjs";

const router=Router();


router.post("/signup",async (req,res)=>{
    try {

        const {success,data}=userAuthSchema.safeParse(req.body);
    if(!success){
        return res.status(400).json({
            success:false,
            error:"Invalid Request Schema"
        })
    }
    // Check for Duplicate
    const already=await User.findOne({
        username:data.username
    })
    if(already){
         return res.status(409).json({
            success:false,
            error:"Username already in use . Try Other Username"
        })
    }

    const hashedPassword=await bcrypt.hash(data.password,10);
    const newUser=await User.create({
        username:data.username,
        password:hashedPassword
    })

    return res.status(200).json({
       success:true,
       data:{
        message:"User created Successfully",
        userId:newUser._id
       }
    })
        
    } catch (error) {
        console.log("Error in Sign Up  : ",error);
        return res.status(500).json({
            success:false,
            error:"Internal Server Error"
        })
    }
})





router.post("/login",async(req,res)=>{
    try {

    const {success,data}=userAuthSchema.safeParse(req.body);
    if(!success){
        return res.status(400).json({
            success:false,
            error:"Invalid Request Schema"
        })
    }
    
    const already=await User.findOne({
        username:data.username
    })
    if(!already){
         return res.status(401).json({
            success:false,
            error:"Username not found . Try Again"
        })
    }

    const isMatch=await bcrypt.compare(data.password,already.password)

    if(!isMatch){
        return res.status(401).json({
            success:false,
            error:"Incorrect Password Try Again"
        })
    }

    const token = jwt.sign({
        userId:already._id,
        username:already.username,
    },process.env.JWT_SECRET)

    return res.status(200).json({
        success:true,
        data:{
            message:"Login Successful",
            token
        }
    })

        
    } catch (error) {
        
        console.log("Error in Login Process  : ",error);
        return res.status(500).json({
            success:false,
            error:"Internal Server Error"
        })
    }
    
})

export default router