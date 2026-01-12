import express from "express"
import dotenv from "dotenv"
import { connectDB } from "./utils/utils.js"
import userRouter from "./routes/user.routes.js"
import bookingRouter from "./routes/booking.routes.js"
dotenv.config()


const app=express();
app.use(express.json())
app.use("/auth",userRouter)
app.use("/",bookingRouter)

const port=process.env.PORT || 3000 


app.listen(port,async()=>{
    await connectDB(process.env.MONGO_URI)
    console.log(`Server Started at PORT : ${port}` )
})