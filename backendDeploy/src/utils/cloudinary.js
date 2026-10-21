import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const uploadOnCloudinary = async (localFilePath) => {
    if (!localFilePath) return null;

    const missingCredentials = [
        ["CLOUDINARY_CLOUD_NAME", process.env.CLOUDINARY_CLOUD_NAME],
        ["CLOUDINARY_API_KEY", process.env.CLOUDINARY_API_KEY],
        ["CLOUDINARY_API_SECRET", process.env.CLOUDINARY_API_SECRET]
    ]
        .filter(([, value]) => !value)
        .map(([name]) => name);

    if (missingCredentials.length) {
        throw new Error(
            `Missing Cloudinary configuration: ${missingCredentials.join(", ")}`
        );
    }

    try {
        cloudinary.config({ 
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
            api_key: process.env.CLOUDINARY_API_KEY, 
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        // console.log("file is uploaded on cloudinary ",response.url);
        fs.unlinkSync(localFilePath);

        return response;
    } catch (error) {
        console.error("Cloudinary upload failed:", error.message);
        throw error;
    }
    
};

export { uploadOnCloudinary };