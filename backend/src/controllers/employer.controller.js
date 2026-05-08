const ApiResponse = require('../utils/ApiResponse');
const Employer = require('../models/employer.model');
const Job = require('../models/job.model');
const ApiError = require('../utils/ApiError');
const Company = require('../models/company.model');
const {uploadOnCloudinary} = require('../utils/cloudinary');

const generateAccessRefreshToken = async(userId)=>{
    try {
        const employer = await Employer.findById(userId)

        if(!employer){
            throw new ApiError(404, "Employer not found")
        }


        const accessToken = await employer.generateAccessToken();

        const refreshToken = await employer.generateRefreshToken();

        employer.refreshToken = refreshToken;
        await employer.save({validateBeforeSave: false})

        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "Failed to generate access token")
    }
}

const registerEmployer = async (req, res) => {
    try {
        const { name, email, password} = req.body;
        console.log("Registering employer with data:", req.body);

        if([name, email, password].some((field) => field?.trim()==="")){
            throw new ApiError(400, "All fields are required");
        }
        const existingEmployer = await Employer.findOne({email});

        if(existingEmployer){
            throw new ApiError(409, "Employer with this email already exists");
        }

        // const avatarLocalPath = req.files?.avatar?.[0]?.path;

        // const avatar = await uploadOnCloudinary(avatarLocalPath);

        // if(!avatar){
        //     throw new ApiError(500, "Failed to upload avatar");
        // }

        const employer = await Employer.create({
            name, 
            email,
            password,
            // avatar: avatar.secure_url,
            // companyName
        })

        const createdUser = await Employer.findById(employer._id).select("-password");

        if(!createdUser){
            throw new ApiError(500, "Failed to create employer");
        }

        return res.status(201).json(new ApiResponse(true, "Employer registered successfully", createdUser));
    } catch (error) {
        throw new ApiError(500, error.message || "Failed to register employer");
    }
}

const loginEmployer = async (req, res) => {
    try {
        const { email, password } = req.body;

        if([email, password].some((field)=>field?.trim()==="")){
            throw new ApiError(400, "Email and password are required");
        }

        const employer = await Employer.findOne({ email });

        if(!employer){
            throw new ApiError(404, "Employer not found");
        }

        const isPassword = await employer.isPasswordMatch(password);

        if(!isPassword){
            throw new ApiError(401, "Invalid password");
        }

        const {accessToken, refreshToken} = await generateAccessRefreshToken(employer?._id);

        const loggedInUser = await Employer.findById(employer?._id).select("-password -refreshToken");

        const options={
            httpOnly: true,
            secure: true
        }

        console.log("Access Token:", accessToken);
        console.log("Refresh Token:", refreshToken);


        return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, {user: loggedInUser, accessToken, refreshToken}, "Employer logged in successfully"));
    } catch (error) {
        throw new ApiError(500, error.message || "Failed to login employer");
    }
}

const logoutEmployer = async (req, res) => {
    if(!req?.cookies?.refreshToken){
        throw new ApiError(400, "Refresh token is required");
    }

    await Employer.findOneAndUpdate(
        { refreshToken: req.cookies.refreshToken },
        { 
            $unset: {
                refreshToken: undefined
            }
         },
        { new: true }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, null, "Employer logged out successfully"));
}

const refreshAccessToken = async(req, res) => {
    try {
        const incomingRefreshToken = req?.cookies?.refreshToken || req.body?.refreshToken;

        if(!incomingRefreshToken){
            throw new ApiError(401, "Refresh token is required");
        }

        try {
            const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

            const employer = await Employer.findById(decodedToken?.id);

            if(!employer){
                throw new ApiError(404, "Employer not found");
            }

            if(incomingRefreshToken !== employer.refreshToken){
                throw new ApiError(401, "Invalid refresh token");
            }

            const {accessToken, refreshToken} = await generateAccessRefreshToken(employer?._id);

            const options = {
                httpOnly: true,
                secure: true
            }

            return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(200, { accessToken, refreshToken: refreshToken }, "Access token refreshed successfully"));
        } catch (error) {
            throw new ApiError(401, "Invalid refresh token");
        }
    } catch (error) {
        throw new ApiError(500, "Failed to refresh access token");
    }
}

const getEmployerProfile = async (req, res) => {
    try {
        if(!req?.cookies?.accessToken){
            throw new ApiError(401, "Access token is required");
        }

        const user = await Employer.findById(req.user._id)
            .populate("company", "name logo");

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        return res.status(200).json(new ApiResponse(200, user, "Employer profile fetched successfully"));
    } catch (error) {
        throw new ApiError(500, "Failed to get employer profile");
    }
}

const updateEmployerProfile = async (req, res) => {
    try {
        const employer = await Employer.findByIdAndUpdate(
            req.user?._id,
            req.body,
            { new: true }
        ).select("-password -refreshToken");

        if(!employer){
            throw new ApiError(404, "Employer not found");
        }

        return res.status(200).json(new ApiResponse(200, employer, "Employer profile updated successfully"));
    } catch (error) {
        throw new ApiError(500, "Failed to update employer profile");
    }
}

module.exports = {
    registerEmployer,
    loginEmployer,
    logoutEmployer,
    refreshAccessToken,
    getEmployerProfile,
    updateEmployerProfile
}