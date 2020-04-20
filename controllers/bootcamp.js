const Bootcamp=require('../modals/Bootcamp')
//@desc Get all bootcamps
//@route GET /api/v1/bootcamps
//@access Public
exports.getBootcamps=async  (req,res,next)=>{
    try{
        const bootcamps=await Bootcamp.find();
        res.status(200).json({
            success:true,
            count:bootcamps.length,
            data:bootcamps
        })
    }catch (e) {
        res.status(400).json({
            success:false
        })
    }
}
//@desc Get single  bootcamp
//@route GET /api/v1/bootcamp:id
//@access Public
exports.getBootcamp=async (req,res,next)=>{
    try{
        const bootcamp=await Bootcamp.findById(req.params.id)
        if(!bootcamp){
            return res.status(400).json({
                success:false
            });
        }
        res.status(200).json({
            success:true,
            data:bootcamp
        })
    }catch (e) {
        res.status(400).json({
            success:false
        })
    }
}
//@desc Create new  bootcamp
//@route POST /api/v1/bootcamp:id
//@access private

exports.createBootcamp=  async (req,res,next)=>{
    try{
        const bootcamp=await Bootcamp.create(req.body);

        res.status(201).json({
            success:true,
            data:bootcamp
        });
    }catch (e) {
        res.status(400).json({
            success:false
        })
    }



};

//@desc update new  bootcamp
//@route PUT /api/v1/bootcamp:id
//@access private
exports.updateBootcamp= async (req,res,next)=>{
    try{
        const bootcamp=await Bootcamp.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true
        });
        if(!bootcamp){
            return res.status(400).json({
                success:false
            })
        }
        res.status(200).json({
            success:true,
            data:bootcamp
        });
    }catch (e) {
        res.status(400).json({
            success:false
        })
    }

}
//@desc delete new  bootcamp
//@route Delete /api/v1/bootcamp:id
//@access private
exports.deleteBootcamp=async (req,res,next)=> {
    try{
        const bootcamp=await Bootcamp.findByIdAndDelete(req.params.id,req.body);
        if(!bootcamp){
            return res.status(400).json({
                success:false
            })
        }
        res.status(200).json({
            success:true,
            data: {}
        });
    }catch (e) {
        res.status(400).json({
            success:false
        })
    }
}
