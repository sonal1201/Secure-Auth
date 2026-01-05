import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import { createClient } from "redis";

// routes
import userRoute from "./routes/user_route.js";
import cookieParser from "cookie-parser";

dotenv.config();
await connectDb();

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.log("Missing redis url");
  process.exit(1);
}

export const redisClient = createClient({
  url: redisUrl,
});

redisClient
  .connect()
  .then(() => {
    console.log("connected to redis");
  })
  .catch(console.error);

const app = express();
const PORT = process.env.PORT;

//middleware
app.use(express.json());
app.use(cookieParser())

//using routes
app.use("/api/v1", userRoute);

app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});
