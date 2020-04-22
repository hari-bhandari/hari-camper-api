const express =require('express');
const dotenv=require('dotenv');
const morgan=require('morgan')
const errorHandler=require('./middleware/error')
const connectDB=require('./config/db')
//env vars
dotenv.config({path:'./config/config.env'});
//ROutes files
const bootcamps=require('./Routes/bootcamps');
const logger=require('./middleware/logger')

const app= express();
//connect to the server
connectDB();
//Body parser
app.use(express.json());



if(process.env.NODE_ENV==='development'){
    app.use(morgan('dev'))
}

//Mount router
app.use('/api/v1/bootcamps',bootcamps);

//error handler middle ware
app.use(errorHandler)

const PORT=process.env.PORT||5000;
const server=app.listen(PORT,console.log(`server running in ${process.env.NODE_ENV} mode on port ${PORT}`))
//handle unhandled promised rejections
process.on('unhandledRejection',(err,promise)=>{
    console.log(`error:${err.message}`)
    server.close(()=>process.exit(1))
});
