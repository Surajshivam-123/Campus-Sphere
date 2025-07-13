import mongoose from "mongoose";
import {DB_NAME} from "../constant.js"

export const connectDB=async ()=>{
    try {
        const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URI}`)
        console.log(connectionInstance.connection.host);
        console.log("connected to MongoDB");
    } catch (error) {
        console.log("MongoDB connection Error:",error);
        process.exit(1);
    }
}