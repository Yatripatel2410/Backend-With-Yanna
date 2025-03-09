// require('dotenv').config({path: './env'})    // iss se consistency jyada ho jati hai
import dotenv from "dotenv"

import mongoose from "mongoose";    
import {DB_NAME} from "./constants"
import connectDB from "./db/index.js";


dotenv.config({
    path: './env'
})


connectDB()








/* 
// connect database

import express from "express"
const app = express()

// function connectDB(){}

//connectDB()  

( async () => {
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.log("ERR: ", error);
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`)
        })

    }
    catch(error){
        console.error("ERROR: ", error);
        throw error
    }
} )()

*/