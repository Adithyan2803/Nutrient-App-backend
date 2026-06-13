import express from "express";
import profileModel from "../Models/profileSchema.js";
import authMiddleware from "../Middleware/authMiddleware.js";

const router = express.Router();

router.get("/fetchUser", authMiddleware, async (req, res) => {
  try {
    const profile = await profileModel.findOne({ userId: req.userId }); // ✅ filter by logged-in user
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.status(200).json({ message: "fetched user", data: profile });
  } catch (error) {
    console.log("error fetching", error);
    res.status(500).json({ message: "error fetching" });
  }
});

router.post("/addUser", authMiddleware, async (req, res) => {
  const { name, age, height, weight, gender, activity } = req.body;
  try {
    const newPerson = new profileModel({
      userId: req.userId, // ✅ comes from token, not body
      name, age, height, weight, gender, activity
    });
    await newPerson.save();
    res.status(201).json({ message: "User added successfully" });
  } catch (error) {
    console.log("error adding person", error);
    res.status(500).json({ message: "Error adding user" });
  }
});

router.put("/updateUser", authMiddleware, async (req, res) => {
  const { age, height, weight, gender, activity } = req.body;
  try {
    const updated = await profileModel.findOneAndUpdate(
      { userId: req.userId },
      { age, height, weight, gender, activity },
      { new: true }
    );
    res.status(200).json({ message: "Profile updated", data: updated });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile" });
  }
});

export default router;