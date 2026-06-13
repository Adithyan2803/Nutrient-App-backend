import mongoose from "mongoose";

const mealSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SignUp",
    required: true,
  },
  foodName: { type: String, required: true },
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },   // grams
  carbs: { type: Number, default: 0 },     // grams
  fat: { type: Number, default: 0 },       // grams
  fibre: { type: Number, default: 0 },     // grams
  servingSize: { type: Number, default: 0 }, // grams
  createdAt: { type: Date, default: Date.now },
});

const mealModel = mongoose.model("Meal", mealSchema);
export default mealModel;
