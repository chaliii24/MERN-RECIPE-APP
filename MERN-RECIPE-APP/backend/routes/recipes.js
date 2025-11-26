import express from "express";
import mongoose from "mongoose";
import Recipe from "../models/Recipe.js";
import { protect } from "../middleware/auth.js";
import { optionalAuth } from "../middleware/optionalAuth.js";
import multer from "multer";

// FIX: This pattern ensures packages originally written for CommonJS (like cloudinary)
// can be imported correctly when the project uses ES Modules ("type": "module").
import pkg from "cloudinary";
const { v2: cloudinary } = pkg;
import { CloudinaryStorage } from "multer-storage-cloudinary";

const router = express.Router();

// --- CLOUDINARY CONFIGURATION ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- Cloudinary Storage Setup and Multer Middleware ---
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Recipedia-Images",
    allowed_formats: ["jpeg", "jpg", "png"],
    transformation: [{ width: 800, height: 600, crop: "limit" }],
    public_id: (req, file) => `recipe-${Date.now()}`,
  },
});

const upload = multer({ storage });


// =======================================================
// POST /api/recipes - Create new recipe (PROTECTED)
// =======================================================
router.post("/", protect, upload.single("image"), async (req, res) => {
  try {
    const { title, description, instructions, category, cookingTime } = req.body;

    // 🔥 ROBUST INGREDIENT PARSING 🔥
    let ingredientsArray = [];

    // Case 1: Handle JSON stringified data or simple array/string
    if (req.body.ingredients) {
      try {
        ingredientsArray = JSON.parse(req.body.ingredients);
        if (!Array.isArray(ingredientsArray)) {
          ingredientsArray = [req.body.ingredients];
        }
      } catch (e) {
        if (Array.isArray(req.body.ingredients)) {
          ingredientsArray = req.body.ingredients;
        } else {
          ingredientsArray = [req.body.ingredients];
        }
      }
    }

    // Case 2: Handle indexed keys from FormData
    else {
      ingredientsArray = Object.keys(req.body)
        .filter(key => key.startsWith('ingredients['))
        .sort()
        .map(key => req.body[key]);
    }

    // Validation check
    if (!title || ingredientsArray.length === 0 || !instructions || !category) {
        // Clean up uploaded image if validation fails
        if (req.file && req.file.path) {
            const publicId = req.file.path.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId).catch(cleanupErr => console.error("Cloudinary cleanup failed on validation error:", cleanupErr));
        }
        return res.status(400).json({ message: "Please fill all required fields (title, ingredients, instructions, category)." });
    }

    // req.file.path contains the permanent Cloudinary URL
    const imageUrl = req.file ? req.file.path : null;

    const recipe = new Recipe({
      title,
      description,
      ingredients: ingredientsArray.filter(Boolean),
      instructions,
      category,
      cookingTime,
      image: imageUrl,
      createdBy: req.user._id,
    });

    await recipe.save();
    res.status(201).json(recipe);

  } catch (error) {
    // Attempt to clean up image on generic server error
    if (req.file && req.file.path) {
      const publicId = req.file.path.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId).catch(cleanupErr => console.error("Cloudinary cleanup failed on server error:", cleanupErr));
    }
    console.error("❌ Recipe creation failed:", error);
    res.status(500).json({
      message: "Failed to create recipe due to a server error.",
      detail: error.message
    });
  }
});


