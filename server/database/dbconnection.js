import mongoose from "mongoose";
export const connection= () =>
{
    mongoose.connect(process.env.MONGO_URI, {
        dbName:"MERN_AUTHENTICATION",
    }).then(()=>
    {
        console.log("Connected to Database");
    })
    .catch((error)=>
    {
        console.log(`Some error occured while connecting to Database:  ${error}`);
    })
}  