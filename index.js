import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import signupRoute from "./Routes/signupRoute.js"
import loginRoute from "./Routes/loginRoute.js"
import profileRoute from "./Routes/profileRoute.js"
import mealRoute from "./Routes/mealRoute.js"
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const mongo_url = process.env.MONGO_URL ||
  "mongodb://adithyanlachu_db_user:aiYXA1itg7WY8Dhm@ac-jojmukh-shard-00-00.5v1mkhr.mongodb.net:27017,ac-jojmukh-shard-00-01.5v1mkhr.mongodb.net:27017,ac-jojmukh-shard-00-02.5v1mkhr.mongodb.net:27017/?ssl=true&replicaSet=atlas-lmz1bo-shard-0&authSource=admin&appName=Cluster0";

mongoose.connect(mongo_url);
try {
  console.log("db connected");
} catch (error) {
  console.log("error connecting to db");
  console.log(error());
}

app.use("/api/createAuth",signupRoute);
app.use("/api/auth",loginRoute);
app.use("/api/createUser",profileRoute);
app.use("/api/getUser",profileRoute)
app.use("/api/meals",mealRoute);

app.listen(5000, () => {
  console.log("Server started");
});
