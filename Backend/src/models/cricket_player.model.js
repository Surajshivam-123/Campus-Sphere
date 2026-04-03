import mongoose, { Schema } from "mongoose";

const cricket_playerSchema=new Schema({
    team:{
        type:Schema.Types.ObjectId,
        ref:'Team'
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    balls:{
        type:Number,
        default:0
    },
    runs:{
        type:Number,
        default:0
    },
    wickets:{
        type:Number,
        default:0
    },
    overs:{
        type:Number,
        default:0
    },
})

// Compound index covers: findOne({team, owner}), find({team}), find({owner, team: {$in}})
cricket_playerSchema.index({ team: 1, owner: 1 });
cricket_playerSchema.index({ team: 1 });
cricket_playerSchema.index({ owner: 1 });

export const Cricket_Player=mongoose.model('Cricket_Player',cricket_playerSchema)