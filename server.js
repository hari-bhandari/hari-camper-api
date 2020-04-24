const express =require('express');
const path=require('path')
const dotenv=require('dotenv');
const morgan=require('morgan')
const errorHandler=require('./middleware/error')
const connectDB=require('./config/db')
const fileUpload=require('express-fileupload')

//env vars
dotenv.config({path:'./config/config.env'});
//ROutes files
const bootcamps=require('./Routes/bootcamps');
const courses=require('./Routes/courses');
const auth=require('./Routes/auth');
const logger=require('./middleware/logger')

const app= express();
//connect to the server
connectDB();
//Body parser
app.use(express.json());



if(process.env.NODE_ENV==='development'){
    app.use(morgan('dev'))
}
//file upload
app.use(fileUpload());

//set static folder
app.use(express.static(path.join(__dirname,'public')))
//Mount router
app.use('/api/v1/bootcamps',bootcamps);
app.use('/api/v1/courses',courses);
app.use('/api/v1/auth',auth);

//error handler middle ware
app.use(errorHandler)

const PORT=process.env.PORT||5000;
const server=app.listen(PORT,console.log(`server running in ${process.env.NODE_ENV} mode on port ${PORT}`))
//handle unhandled promised rejections
process.on('unhandledRejection',(err,promise)=>{
    console.log(`error:${err.message}`)
    server.close(()=>process.exit(1))
});
