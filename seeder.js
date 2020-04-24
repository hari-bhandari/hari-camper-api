const fs=require('fs');
const mongoose=require('mongoose');
const dotenv=require('dotenv')

//load env vars
dotenv.config({path:'./config/config.env'})

//Load models
const Bootcamp=require('./models/Bootcamp')
const Course=require('./models/Course')
//connect to database
mongoose.connect('mongodb+srv://hari:hari@bootcamp-nosul.mongodb.net/bootcamp-data?retryWrites=true&w=majority',{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false,
    useUnifiedTopology:true
})
const bootcamps=JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`,'utf-8' ))
const courses=JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`,'utf-8' ))
//import into database
const importData= async ()=>
{
    try{

        await Bootcamp.create(bootcamps)
        await Course.create(courses)
        console.log('Data imported...')
        process.exit();
    }catch (err) {
        console.error(err);
    }
}
//Delete data
const deleteData= async ()=>
{
    try{

        await Bootcamp.deleteMany();
        await Course.deleteMany();
        console.log('Data Destroyed...')
        process.exit();
    }catch (err) {
        console.error(err);
    }
}

if(process.argv[2]==='-i'){
    importData();

}else if(process.argv[2]==='-d'){
    deleteData();
}
