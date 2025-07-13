import { Schema } from "mongoose";

const sportSchema = new Schema({
    cricket:{
        type:Schema.Types.ObjectId,
        ref:'Cricket'
    },
    others:{
        type:Schema.Types.ObjectId,
        ref:'Others'
    }
},{
    timestamps:true
})

export const Sports = mongoose.model('Sports',sportSchema);