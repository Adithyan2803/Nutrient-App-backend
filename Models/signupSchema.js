import mongoose from "mongoose";
import express from "express";

const signupSchema = new mongoose.Schema({
    email:{
        type:String,
        require:true
    },
    password:{
        type:String,
        require:true
    }
})

const signupModel = mongoose.model("SignUp",signupSchema);
export default signupModel;