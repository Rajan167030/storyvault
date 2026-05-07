import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGO_URI;

export const connectToDB = async ()=>{
    try{
        await mongoose.connect(uri )
        console.log("Connected to MongoDB");
    }
    catch (e){
        console.error("Error connecting to MongoDB:", e);
    }
}