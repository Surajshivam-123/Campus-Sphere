import mongoose, { Schema } from "mongoose";

const teamSchema=new Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    event:{
        type:Schema.Types.ObjectId,
        ref:'Event'
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    teamlogo:{
        type:String
    },
    teamCode:{
        type:String,
        required:true
    },
},{timestamps:true});

// Compound index covers: findOne({event, owner}), find({event}), findOne({teamCode})
teamSchema.index({ event: 1, owner: 1 });
teamSchema.index({ teamCode: 1 });

export const Team=mongoose.model('Team',teamSchema);