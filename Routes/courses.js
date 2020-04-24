const express =require('express');
const Course=require('../models/Course')
const advancedResults=require('../middleware/advancedResult')
const router=express.Router({mergeParams:true});
const {getCourses,getCourse,addCourse,updateCourse,deleteCourse }=require('../controllers/courses')

//env vars
router.route('/').get(advancedResults(Course,{path:'bootcamp',
    select:'name description'}),getCourses).post(addCourse);
router.route('/:id').get(getCourse).put(updateCourse).delete(deleteCourse);




module.exports=router