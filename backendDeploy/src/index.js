import dotenv from "dotenv"
dotenv.config({
    path:'./.env'
})

import connectDB from "./db/index.js";
import {app} from "./app.js"

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server running at port: ${process.env.PORT}`);
    })
})
.catch((error)=>{
    console.log("MongoDB Connection Failed: ",error);
})
// import express from "express";
// const app = express();
// function connectDb(){
//     try {
//         mongoose.connect(`${process.env.MONGODB_URI}/${dbName}`);
//         app.on("error",(error)=>{
//             console.log("Error: ",error);
//             throw error;
//         });
//         app.listen(process.env.PORT,()=>{
//             console.log(`App listening on port ${process.env.PORT}`);
            
//         });
//     } catch (error) {
//         console.error("Error: ",error);
//         throw error;
//     }
// }
// connectDb();