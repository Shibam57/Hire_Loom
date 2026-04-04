const ApiError= require("../utils/ApiError");
const jwt = require("jsonwebtoken");
const Employer = require("../models/employer.model");

const verifyEmployerJWT = async(req, res, next)=>{
    try {
        const authHeader = req.header("Authorization");
        let token = req.cookies?.accessToken;

        if(!token && authHeader && authHeader.startsWith("Bearer ")){
            token = authHeader.split(" ")[1];
        }

        if(!token || typeof token !== "string" || token.trim()===""){
            throw new ApiError(401, "Unauthorized request - Token missing or malformed");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const employer = await Employer.findById(decodedToken?._id).select("-password -refreshToken")

        if(!employer){
            throw new ApiError(401, "Invaild Access Token")
        }

        
        req.user = employer;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token");
    }
}

module.exports = {
    verifyEmployerJWT
}