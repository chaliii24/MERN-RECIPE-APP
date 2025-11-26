// routes/adminRoutes.js
import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import Recipe from "../models/Recipe.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Admin only middleware
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Admin access required" });
};

// Protect + adminOnly for all routes below
router.use(protect, adminOnly);

// ----------- USERS ------------

// Get all users, with optional search by username or email
router.get("/users", async (req, res) => {
  try {
    const { q } = req.query;
    const filter = q
      ? {
          $or: [
            { username: { $regex: q, $options: "i" } },
            { email: { $regex: q, $options: "i" } },
          ],
        }
      : {};
    const users = await User.find(filter).sort({ createdAt: -1 }).select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// Get single user by id
router.get("/users/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ message: "Invalid user ID" });

    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update user (username, email, role if you have, etc. — exclude password for safety)
router.put("/users/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ message: "Invalid user ID" });

    const { username, email } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (username) user.username = username;
    if (email) user.email = email;

    await user.save();
    res.json({ message: "User updated", user });
  } catch (err) {
    res.status(500).json({ message: "Failed to update user" });
  }
});

// Delete user (you may want to also delete their recipes, or keep as is)
router.delete("/users/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ message: "Invalid user ID" });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Optionally, delete user's recipes:
    await Recipe.deleteMany({ createdBy: user._id });

    await user.deleteOne();
    res.json({ message: "User and their recipes deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user" });
  }
});

// ----------- RECIPES ------------

// Get all recipes, with optional search by title or category
router.get("/recipes", async (req, res) => {
  try {
    const { q } = req.query;
    const filter = q
      ? {
          $or: [
            { title: { $regex: q, $options: "i" } },
            { category: { $regex: q, $options: "i" } },
          ],
        }
      : {};

    // populate createdBy to get author info for admin panel display
    const recipes = await Recipe.find(filter)
      .populate("createdBy", "username email")
      .sort({ createdAt: -1 });

    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch recipes" });
  }
});

// Get single recipe by id
router.get("/recipes/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ message: "Invalid recipe ID" });

    const recipe = await Recipe.findById(req.params.id).populate("createdBy", "username email");
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    res.json(recipe);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update recipe by id
router.put("/recipes/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ message: "Invalid recipe ID" });

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    const {
      title,
      ingredients,
      instructions,
      category,
      image,
      cookingTime,
    } = req.body;

    if (title) recipe.title = title;
    if (ingredients) recipe.ingredients = ingredients;
    if (instructions) recipe.instructions = instructions;
    if (category) recipe.category = category;
    if (image) recipe.image = image;
    if (cookingTime) recipe.cookingTime = cookingTime;

    await recipe.save();
    res.json({ message: "Recipe updated", recipe });
  } catch (err) {
    res.status(500).json({ message: "Failed to update recipe" });
  }
});

// Delete recipe by id
router.delete("/recipes/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ message: "Invalid recipe ID" });

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    await recipe.deleteOne();
    res.json({ message: "Recipe deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete recipe" });
  }
});

export default router;
