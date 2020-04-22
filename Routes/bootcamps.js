const express =require('express');
const router=express.Router();
const {getBootcamps,getBootcamp,createBootcamp,deleteBootcamp,updateBootcamp,getBootcampsInRadius }=require('../controllers/bootcamp')

//env vars
router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);
router.route('/').get(getBootcamps).post(createBootcamp);
router.route('/:id').get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp);

module.exports=router
