import express from "express";
import axios from "axios";
import mealModel from "../Models/mealSchema.js";
import authMiddleware from "../Middleware/authMiddleware.js";

const router = express.Router();

// Helper: Extract specific nutrient from USDA foodNutrients array
const getNutrient = (nutrients, nutrientName) => {
  const found = nutrients.find((n) => {
    const name = (n.nutrientName || n.name || "").toLowerCase();
    return name.includes(nutrientName.toLowerCase());
  });
  return found ? Math.round((found.value || 0) * 10) / 10 : 0;
};

// POST /addMeal — search food via USDA FoodData Central, extract nutrients, save to DB
router.post("/addMeal", authMiddleware, async (req, res) => {
  const { foodName } = req.body;

  if (!foodName) {
    return res.status(400).json({ error: "Food name is required" });
  }

  try {
    // Step 1: Search for the food item
    const searchResponse = await axios.get(
      "https://api.nal.usda.gov/fdc/v1/foods/search",
      {
        params: {
          api_key: process.env.USDA_API_KEY,
          query: foodName,
          pageSize: 1, // Get the top match
          dataType: "Survey (FNDDS)", // Prefer common food items
        },
      }
    );

    const foods = searchResponse.data.foods;

    if (!foods || foods.length === 0) {
      return res
        .status(404)
        .json({ error: "No nutrition data found for this food" });
    }

    const topResult = foods[0];
    const nutrients = topResult.foodNutrients || [];

    // Step 2: Extract the nutrients we need
    // USDA nutrient names:
    //   - "Energy" (kcal)
    //   - "Protein" (g)
    //   - "Carbohydrate, by difference" (g)
    //   - "Total lipid (fat)" (g)
    //   - "Fiber, total dietary" (g)
    const calories = getNutrient(nutrients, "Energy");
    const protein = getNutrient(nutrients, "Protein");
    const carbs = getNutrient(nutrients, "Carbohydrate, by difference");
    const fat = getNutrient(nutrients, "Total lipid (fat)");
    const fibre = getNutrient(nutrients, "Fiber, total dietary");

    // Serving size: USDA provides per 100g, but search results may include servingSize
    const servingSize = topResult.servingSize || 100;

    // Step 3: Save meal to database
    const newMeal = new mealModel({
      userId: req.userId,
      foodName: topResult.description || foodName, // Use USDA's description for accuracy
      calories,
      protein,
      carbs,
      fat,
      fibre,
      servingSize,
    });

    await newMeal.save();

    res.status(201).json({
      message: "Meal added successfully",
      data: newMeal,
    });
  } catch (error) {
    console.error("Error adding meal:", error.message);
    if (error.response?.status === 403) {
      return res.status(500).json({ error: "Invalid USDA API key" });
    }
    res.status(500).json({ error: "Error adding meal" });
  }
});

// GET /fetchMeals — return all meals for the logged-in user (newest first)
router.get("/fetchMeals", authMiddleware, async (req, res) => {
  try {
    const meals = await mealModel
      .find({ userId: req.userId })
      .sort({ createdAt: -1 });
    res.status(200).json({ message: "Meals fetched", data: meals });
  } catch (error) {
    console.error("Error fetching meals:", error);
    res.status(500).json({ error: "Error fetching meals" });
  }
});

// DELETE /deleteMeal/:id — delete a meal by its _id (only if it belongs to user)
router.delete("/deleteMeal/:id", authMiddleware, async (req, res) => {
  try {
    const meal = await mealModel.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId, // ensure user can only delete their own meals
    });

    if (!meal) {
      return res.status(404).json({ error: "Meal not found" });
    }

    res.status(200).json({ message: "Meal deleted successfully" });
  } catch (error) {
    console.error("Error deleting meal:", error);
    res.status(500).json({ error: "Error deleting meal" });
  }
});

export default router;
