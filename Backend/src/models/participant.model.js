import { Schema } from "mongoose";

const participantSchema = new Schema({
  name: { type: Schema.Types.ObjectId, ref: 'User'},
  identityNumber: { type: String,required:true}
},{
    timestamps:true
});

export const Participant=mongoose.model('Participant',participantSchema)