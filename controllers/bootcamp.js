const Bootcamp=require('../modals/Bootcamp');
const asyncHandler=require('../middleware/async')
const ErrorResponse=require('../utils/errorResponse')
const geocoder=require('../utils/geocoder')
const path=require('path')
//@desc Get all bootcamps
//@route GET /api/v1/bootcamps
//@access Public
exports.getBootcamps=asyncHandler(async  (req,res,next)=>{
    let query;
    //copy req.query
    const reqQuery={...req.query}
    //fields to exclude
    const removeFields=['select','sort','page','limit'];

    //loop over removeFields and delete from
    // req query
    removeFields.forEach(param=>delete reqQuery[param])

    //create query String
    let queryStr=JSON.stringify(reqQuery);

    //Create operators ($ge,$gte etc)
    queryStr=queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g,match=>`$${match}`);
    //FINDING RESOURCE
    query=Bootcamp.find(JSON.parse(queryStr)).populate('courses');
    //SELECT fields
    if(req.query.select){
        const fields=req.query.select.split(',').join(' ');
        query=query.select(fields)
    }
    //sort
    if(req.query.sort){
        const sortBy=req.query.sort.split(',').join(' ');
        query=query.sort(sortBy);

    }else {
        query=query.sort('-createdAt')
    }
    //pagination
    const page=parseInt(req.query.page,10)||1;
    const limit=parseInt(req.query.limit,10)||25;
    const startIndex=(page-1)*limit;
    const endIndex=page*limit;
    const total=await Bootcamp.countDocuments()
    query=query.skip(startIndex).limit(limit);
    //executing query
    const bootcamps=await query;
    //pagination results
    const pagination={};
    if(endIndex<total){
        pagination.next={
            page:page+1,
            limit
        }
    }
    if(startIndex>0){
        pagination.prev={
            page:page-1,
            limit
        }
    }
    res.status(200).json({
        success:true,
        count:bootcamps.length,
        pagination:pagination,
        data:bootcamps
    })
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
    const bootcamp=await Bootcamp.create(req.body);

    res.status(201).json({
        success:true,
        data:bootcamp
    });



});

//@desc update new  bootcamp
//@route PUT /api/v1/bootcamp:id
//@access private
exports.updateBootcamp= asyncHandler(async (req,res,next)=>{
    const bootcamp=await Bootcamp.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true
    });
    if(!bootcamp){
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404));
    }
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
    file.mv(`${process.env.FILE_UPLOAD_PATH}`, async err=>{
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