import jwt from "jsonwebtoken";

export async function checkAuth(req, res, next) {
    try {
        const authheaders = req.headers.authorization;
        if (!authheaders || !authheaders.startsWith("Bearer ")) {
            return res.status(403).json({
                success: false,
                error: "Auth Token not Found"
            });
        }
        const token = authheaders.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; 
        next();
    } catch (error) {
        console.log("Error in Middleware: ", error.message);
        return res.status(401).json({
            success: false,
            error: "Token not valid or expired"
        });
    }
}