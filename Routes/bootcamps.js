const express =require('express');
const router=express.Router();
const {getBootcamps,getBootcamp,createBootcamp,deleteBootcamp,updateBootcamp,getBootcampsInRadius,bootcampPhotoUpload }=require('../controllers/bootcamp')
const advancedResults=require('../middleware/advancedResult')
const Bootcamp=require('../models/Bootcamp')

const {protect,authorize}=require('../middleware/auth')

//Include other resource router
const courseRouter=require('./courses')
const reviewRouter=require('./reviews')
//Re route into other resource routers
router.use('/:bootcampId/courses',courseRouter)
router.use('/:bootcampId/reviews',reviewRouter)
//env vars
router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);
router.route('/').get(advancedResults(Bootcamp),getBootcamps).post(protect,authorize('publisher','admin'),createBootcamp);
router.route('/:id').get(getBootcamp).put(protect,authorize('publisher','admin'),updateBootcamp).delete(protect,authorize('publisher','admin'),deleteBootcamp);
router.route('/:id/photo').put(protect,authorize('publisher','admin'),bootcampPhotoUpload);

module.exports=router
