import mongoose, { mongo } from "mongoose";

const bookingSchema=new mongoose.Schema({
    userId :{ 
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    carName:{
        type:String,
        required:true
    },
    days:{
        type:Number,
        required:true
    },
    rentPerDay:{
        type:Number,
        required:true
    },
    status:{
        type:String,
        enum:["booked","completed","cancelled"],
        required:true,
        default:"booked"
    },
    totalCost:{
        type:Number,
        required:true
    }
})

bookingSchema.pre("save", function (next) {
  this.totalCost = this.rentPerDay * this.days;
  next();
});

export const Booking=mongoose.model("Booking",bookingSchema
)