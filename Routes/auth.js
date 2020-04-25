const express=require('express');
const {register,login,getMe}=require('../controllers/auth');

const router=express.Router();

const {protect}=require('../middleware/auth')
router.post('/register',register);
router.post('/login',login)
router.route('/me').get(protect,getMe)


module.exports=router;