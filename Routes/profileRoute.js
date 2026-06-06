import express from "express";
import profileModel from "../Models/profileSchema.js";
import jwt from "jsonwebtoken";

const router = express.Router();

const authMiddleware = (req, res, next) => {
  let token = req.headers["authorization"] || req.headers["Authorization"];
  if (!token) return res.status(401).json({ error: "Access denied" });

  // Support both raw token and 'Bearer <token>' formats
  if (typeof token === "string" && token.startsWith("Bearer ")) {
    token = token.split(" ")[1];
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // attach decoded user info
    next();
  } catch (error) {
    console.error("JWT verification failed:", error);
    res.status(400).json({ error: "Invalid token" });
  }
};


router.post("/addUser", authMiddleware, async (req, res) => {
  const { name, age, height, weight, gender, activity } = req.body;

  try {
    const newPerson = new profileModel({
      userId: req.user.id, // from JWT
      name,
      age,
      height,
      weight,
      gender,
      activity,
    });

    await newPerson.save();

    res.status(200).json({
      message: "User added successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error adding user",
    });
  }
});


router.get("/fetchUser", authMiddleware, async (req, res) => {
  try {
    console.log("Decoded JWT:", req.user);

    const existingPerson = await profileModel.findOne({
      userId: req.user.id,
    });

    console.log("Profile Found:", existingPerson);

    if (!existingPerson) {
      return res.status(404).json({
        message: "Profile not found",
      });
    }

    res.status(200).json(existingPerson);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
