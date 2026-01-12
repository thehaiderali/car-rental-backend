import "dotenv/config"
import jwt from "jsonwebtoken"
export async function checkAuth(req,res,next) {

    try {
    const authheaders=req.headers.authorization;
    if(!authheaders){

        return res.status(403).json({
            success:false,
            error:"Auth Token not Found"
        })
    }
    const token=authheaders.split(" ")[1];
    const decoded=jwt.verify(token,process.env.JWT_SECRET);
    if(!decoded){
        return res.status(403).json({
             success:false,
            error:" Token not valid "
        })
    }
    req.user=decoded;
    next()
        
    } catch (error) {
        console.log("Error in Middleware : ",error)
        return res.status(500).json({
            success:false,
            error:" Internal Server Error"
        })
    }
    
}