import { Schema } from "mongoose";

const cricketSchema =new Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    event:{
        type:Schema.Types.ObjectId,
        ref:'Event'
    },
    date:{
        type:Date,
        required:true
    },
    venue:{
        type:String,
        required:true,
        trim:true
    },
    overs:{
        type:Number,
        required:true
    },
    wickets:{
        type:Number,
        required:true,
        min:[0,"Wickets cannot be less than 0"],
        max:[10,"Wickets cannot be more than 10"]
    },
    runs:{
        type:Number,
        required:true,
        default:0
    }
})

export const Cricket = mongoose.model('Cricket',cricketSchema);