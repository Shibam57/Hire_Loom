require('dotenv').config()
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async(localFilePath)=>{
    try {
        if(!localFilePath) return null;

        const uploadResult = await cloudinary.uploader.upload(localFilePath, {
            folder: "avatars",
            resource_type: "auto"
        })

        fs.unlinkSync(localFilePath);
        return uploadResult;
    } catch (error) {
        console.error("Upload failed: ",error.message);
        fs.unlinkSync(localFilePath);
        return null;
    }
}

const deleteFromCloudinary = async(publicId)=>{
    if(!publicId) return null;
    return cloudinary.uploader.destroy(publicId);
}

module.exports = {
    uploadOnCloudinary,
    deleteFromCloudinary
}