import User from "../models/user.model.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import generateToken from "../utils/genratetoken.js";
import { protect } from "../middleware/user.middleware.js";
export const register = async (req , res)=> {
    try {
        const {username , email , password} = req.body;
        if(!username || !email || !password){
            return res.status(400).json({message : "All fields are required"});
        }
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message : "User with this email already exists"});
        }
        const hashedPassword = await bcrypt.hash(password , 10);
        const newUser = new User({username , email , password : hashedPassword});
        await newUser.save();
        return res.status(201).json({message : "User registered successfully"});
    } catch (error) {
        return res.status(500).json({message : "Internal server error"});
    }
}
export const login = async (req , res)=>{
    try {
        const {email , password} = req.body;
        if(!email || !password){
            return res.status(400).json({message : "All fields are required"});
        }
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message : "Invalid email or password"});
        }
        const isMatch = await bcrypt.compare(password , user.password);
        if(!isMatch){
            return res.status(400).json({message : "Invalid email or password"});
        }
        const token = generateToken(res , user._id);
        return res.json({message : "Login successful" , token});
    } catch (error) {
        return res.status(500).json({message : "Internal server error"});
    }
}

export const bookmarkStory = async (req , res)=>{
    try {
        const {storyId} = req.params;
        if(!storyId){
            return res.status(400).json({message : "storyId is required "});
        }
        const user = req.user;
        if(user.bookmarkedStories.includes(storyId)){
             user.bookmarkedStories = user.bookmarkedStories.filter(id => id.toString() === storyId);
             await user.save();
            return res.status(200).json({message : "bookmarked Story removed successfully"});
        } 
        else{
            user.bookmarkedStories.push(storyId);
            await user.save();
            return res.json({message : "Story bookmarked successfully"});

        }
        
    } catch (error) {
        return res.status(500).json({message : "Internal serevr error"});
    }
}