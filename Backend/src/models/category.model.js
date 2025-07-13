import mongoose, { Schema } from "mongoose";

const categorySchema = new Schema({
    sports:{
        type:Schema.Types.ObjectId,
        ref:'Sports'
    },
    cultural:{
        type:Schema.Types.ObjectId,
        ref:'Cultural'
    },
    others:{
        type:Schema.Types.ObjectId,
        ref:'Others'
    }
},{
    timestamps:true
})

export const Category=mongoose.model('Category',categorySchema)