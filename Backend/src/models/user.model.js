import mongoose,{Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const userSchema=new Schema({
    fullname:{
        type:String,
        required:true,
        trim:true,
        index:true
    },
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    password:{
        type:String,
        required:function(){ return !this.googleId; }
    },
    googleId:{
        type:String,
        unique:true,
        sparse:true
    },
    avatar:{
        type:String,
    },
    refreshToken:{
        type:String
    },
    },{
    timestamps:true
})

userSchema.pre('save',async function(next){
    if(!this.isModified('password') || !this.password)
        return next();
    this.password=await bcrypt.hash(this.password,8);
    next();
})

userSchema.methods.isPasswordCorrect=async function(password){
    if(!this.password) return false; // Google OAuth users have no password
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken=function (){
    return jwt.sign({
        _id:this._id,
        email:this.email,
        userame:this.username,
        fullname:this.fullname,
        avatar:this.avatar
    },process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    })
}

userSchema.methods.generateRefreshToken=function (){
    return jwt.sign({
        _id:this._id,
    },process.env.REFRESH_TOKEN_SECRET,{
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    })
}

export const User=mongoose.model('User',userSchema);