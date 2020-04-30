const express =require('express');
const Review=require('../models/Review')
const advancedResults=require('../middleware/advancedResult')
const router=express.Router({mergeParams:true});
const {getReviews,getReview, addReview,updateReview,deleteReview}=require('../controllers/reviews');
const {protect,authorize}=require('../middleware/auth')

//env vars
router.route('/').get(advancedResults(Review,{path:'bootcamp',
    select:'name description'}),getReviews).post(protect,authorize('user','admin'),addReview)
router.route('/:id').get(getReview).put(protect,authorize('user','admin'),updateReview).delete(protect,authorize('user','admin'),deleteReview)
module.exports=router