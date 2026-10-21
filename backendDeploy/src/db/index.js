import mongoose from "mongoose"
import { dbName } from "../constants.js"

const connectDB = async()=>{
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error("MONGODB_URI is not configured");
        }

        await mongoose.connect(mongoUri, { dbName });
        console.log("MongoDB Connected");
    } catch (error) {
        console.error("MongoDB Connection Error:", error.message);
        process.exit(1);
    }
}
export default connectDB