const User=require('../models/User');
const asyncHandler=require('../middleware/async');
const ErrorResponse=require('../utils/errorResponse');

//@desc register a user
//@route GET /api/v1/auth/register
//@access Public
exports.register=asyncHandler(async (req,res,next)=>{
    res.status(200).json({
        success:true
    })
})