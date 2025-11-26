import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    ingredients: [
      {
        type: String,
        required: [true, "Ingredient is required"],
        trim: true,
      },
    ],
    instructions: {
      type: String,
      required: [true, "Instructions are required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    image: {
      type: String, // store local upload path like "/uploads/xxxx.jpg"
      required: [true, "Recipe photo is required"],
    },
    cookingTime: {
      type: Number,
      required: [true, "Cooking time is required"],
      min: [1, "Cooking time must be at least 1 minute"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ❤️ Likes feature
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // ⭐ Ratings feature
    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        value: {
          type: Number,
          min: 1,
          max: 5,
          required: true,
        },
      },
    ],
    rating: {
      type: Number,
      default: 0, // average rating
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

const Recipe = mongoose.model("Recipe", recipeSchema);

export default Recipe;
