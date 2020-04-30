const express =require('express');
const path=require('path')
const dotenv=require('dotenv');
const morgan=require('morgan')
const errorHandler=require('./middleware/error')
const connectDB=require('./config/db')
const fileUpload=require('express-fileupload')
const cookieParser=require('cookie-parser')
const mongoSanitize=require('express-mongo-sanitize')
const helmet=require('helmet')
const xss=require('xss-clean')
const rateLimit=require('express-rate-limit');
const hpp=require('hpp')
const cors=require('cors')

//env vars
dotenv.config({path:'./config/config.env'});
//ROutes files
const bootcamps=require('./Routes/bootcamps');
const courses=require('./Routes/courses');
const auth=require('./Routes/auth');
const users =require('./Routes/users');
const reviews =require('./Routes/reviews');
const logger=require('./middleware/logger')

const app= express();
//connect to the server
connectDB();
//Body parser
app.use(express.json());

//Cookie parser
app.use(cookieParser())

//sanitize data
app.use(mongoSanitize())

if(process.env.NODE_ENV==='development'){
    app.use(morgan('dev'))
}
//helmet for headers
app.use(helmet())
//file upload
app.use(fileUpload());
//prevent xss attcs
app.use(xss())
//rate limit
const limiter=rateLimit({
    windowMs:10*1000*60,
    max:1000
})
app.use(limiter);
//prevent http param pollution
app.use(hpp())
//ebable corse
app.use(cors())
//set static folder
app.use(express.static(path.join(__dirname,'public')))
//Mount router
app.use('/api/v1/bootcamps',bootcamps);
app.use('/api/v1/courses',courses);
app.use('/api/v1/auth/users',users);
app.use('/api/v1/auth',auth);
app.use('/api/v1/reviews',reviews);


//error handler middle ware
app.use(errorHandler)

const PORT=process.env.PORT||5000;
const server=app.listen(PORT,console.log(`server running in ${process.env.NODE_ENV} mode on port ${PORT}`))
//handle unhandled promised rejections
process.on('unhandledRejection',(err,promise)=>{
    console.log(`error:${err.message}`)
    server.close(()=>process.exit(1))
});
