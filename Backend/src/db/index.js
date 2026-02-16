import mongoose from "mongoose";

// mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
// export const connectDB = mongoose.connection;

// connectDB.once('open', () => console.log('Successfully connected to MongoDB'));
// connectDB.on('error', (e) => console.log(e));
export const connectDB=async ()=>{
    try {
        console.log(`${process.env.MONGODB_URI}`)
        const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URI}`)
        console.log(connectionInstance.connection.host);
        console.log("connected to MongoDB");
    } catch (error) {
        console.log("MongoDB connection Error:",error);
        process.exit(1);
    }
}


// import { MongoClient, ServerApiVersion } from 'mongodb';
// const uri = "mongodb+srv://skumar919810_db_user:<db_password>@campus-sphere.1vcerdd.mongodb.net/?appName=Campus-Sphere";

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// console.log(process.env.MONGODB_URI)
// const client = new MongoClient("mongodb+srv://skumar919810_db_user:Csph919810@campus-sphere.1vcerdd.mongodb.net/?appName=Campus-Sphere", {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });

// export async function connectDB() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();
//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } catch{
//     console.log("MongoDB Connection Error: ",error)
//   }
//   finally {
//     // Ensures that the client will close when you finish/error
//     await client.close();
//   }
// }
// // run().catch(console.dir);
