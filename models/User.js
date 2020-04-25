const mongoose=require('mongoose');
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const UserSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,'please add your name']
    },
    email: {
        type: String,
        required: [true,'please add an email'],
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ],
        unique:true

    },
    role:{
        type:String,
        enum:['user','publisher'],
        default:'user'
    },
    password:{
        type:String,
        required:[true,'Please add a password'],
        minLength:6,
        maxLength:30,
        select:false
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date,
    createdAt: {
        type:Date,
        default: Date.now
    }



});
UserSchema.pre('save',async function(next) {
    const salt=await bcrypt.genSalt(10);
    this.password=await bcrypt.hash(this.password,salt)
});
//sign jwt and return
UserSchema.methods.getSignedJwtToken=function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRE
    })
}
//Match user entered password to hashed password
UserSchema.methods.matchPassword=async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password)
}
//Encry password using bcrypt
module.exports=mongoose.model('User',UserSchema)