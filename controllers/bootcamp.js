const Bootcamp=require('../modals/Bootcamp');
const asyncHandler=require('../middleware/async')
const ErrorResponse=require('../utils/errorResponse')
const geocoder=require('../utils/geocoder')
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
    query=Bootcamp.find(JSON.parse(queryStr));
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
    const bootcamp=await Bootcamp.findByIdAndDelete(req.params.id,req.body);
    if(!bootcamp){
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404))
    }
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
})