const Bootcamp=require('../models/Bootcamp');
const asyncHandler=require('../middleware/async')
const ErrorResponse=require('../utils/errorResponse')
const geocoder=require('../utils/geocoder')
const path=require('path')
//@desc Get all bootcamps
//@route GET /api/v1/bootcamps
//@access Public
exports.getBootcamps=asyncHandler(async  (req,res,next)=>{

    res.status(200).json(res.advancedResults)
})

//@desc Get single  bootcamp
//@route GET /api/v1/bootcamp:id
//@access Public
exports.getBootcamp=asyncHandler(async (req,res,next)=>{
    const bootcamp=await Bootcamp.findById(req.params.id)
    if(!bootcamp){
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404))
    }
    res.status(200).json({
        success:true,
        data:bootcamp
    })
})
//@desc Create new  bootcamp
//@route POST /api/v1/bootcamp:id
//@access private

exports.createBootcamp=  asyncHandler(async (req,res,next)=>{
    //add user to req.body
    req.body.user=req.user.id;
    //check for published bootcamps
    const publishedBootcamp=await Bootcamp.findOne({user: req.user.id});
    if(publishedBootcamp&&req.user.role!='admin'){
        return next(new ErrorResponse(`The user with ID ${req.user.id} has already published a bootcamp`,400))
    }
    const bootcamp=await Bootcamp.create(req.body)
    res.status(201).json({
        success:true,
        data:bootcamp
    })




});

//@desc update new  bootcamp
//@route PUT /api/v1/bootcamp:id
//@access private
exports.updateBootcamp= asyncHandler(async (req,res,next)=>{
    let bootcamp=await Bootcamp.findById(req.params.id);
    if(!bootcamp){
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404));
    }
    //make sure user is bootcamp user
    if(bootcamp.user.toString()!==req.user.id&&req.user.role!=='admin'){
        return next(new ErrorResponse(`User ${req.params.id} is not authorized to update this bootcamp`,401));
    }
    bootcamp=await Bootcamp.findOneAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true
    })
    res.status(200).json({
        success:true,
        data:bootcamp
    });

})
//@desc delete new  bootcamp
//@route Delete /api/v1/bootcamp:id
//@access private
exports.deleteBootcamp=asyncHandler(async (req,res,next)=> {
    const bootcamp=await Bootcamp.findById(req.params.id,req.body);
    if(!bootcamp){
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404))
    }
    if(bootcamp.user.toString()!==req.user.id&&req.user.role!=='admin'){
        return next(new ErrorResponse(`User ${req.params.id} is not authorized to delete this bootcamp`,401));
    }
    bootcamp.remove();
    res.status(200).json({
        success:true,
        data: {}
    });
})
//@desc get  bootcamp within a radius
//@route GET
// /api/v1/bootcamp/radius/:zipcode/:distance
//@access private
exports.getBootcampsInRadius=asyncHandler(async (req,res,next)=> {
    const{zipcode,distance}=req.params;
    // get lat/lon from geocoder
    const loc=await geocoder.geocode(zipcode);
    const lat=loc[0].latitude;
    const lon=loc[0].longitude;
    //calc radius using radians
    //Divide dist by radius of Earth
    const earthRadius=3963;
    const radius=distance/earthRadius;
    const bootcamps=await Bootcamp.find({
        location:{$geoWithin:{$centerSphere:[[lon,lat],radius]}}
    });
    res.status(200).json({
        success:true,
        count:bootcamps.length,
        data:bootcamps
    })
});
//@desc upload photo for bootcamp
//@route PUT /api/v1/bootcamp/:id/photo
//@access private
exports.bootcampPhotoUpload=asyncHandler(async (req,res,next)=> {
    const bootcampPhotoUpload=await Bootcamp.findById(req.params.id,req.body);
    const bootcamp=await Bootcamp.findById(req.params.id);


    if(!bootcamp){
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404))
    }
    //make sure user is bootcamp user
    if(bootcamp.user.toString()!==req.user.id&&req.user.role!=='admin'){
        return next(new ErrorResponse(`User ${req.user.name} is not authorized to update this bootcamp`,401));
    }
    if(!req.files){
        return next(new ErrorResponse(`Please upload a file`,400))
    }
    const file=req.files.file;
    if(!file.mimetype.startsWith('image')){
        return next(new ErrorResponse(`Please upload an image file`,400))
    }
    if(file.size>process.env.MAX_FILE_UPLOAD){
        return next(new ErrorResponse(`Please upload an image file less than ${process.env.MAX_FILE_UPLOAD}`,400))
    }

    //create custom file name
    file.name=`photo_${req.params.id}${path.parse(file.name).ext}`
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err=>{
        if(err){
            console.error(err)
            return next(new ErrorResponse(`problem with file upload `,500))
        }
        await Bootcamp.findByIdAndUpdate(req.params.id,{photo:file.name});
        res.status(200).json({
            success:true,
            data:file.name
        })
    })
    console.log(file.name)
})