import { Schema } from "mongoose";

const memberSchema = new Schema({
  name: { type: Schema.Types.ObjectId, ref: 'User'},
  role: { type: String,required:true}
},{
    timestamps:true
});

export const Member=mongoose.model('Member',memberSchema);