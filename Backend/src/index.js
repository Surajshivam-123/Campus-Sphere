import dotenv from "dotenv"
dotenv.config({path:'./.env'});

import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']); // Google DNS

import {app} from "./app.js"
import {connectDB} from "./db/index.js"

connectDB()
.then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log(`Server is running on http://localhost:${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("MONGo_DB connection failed",err);
})