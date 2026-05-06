import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const storySchema = new Schema({
    title : {
        type : String,
        required : true
    },
    URL : {
        type : String,
        required : true
    } , 
    points : {
        type : Number,
        required : true
    } , 
    author : {
        type : String,
        required : true
    } ,
    postedAt : {
        type : String,
        required : true
    }
} , {timestamps : true});

const Story = new mongoose.model('Story' , storySchema);

export default Story;