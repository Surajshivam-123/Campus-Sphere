import { Schema ,mongoose} from "mongoose";

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

export const Cricket_Player=mongoose.model('Cricket_Player',cricket_playerSchema)