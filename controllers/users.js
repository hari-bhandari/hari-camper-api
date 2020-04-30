const User=require('../models/User');
const asyncHandler=require('../middleware/async');
const ErrorResponse=require('../utils/errorResponse');



//@desc get all users
//@route GET /api/v1/auth/users
//@access Private/Admin
exports.getUsers=asyncHandler(async (req,res,next)=>{
   res.status(200).json(res.advancedResults)

})
//@desc get single user
//@route GET /api/v1/auth/users/:id
//@access Private/Admin
exports.getUser=asyncHandler(async (req,res,next)=>{
    const user=await User.findById(req.params.id)
    res.status(200).json({
        success:true,
        data:user
    })

});
//@desc create userr
//@route POST /api/v1/auth/users
//@access Private/Admin
exports.createUser=asyncHandler(async (req,res,next)=>{
    const user=await User.create(req.body );
    res.status(201).json({
        success:true,
        data:user
    })

});
//@desc update user
//@route POST /api/v1/auth/users/:id
//@access Private/Admin
exports.updateUser=asyncHandler(async (req,res,next)=>{
    const user=await User.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true
    });
    res.status(200).json({
        success:true,
        data:user
    })

});
//@desc delete user
//@route DEL /api/v1/auth/users/:id
//@access Private/Admin
exports.deleteUser=asyncHandler(async (req,res,next)=>{
        await User.findByIdAndDelete(req.params.id);
    res.status(200).json({
        success:true,
        data:{}
    })

});
