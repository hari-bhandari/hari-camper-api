const express =require('express');
const router=express.Router();
const {getBootcamps,getBootcamp,createBootcamp,deleteBootcamp,updateBootcamp,getBootcampsInRadius,bootcampPhotoUpload }=require('../controllers/bootcamp')
const advancedResults=require('../middleware/advancedResult')
const Bootcamp=require('../models/Bootcamp')
//Include other resource router
const courseRouter=require('./courses')
//Re route into other resource routers
router.use('/:bootcampId/courses',courseRouter)
//env vars
router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);
router.route('/').get(advancedResults(Bootcamp,'courses'),getBootcamps).post(createBootcamp);
router.route('/:id').get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp);
router.route('/:id/photo').put(bootcampPhotoUpload);

module.exports=router
