const Course=require('../models/Course');
const Bootcamp=require('../models/Bootcamp');
const Review=require('../models/Review');
const asyncHandler=require('../middleware/async')
const ErrorResponse=require('../utils/errorResponse');
//@desc Get reviews
//@route GET /api/v1/reviews
//@route GET /api/v1/bootcamps/:bootcampId/reviews
//@access Public
exports.getReviews=asyncHandler(async (req,res,next)=>{
    if(req.params.bootcampId){
        const reviews=await Review.find({bootcamp:req.params.bootcampId})
        return res.status(200).json({
            success:true,
            count:reviews.length,
            data:reviews
        })
    }
    else{
        res.status(200).json(res.advancedResults)
    }
})
//@desc Get a single review by id
//@route GET /api/v1/reviews/:id
//@access Public
exports.getReview=asyncHandler(async (req,res,next)=>{
    const review=await Review.findById(req.params.id).populate({
        path:'bootcamp',
        select:'name description'
    })
    if(!review){
        return next(new ErrorResponse(`No review with the id of ${req.params.id}`,404));
    }
    res.status(200).json({
        success:true,
        data:review
    })
})
//@desc add review to a bootcamp
//@route POST /api/v1/bootcamps/:bootcampId/reviews
//@access private
exports.addReview=asyncHandler(async (req,res,next)=>{
    req.body.bootcamp=req.params.bootcampId;
    req.body.user=req.user.id;
    const bootcamp=await Bootcamp.findById(req.params.bootcampId);
    if(!bootcamp){
        return next(new ErrorResponse(`No bootcamp found with ${req.params.bootcampId}`,404));
    }
    const review=await Review.create(req.body);
    res.status(201).json({
        success:true,
        data:review
    })
})
//@desc update review
//@route PUT /api/v1/reviews/:id
//@access private
exports.updateReview=asyncHandler(async (req,res,next)=>{

    let review=await Review.findById(req.params.id);
    if(!review){
        return next(new ErrorResponse(`No review found with ${req.params.id}`,404));
    }
    if(review.user.toString()!==req.user.id&&req.user.role!=='admin'){
        return next(new ErrorResponse(`not authorized to update this review`,404));

    }
    review=await Review.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true

    })
    res.status(201).json({
        success:true,
        data:review
    })
})
//@desc delete review
//@route DEL /api/v1/reviews/:id
//@access private
exports.deleteReview=asyncHandler(async (req,res,next)=>{

    const review=await Review.findById(req.params.id);
    if(!review){
        return next(new ErrorResponse(`No review found with ${req.params.id}`,404));
    }
    if(review.user.toString()!==req.user.id&&req.user.role!=='admin'){
        return next(new ErrorResponse(`not authorized to update this review`,404));

    }
   await review.remove();
    res.status(201).json({
        success:true,
        data:{}
    })
})