//@desc Get all bootcamps
//@route GET /api/v1/bootcamps
//@access Public
exports.getBootcamps=(req,res,next)=>{
    res.status(400).json({success: true, msg: 'show all bootcamp'})
}
//@desc Get single  bootcamp
//@route GET /api/v1/bootcamp:id
//@access Public
exports.getBootcamp=(req,res,next)=>{
    res.status(400).json({success: true, msg: `show bootcamp ${req.params.id}`})
}
//@desc Create new  bootcamp
//@route POST /api/v1/bootcamp:id
//@access private
exports.createBootcamp=(req,res,next)=>{
    res.status(400).json({success: true, msg: 'create new bootcamp'})
}
//@desc update new  bootcamp
//@route PUT /api/v1/bootcamp:id
//@access private
exports.updateBootcamp=(req,res,next)=>{
        res.status(400).json({success: true, msg: `update bootcamp ${req.params.id}`})
}
//@desc delete new  bootcamp
//@route Delete /api/v1/bootcamp:id
//@access private
exports.deleteBootcamp=(req,res,next)=>{
    res.status(400).json({success: true, msg: `delete bootcamp ${req.params.id}`})
}