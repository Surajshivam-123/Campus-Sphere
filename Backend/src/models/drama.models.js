import { Schema } from "mongoose";

const dramaSchema =new Schema({
    event:{
        type:Schema.Types.ObjectId,
        ref:'Event'
    }
})

export const Drama = mongoose.model('Drama',dramaSchema);