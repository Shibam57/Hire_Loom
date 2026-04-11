const ApiError = require("../utils/ApiError");
const Employee = require("../models/employee.model");
const ApiResponse = require("../utils/ApiResponse");
const {uploadOnCloudinary} = require("../utils/cloudinary");
const jwt = require("jsonwebtoken");


const generateAccessRefreshToken = async(userId)=>{
    try {
        const employee = await Employee.findById(userId)

        if(!employee){
            throw new ApiError(404, "Employee not found")
        }


        const accessToken = await employee.generateAccessToken();

        const refreshToken = await employee.generateRefreshToken();

        employee.refreshToken = refreshToken;
        await employee.save({validateBeforeSave: false})

        return {accessToken, refreshToken}
    } catch (error) {
        console.log("ACTUAL ERROR:", error);
        throw new ApiError(500, "Failed to generate access token")
    }
}

//  REGISTER EMPLOYEE
const registerEmployee = async(req, res, next)=> {
    try {
        const {name, email, password} = req.body;

        if([name, email, password].some((field) => field?.trim() === "")) {
            throw new ApiError(400, "All fields are required");
        }

        const existingEmployee = await Employee.findOne({email});

        if(existingEmployee){
            throw new ApiError(400, "Employee with this email already exists");
        }

        // const avatarLocalPath = req.files?.avatar?.[0]?.path;

        // if(!avatarLocalPath) {
        //     throw new ApiError(400, "Avatar image is required");
        // }

        // const avatar = await uploadOnCloudinary(avatarLocalPath)

        // if(!avatar){
        //     throw new ApiError(500, "Failed to upload avatar")
        // }

        const newEmployee = await Employee.create({
            name,
            email,
            password,
            // avatar: avatar.secure_url
        });

        // await newEmployee.save();

        return res.status(201).json(new ApiResponse(201, newEmployee, "Employee registered successfully"));
    } catch(error) {
        console.log("ACTUAL ERROR:", error);
        throw new ApiError(500, "Failed to register employee");
    }
};

//  LOGIN EMPLOYEE
const loginEmployee = async(req, res, next)=>{
    try {
        const {email, password} = req.body;

        if([email, password].some((field)=>field?.trim()==="")){
            throw new ApiError(400, "all field are required")
        }

        const employee = await Employee.findOne({email})

        if(!employee){
            throw new ApiError(404, "User not found");
        }

        const isPassword = await employee.isPasswordMatch(password);

        if(!isPassword){
            throw new ApiError(400, "Invalid Password")
        }

        const {accessToken, refreshToken} = await generateAccessRefreshToken(employee?._id)

        const loggedInUser = await Employee.findById(employee?._id).select("-password -refreshToken")

        const options={
            httpOnly: true,
            secure: true
        }

        return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, {user: loggedInUser, accessToken, refreshToken}, "Employee logged in successfully"))
    } catch (error) {
        console.log("ACTUAL ERROR:", error);
        throw new ApiError(500, "Failed to login employee")
    }
}

//  LOGOUT EMPLOYEE
const employeeLogout = async(req, res)=> {
    try {
        if(!req.user?._id){
            return res.status(400).json({Message: "No user is currently logged in."})
        }

        await Employee.findOneAndUpdate(
            req.user?._id,
            {
                $unset: {
                    refreshToken: undefined
                }
            },
            {
                new: true
            }
        )

        const options= {
            httpOnly: true,
            secure: true
        }

        return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "Employee logged Out"))
    } catch (error) {
        throw new ApiError(500, "not fetch")
    }
}

//  REFRESH TOKEN
const refreshAccessToken = async(req, res)=>{
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, "Refresh token is required")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await Employee.findById(decodedToken?._id)

        if(!user){
            throw new ApiError(404, "User not found")
        }

        if(incomingRefreshToken !== user.refreshToken){
            throw new ApiError(401, "Refresh token is expired or used")
        }

        const {accessToken, newRefreshToken} = await generateAccessRefreshToken(user?._id)

        const options = {
            httpOnly: true,
            secure: true
        }

        return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(new ApiResponse(200, {accessToken, refreshToken: newRefreshToken}, "Access token refreshed successfully"))
    } catch (error) {
        throw new ApiError(500, error?.message || "Invalid refreshtoken")
    }
}

//  GET PROFILE
const getEmployeeProfile = async(req, res)=> {
    try {
        if(!req.user?._id){
            throw new ApiError(400, "No user is currently logged in.")
        }

        const employee = await Employee.findById(req.user?._id).select("-password -refreshToken")

        return res.status(200).json(new ApiResponse(200, employee, "Employee profile fetched successfully"))
    } catch (error) {
        throw new ApiError(500, "Failed to fetch employee profile")
    }
}

//  UPDATE PROFILE
const updateEmployeeProfile = async(req, res)=>{
    try {
        if(!req.user?._id){
            throw new ApiError(400, "No user is currently logged in.")
        }

        const employee = await Employee.findByIdAndUpdate(
            req.user?._id,
            req.body,
            {new: true}
        ).select("-password -refreshToken")

        return res.status(200).json(new ApiResponse(200, employee, "Employee profile updated successfully"))

    } catch (error) {
        throw new ApiError(500, "Failed to update employee profile")
    }
}

//  ADD SKILLS (NO DUPLICATES)
const addEmployeeSkills = async(req, res) => {
    try {
        const {skills} = req.body;
        if(!req.user?._id){
            throw new ApiError(400, "No user is currently logged in.")
        }

        const employee = await Employee.findById(req.user?._id);

        if(!employee) {
            throw new ApiError(404, "Employee not found")
        }

        const newSkills = skills.filter(
            (skill) => !employee.skills.includes(skill)
        );

        employee.skills.push(...newSkills);

        await employee.save();

        return res.status(200).json(new ApiResponse(200, employee, "Employee skills added successfully"))
    } catch (error) {
        throw new ApiError(500, "Failed to add employee skills")
    }
}

module.exports = {
    registerEmployee,
    loginEmployee,
    employeeLogout,
    getEmployeeProfile,
    updateEmployeeProfile,
    addEmployeeSkills,
    refreshAccessToken
}