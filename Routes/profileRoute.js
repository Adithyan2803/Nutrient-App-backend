import express from "express";
import profileModel from "../Models/profileSchema.js";

const router = express.Router();

router.post("/addUser",async (req,res) => {
    const {userId,name,age,height,weight,gender,activity} = req.body;
    try {
        const newPerson = new profileModel({
            userId,name,age,height,weight,gender,activity
        })
        await newPerson.save();
        console.log('person added')
    } catch (error) {
        console.log('error adding person');
        console.log(error);
    }
})

router.get("/fetchUser",async (req,res) => {
    const existingPerson = await profileModel.find();
    try {
        console.log(existingPerson);
        console.log('fetched user details')
    } catch (error) {
        console.log("error fetching");
        console.log(error)
    }
})

export default router;