const Course=require('../modals/Course');
const asyncHandler=require('../middleware/async')
const ErrorResponse=require('../utils/errorResponse')

//@desc Get course
//@route GET /api/v1/course
//@route GET /api/v1/bootcamps/:bootcampId/courses
//@access Public
exports.getCourses=asyncHandler(async (req,res,next)=>{
    let query;
    if(req.params.bootcampId){
        query=Course.find({bootcamp:req.params.bootcampId})
    }
    else{
        query=Course.find();
    }
    const courses= await query;
    res.status(200).json({
        sucess:true,
        count:courses.length,
        data:courses
    });
})