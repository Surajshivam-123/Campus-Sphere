import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./ApiError";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localfilePath) => {
  try {
    if (!localfilePath) throw "File not found";
    const response = await cloudinary.uploader.upload(localfilePath, {
      resource_type: "auto",
    });
    console.log("file is uploaded successfully on cloudinary", response.url);
    fs.unlinkSync(localfilePath);
    return response;
  } catch (error) {
    console.log("Error",error);
    return null;
  }
};

const deleteFromCloudinary = async (public_id) => {
    try {
        if(!public_id){
            throw "Public Id not found"
        }
        await cloudinary.uploader.destroy(public_id,{resouce_type:"auto"})
        return true
    } catch (error) {
        console.log("Error",error);
    }
}

export {uploadOnCloudinary,deleteFromCloudinary}
    
