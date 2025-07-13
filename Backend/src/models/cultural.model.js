import { Schema } from "mongoose";

const culturalSchema = new Schema({
    drama:{
        types:Schema.Types.ObjectId,
        ref:'Drama'
    },
    others:{
        types:Schema.Types.ObjectId,
        ref:'Others'
    }
},{
    timestamps:true
})

export const Cultural = mongoose.model('Cultural',culturalSchema);