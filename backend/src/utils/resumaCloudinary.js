
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});
console.log("ENV CHECK:", process.env.CLOUDINARY_CLOUD_NAME);
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: "resumes",
      resource_type: "raw", // ✅ IMPORTANT FOR PDF
    });

    return result;
  } catch (error) {
    console.error("FULL ERROR:", error);
    return null;
  }
};

module.exports = {
    uploadOnCloudinary
}