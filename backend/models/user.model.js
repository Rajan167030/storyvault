import mongoose from 'mongoose';
import { Schema } from 'mongoose';
 
const userSchema = new Schema({
    username : {
        type :String ,
        required : true
    } , 
    email : {
        type : String , 
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true
    },
    bookmarkedStories : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Story'
    }]
})
const User = new mongoose.model('User' , userSchema);

export default User;