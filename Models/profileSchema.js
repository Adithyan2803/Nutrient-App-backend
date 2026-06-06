import mongoose, { mongo } from "mongoose";
import express from "express";

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SignUp",
    required: true,
  },
  name: { type: String },
  age: { type: Number },
  height: { type: Number }, //in cm
  weight: { type: Number }, // in kg
  gender: { type: String, enum:["Male", "Female", "Others"]},
  activity:{type:String, enum:["No Exercise", "Moderate Exercise", "Daily Workout"]},
},
{timestamps:true}
);

const profileModel = mongoose.model("Profile",profileSchema);
export default profileModel;
