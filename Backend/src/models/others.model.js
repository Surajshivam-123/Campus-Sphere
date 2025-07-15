import { Schema } from "mongoose";

const othersSchema =new Schema({
    event:{
        type:Schema.Types.ObjectId,
        ref:'Event'  
    }
})

export const Others = mongoose.model('Others',othersSchema);