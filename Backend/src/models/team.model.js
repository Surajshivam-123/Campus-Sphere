import { Schema ,mongoose} from "mongoose";

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
    teamPlayer:{
        type:Array,
        default:[]
    }
},{timestamps:true});

export const Team=mongoose.model('Team',teamSchema);