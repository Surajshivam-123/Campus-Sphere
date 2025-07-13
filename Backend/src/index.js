import {app} from "./app.js"
import {connectDB} from "./db/index.js"
import dotenv from "dotenv"

dotenv.config({path:'./.env'});

connectDB()
.then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log(`Server is running on http://localhost:${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("MONGo_DB connection failed",err);
})