// =======================================================
// GET /api/recipes - Fetch all recipes
// =======================================================
router.get("/", optionalAuth, async (req, res) => {
  const { category } = req.query;
  try {
    const query = category ? { category } : {};
    const recipes = await Recipe.find(query).sort({ createdAt: -1 });
    const recipesWithLike = recipes.map((r) => ({
      ...r.toObject(),
      likedByUser: req.user ? r.likedBy.some((id) => id.equals(req.user._id)) : false,
    }));
    res.json(recipesWithLike);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// =======================================================
// GET /api/recipes/latest - Get latest 3
// =======================================================
router.get("/latest", async (req, res) => {
  try {
    const recipes = await Recipe.find().sort({ createdAt: -1 }).limit(3);
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch latest recipes" });
  }
});

// =======================================================
// GET /api/recipes/search/query - Search
// =======================================================
router.get("/search/query", optionalAuth, async (req, res) => {
  const { q } = req.query;
  try {
    const regex = new RegExp(q, "i");
    const recipes = await Recipe.find({ title: regex });
    const recipesWithLike = recipes.map((r) => ({
      ...r.toObject(),
      likedByUser: req.user ? r.likedBy.some((id) => id.equals(req.user._id)) : false,
    }));
    res.json(recipesWithLike);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ====================== Protected Routes ====================== //

// Get current user's own recipes
router.get("/my", protect, async (req, res) => {
  try {
    const recipes = await Recipe.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch your recipes" });
  }
});

// Get user's liked recipes
router.get("/favorites", protect, async (req, res) => {
  try {
    const { q } = req.query;
    const searchFilter = q ? { title: new RegExp(q, "i") } : {};
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const favorites = await Recipe.find({ likedBy: userId, ...searchFilter }).sort({ createdAt: -1 });
    res.json(favorites);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch liked recipes" });
  }
});

// Update a recipe
router.put("/:id", protect, upload.single("image"), async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    if (recipe.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }
    
    const { title, ingredients, instructions, category, cookingTime } = req.body;
    
    // Handle potential new image upload
    if (req.file && req.file.path) {
      // Delete old image from Cloudinary
      if (recipe.image) {
        const publicId = recipe.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }
      recipe.image = req.file.path;
    }

    if (title) recipe.title = title;
    if (ingredients) recipe.ingredients = ingredients;
    if (instructions) recipe.instructions = instructions;
    if (category) recipe.category = category;
    if (cookingTime) recipe.cookingTime = cookingTime;

    await recipe.save();
    res.json({ message: "Recipe updated successfully", recipe });
  } catch (err) {
    console.error("❌ Recipe update failed:", err);
    res.status(500).json({ message: "Failed to update recipe" });
  }
});

// Delete a recipe 
router.delete("/:id", protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid ID" });
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    const isAdmin = req.user.email === "admin@gmail.com"; 
    const isOwner = recipe.createdBy.toString() === req.user._id.toString();

    if (!isOwner && !isAdmin) return res.status(401).json({ message: "Not authorized" });

    // Delete image from Cloudinary before deleting the document
    if (recipe.image) {
      const publicId = recipe.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    await recipe.deleteOne();
    res.json({ message: "Recipe deleted" });
  } catch (err) {
    console.error("❌ Recipe delete failed:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Toggle like
router.post("/:id/like", protect, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    const userId = req.user._id;
    const likedIndex = recipe.likedBy.findIndex((id) => id.equals(userId));

    if (likedIndex === -1) {
      recipe.likes = (recipe.likes || 0) + 1;
      recipe.likedBy.push(userId);
    } else {
      recipe.likes = Math.max((recipe.likes || 1) - 1, 0);
      recipe.likedBy.splice(likedIndex, 1);
    }
    await recipe.save();
    res.json({ likes: recipe.likes, likedByUser: likedIndex === -1 });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Rate
router.post("/:id/rate", protect, async (req, res) => {
  try {
    const { value } = req.body;
    if (!value || value < 1 || value > 5) return res.status(400).json({ message: "Rating must be 1-5" });

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    const userId = req.user._id.toString();
    const existing = recipe.ratings.findIndex((r) => r.user.toString() === userId);

    if (existing !== -1) recipe.ratings[existing].value = value;
    else recipe.ratings.push({ user: userId, value });

    recipe.rating = recipe.ratings.reduce((acc, r) => acc + r.value, 0) / recipe.ratings.length;
    await recipe.save();
    res.json({ rating: recipe.rating, userRating: value });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get Single Recipe
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ message: "Recipe not found" });
    const recipe = await Recipe.findById(req.params.id).populate("createdBy", "username email");
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    const likedByUser = req.user ? recipe.likedBy.some((id) => id.equals(req.user._id)) : false;
    res.json({ ...recipe.toObject(), likedByUser });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

// ... rest of your routes (e.g., router.get("/"), router.get("/:id"), etc.)


// import express from "express";
// import mongoose from "mongoose";
// import Recipe from "../models/Recipe.js";
// import User from "../models/User.js";
// import { protect, adminProtect, optionalAuth } from "../middleware/auth.js";

// const router = express.Router();

// // === Recipes ===

// // Get latest 3 recipes
// router.get("/latest", optionalAuth, async (req, res) => {
//   try {
//     const latestRecipes = await Recipe.find().sort({ createdAt: -1 }).limit(3);
//     const recipesWithLike = latestRecipes.map((r) => ({
//       ...r.toObject(),
//       likedByUser: req.user ? r.likedBy.some((id) => id.equals(req.user._id)) : false,
//     }));
//     res.json(recipesWithLike);
//   } catch {
//     res.status(500).json({ message: "Failed to fetch latest recipes" });
//   }
// });

// // Search recipes by title
// router.get("/search/query", optionalAuth, async (req, res) => {
//   const { q } = req.query;
//   try {
//     const regex = new RegExp(q, "i");
//     const recipes = await Recipe.find({ title: regex });
//     const recipesWithLike = recipes.map((r) => ({
//       ...r.toObject(),
//       likedByUser: req.user ? r.likedBy.some((id) => id.equals(req.user._id)) : false,
//     }));
//     res.json(recipesWithLike);
//   } catch {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // Get all recipes (with optional category filter)
// router.get("/", optionalAuth, async (req, res) => {
//   const { category } = req.query;
//   try {
//     const query = category ? { category } : {};
//     const recipes = await Recipe.find(query);
//     const recipesWithLike = recipes.map((r) => ({
//       ...r.toObject(),
//       likedByUser: req.user ? r.likedBy.some((id) => id.equals(req.user._id)) : false,
//     }));
//     res.json(recipesWithLike);
//   } catch {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // Get current user's own recipes
// router.get("/my", protect, async (req, res) => {
//   try {
//     const recipes = await Recipe.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
//     res.json(recipes);
//   } catch {
//     res.status(500).json({ message: "Failed to fetch your recipes" });
//   }
// });

// // Get user's liked recipes, optional search query
// router.get("/favorites", protect, async (req, res) => {
//   try {
//     const { q } = req.query;
//     const searchFilter = q ? { title: new RegExp(q, "i") } : {};
//     const userId = new mongoose.Types.ObjectId(req.user._id);

//     const favorites = await Recipe.find({
//       likedBy: userId,
//       ...searchFilter,
//     }).sort({ createdAt: -1 });

//     res.json(favorites);
//   } catch {
//     res.status(500).json({ message: "Failed to fetch liked recipes" });
//   }
// });

// // Create a recipe
// router.post("/", protect, async (req, res) => {
//   const { title, ingredients, instructions, category, photoUrl, cookingTime } = req.body;
//   if (!title || !ingredients || !instructions || !category || !photoUrl || !cookingTime) {
//     return res.status(400).json({ message: "Please fill all fields" });
//   }

//   try {
//     const recipe = await Recipe.create({
//       title,
//       ingredients,
//       instructions,
//       category,
//       cookingTime,
//       photoUrl,
//       createdBy: req.user._id,
//     });
//     res.status(201).json(recipe);
//   } catch {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // Update a recipe (owner or admin)
// router.put("/:id", protect, async (req, res) => {
//   try {
//     const recipe = await Recipe.findById(req.params.id);
//     if (!recipe) return res.status(404).json({ message: "Recipe not found" });

//     const isAdmin = req.user.role === "admin";
//     const isOwner = recipe.createdBy.toString() === req.user._id.toString();
//     if (!isOwner && !isAdmin) {
//       return res.status(401).json({ message: "Not authorized" });
//     }

//     const { title, ingredients, instructions, category, photoUrl, cookingTime } = req.body;

//     recipe.title = title || recipe.title;
//     recipe.ingredients = ingredients || recipe.ingredients;
//     recipe.instructions = instructions || recipe.instructions;
//     recipe.category = category || recipe.category;
//     recipe.photoUrl = photoUrl || recipe.photoUrl;
//     recipe.cookingTime = cookingTime || recipe.cookingTime;

//     const updated = await recipe.save();
//     res.json(updated);
//   } catch {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // Delete a recipe (owner or admin)
// router.delete("/:id", protect, async (req, res) => {
//   try {
//     if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//       return res.status(400).json({ message: "Invalid recipe id" });
//     }

//     const recipe = await Recipe.findById(req.params.id);
//     if (!recipe) return res.status(404).json({ message: "Recipe not found" });

//     const isAdmin = req.user.role === "admin";
//     const isOwner = recipe.createdBy.toString() === req.user._id.toString();
//     if (!isOwner && !isAdmin) {
//       return res.status(401).json({ message: "Not authorized" });
//     }

//     await recipe.deleteOne();
//     res.json({ message: "Recipe deleted" });
//   } catch {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // Like/unlike a recipe
// router.post("/:id/like", protect, async (req, res) => {
//   try {
//     const recipe = await Recipe.findById(req.params.id);
//     if (!recipe) return res.status(404).json({ message: "Recipe not found" });

//     const userId = req.user._id;
//     const likedIndex = recipe.likedBy.findIndex((id) => id.equals(userId));

//     if (likedIndex === -1) {
//       recipe.likes = (recipe.likes || 0) + 1;
//       recipe.likedBy.push(userId);
//     } else {
//       recipe.likes = Math.max((recipe.likes || 1) - 1, 0);
//       recipe.likedBy.splice(likedIndex, 1);
//     }

//     await recipe.save();
//     res.json({ likes: recipe.likes, likedByUser: likedIndex === -1 });
//   } catch {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // Rate a recipe
// router.post("/:id/rate", protect, async (req, res) => {
//   try {
//     const { value } = req.body;
//     if (!value || value < 1 || value > 5) {
//       return res.status(400).json({ message: "Rating must be between 1 and 5" });
//     }

//     const recipe = await Recipe.findById(req.params.id);
//     if (!recipe) return res.status(404).json({ message: "Recipe not found" });

//     const userId = req.user._id.toString();
//     const existingIndex = recipe.ratings.findIndex((r) => r.user.toString() === userId);

//     if (existingIndex !== -1) {
//       recipe.ratings[existingIndex].value = value;
//     } else {
//       recipe.ratings.push({ user: userId, value });
//     }

//     const total = recipe.ratings.reduce((acc, r) => acc + r.value, 0);
//     recipe.rating = total / recipe.ratings.length;

//     await recipe.save();
//     res.json({ rating: recipe.rating, userRating: value });
//   } catch {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // Get single recipe with creator info and likedByUser
// router.get("/:id", optionalAuth, async (req, res) => {
//   try {
//     const recipe = await Recipe.findById(req.params.id).populate("createdBy", "username email");
//     if (!recipe) return res.status(404).json({ message: "Recipe not found" });

//     const likedByUser = req.user ? recipe.likedBy.some((id) => id.equals(req.user._id)) : false;

//     res.json({
//       ...recipe.toObject(),
//       likedByUser,
//     });
//   } catch {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // === User Management (Admin only) ===

// // Get all users with optional search
// router.get("/users", adminProtect, async (req, res) => {
//   try {
//     const { q } = req.query;
//     const query = q
//       ? {
//           $or: [
//             { username: new RegExp(q, "i") },
//             { email: new RegExp(q, "i") },
//           ],
//         }
//       : {};

//     const users = await User.find(query).select("-password").sort({ createdAt: -1 });
//     res.json(users);
//   } catch {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // Get a single user by id
// router.get("/users/:id", adminProtect, async (req, res) => {
//   try {
//     if (!mongoose.Types.ObjectId.isValid(req.params.id))
//       return res.status(400).json({ message: "Invalid user id" });

//     const user = await User.findById(req.params.id).select("-password");
//     if (!user) return res.status(404).json({ message: "User not found" });

//     res.json(user);
//   } catch {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // Update user (admin only)
// router.put("/users/:id", adminProtect, async (req, res) => {
//   try {
//     if (!mongoose.Types.ObjectId.isValid(req.params.id))
//       return res.status(400).json({ message: "Invalid user id" });

//     const { username, email, role } = req.body;
//     const validRoles = ["user", "admin"];
//     if (role && !validRoles.includes(role))
//       return res.status(400).json({ message: "Invalid role" });

//     const user = await User.findById(req.params.id);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     if (username) user.username = username;
//     if (email) user.email = email;
//     if (role) user.role = role;

//     await user.save();
//     res.json({ message: "User updated", user });
//   } catch {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // Delete user (admin only)
// router.delete("/users/:id", adminProtect, async (req, res) => {
//   try {
//     if (!mongoose.Types.ObjectId.isValid(req.params.id))
//       return res.status(400).json({ message: "Invalid user id" });

//     const user = await User.findById(req.params.id);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     if (user._id.toString() === req.user._id.toString())
//       return res.status(400).json({ message: "Admin cannot delete themselves" });

//     await user.deleteOne();
//     res.json({ message: "User deleted" });
//   } catch {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// export default router;
