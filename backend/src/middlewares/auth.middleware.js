const ApiError= require("../utils/ApiError");
const jwt = require("jsonwebtoken");
const Employee = require("../models/employee.model");

const verifyEmployeeJWT = async(req, res, next)=>{
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

        const employee = await Employee.findById(decodedToken?._id).select("-password -refreshToken")

        if(!employee){
            throw new ApiError(401, "Invaild Access Token")
        }

        
        req.user = employee;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token");
    }
}

module.exports = {
    verifyEmployeeJWT
}