import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDb = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }
    const isConnected = await mongoose.connect(process.env.MONGO_URI, {
      dbName: "SecureAuth",
    });

    if(isConnected){
        console.log("MongoDb is connected")
    }
  } catch (error) {
    console.log(error);
    console.log("failed to connect DB");
  }
};

export default connectDb;
