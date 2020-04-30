const User=require('../models/User');
const asyncHandler=require('../middleware/async');
const sendEmail=require('../utils/sendEmail')
const ErrorResponse=require('../utils/errorResponse');
const crypto=require('crypto')

//@desc register a user
//@route POST /api/v1/auth/register
//@access Public
exports.register=asyncHandler(async (req,res,next)=>{
    const {name,email,password,role}=req.body;

    //Create user
    const user=await User.create({
        name,
        email,
        password,
        role
    });
    //Create web token
    sendTokenResponse(user,200,res)

})
//@desc register a user
//@route POST /api/v1/auth/login
//@access Public
exports.login=asyncHandler(async (req,res,next)=>{
    const {email,password}=req.body;
    //Validate email and password
    if(!email||!password){
        return next(new ErrorResponse(`Please provide user or a password`,400))
    }
    //check for a user
    const user=await User.findOne({email}).select('+password');
    if(!user){
        return next(new ErrorResponse(`Please provide valid user or a password`,401))
    }
    //check if password matches
    const isMatch=await user.matchPassword(password)
    if(!isMatch){
        return next(new ErrorResponse(`Please provide valid user or a password`,401))
    }
    sendTokenResponse(user,200,res)

})


//@desc get current logged in user
//@route GET /api/v1/auth/me
//@access Private
exports.getMe=asyncHandler(async (req,res,next)=>{
    console.log(req.user)
    const user=await User.findById(req.user.id);

    res.status(200).json({
        success:true,
        data:user
    })
})
//@desc forgot password
//@route Post /api/v1/auth/forgotpassword
//@access public
exports.forgotPassword=asyncHandler(async (req,res,next)=>{
    const user=await User.findOne({email:req.body.email});
    if(!user){
        return next(new ErrorResponse(`There is no user with  this email ${req.body.email}`,401))
    }
    //get reset token
    const resetToken=user.getResetPasswordToken();

    await user.save({ validateBeforeSave:false})
    //Create resetURL =
    const resetURL=`${req.protocol}://${req.get('host')}/api/v1/auth/forgotpassword/${resetToken}`
    const message=`you are receiving this email because you ?(or someone else) has requested to reset he password. please click on the link to continue ${resetURL}`;
    try{
        await sendEmail({
            email:user.email,
            subject:'Reset password for HARI CAMPER',
            message})
        return res.status(200).json({success:true,data:'Email has been sent'})

    }catch (err) {
        console.log(err);
        user.resetPasswordToken=undefined;
        user.resetPasswordExpire=undefined;
        await user.save({validateBeforeSave:false})

        return next(new ErrorResponse(`EMAIL COULD NOT BE SENT`,500))
    }
    res.status(200).json({
        success:true,
        data:user
    })
})
//@desc reset password
//@route GET /api/v1/auth/resetpassword/:resettoken
//@access public
exports.resetPassword=asyncHandler(async (req,res,next)=>{
    //get hashed token
    const resetPasswordToken=crypto.createHash('sha256').update(req.params.resettoken).digest('hex');


    const user=await User.findOne({
        resetPasswordToken:resetPasswordToken,
        resetPasswordExpire:{$gt:Date.now()}
    });
    if(!user){
        return next(new ErrorResponse('Invalid request',400))
    }
    //set new password
    user.password =req.body.password;
    user.resetPasswordToken=undefined;
    user.resetPasswordExpire=undefined;
    await user.save();
    sendTokenResponse(user,200,res)
})
//@desc update user details
//@route PUT /api/v1/auth/updatedetails
//@access Private
exports.updateDetails=asyncHandler(async (req,res,next)=>{
    const fieldsToUpdate={
        name:req.body.name,
        email:req.body.email
    }

    const user=await User.findByIdAndUpdate(req.user.id,fieldsToUpdate,{
        new: true,
        runValidators:true
    });

    res.status(200).json({
        success:true,
        data:user
    })
})
//@desc update password
//@route PUT /api/v1/auth/updatepassword
//@access Private
exports.updatePassword=asyncHandler(async (req,res,next)=>{
    const user=await User.findById(req.user.id).select('+password');
    //check current password
    if(!(await user.matchPassword(req.body.currentPassword))){
        return next(new ErrorResponse('current password is incorrect,try again',401))

    }
    user.password=req.body.newPassword;
    await user.save();

    sendTokenResponse(user,200,res)


    res.status(200).json({
        success:true,
        data:user
    })
})
//get token from model,create cookie and send
// response
const sendTokenResponse=(user,statusCode,res)=>{
    //Create web token
    const token=user.getSignedJwtToken();
    const options={
        expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRE*24*60*60*1000),
        httpOnly:true,
    }
    if(process.env.NODE_ENV==='production'){
        options.secure=true
    }
    res.status(statusCode).cookie('token',token,options).json({
        success:true,
        token
    })
}

//@desc log user out and clear cookie
//@route GET /api/v1/auth/logout
//@access Private
exports.logout=asyncHandler(async (req,res,next)=>{
    res.cookie('token','none',{
        expires: new Date(Date.now()+10*1000),
        httpOnly: true
    })

    res.status(200).json({
        success:true,
        data:{}
    })
})