// require('dotenv').config({path: './env'})   // iss se code ki consistancy kharab hoti hai
import dotenv from "dotenv"   // jitani jaldi application load ho utani jaldi sare hi environment variable sari jagah pe available ho jane chahiye 
import connectDB from "../src/db/index.db.js";   // simpaly import connection vali separate file 
import {app} from './app.js'
dotenv.config({
    path: './.env'
})

//agar DB coonection fail ho jaye
connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})


/*  // 2nd method: connect database 
import express from "express"
const app = express()
( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)// DB_NAME jo constant.js me hai
        // listener 
        app.on("errror", (error) => {
            console.log("ERRR: ", error);
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
        })

    } catch (error) {
        console.error("ERROR: ", error)
        throw err
    }
})()

*/