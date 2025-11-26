import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { X, PlusCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AddRecipe = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "", 
    ingredients: [""],
    instructions: "",
    category: "",
    cookingTime: "",
  });
  const [image, setImage] = useState(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  
  // 🔥 FIX: Retrieving the token using the correct key: "token"
  const userToken = localStorage.getItem("token"); 

  // Debugging logs from previous steps removed, but the logic remains:
  // if (!userToken) { ... } will catch the error if the user isn't logged in.

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = value;
    handleInputChange("ingredients", newIngredients);
    const lastIngredient = formData.ingredients[formData.ingredients.length - 1];
    if (error && lastIngredient.trim() !== "") setError("");
  };

  const addIngredient = () => {
    const lastIngredient = formData.ingredients[formData.ingredients.length - 1];
    if (lastIngredient.trim() !== "") {
      setError("");
      handleInputChange("ingredients", [...formData.ingredients, ""]);
    } else {
      setError("Please fill in the last ingredient before adding a new one.");
    }
  };

  const removeIngredient = (index) => {
    if (formData.ingredients.length > 1) {
      const newIngredients = formData.ingredients.filter((_, i) => i !== index);
      handleInputChange("ingredients", newIngredients);
      const lastIngredient = formData.ingredients[formData.ingredients.length - 1];
      if (error && lastIngredient.trim() !== "") setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!userToken) {
        setModalMessage("You must be logged in to create a recipe.");
        setIsSuccess(false);
        setLoading(false);
        return;
    }
    
    // Auth header is now correctly defined using the token retrieved by the correct key.
    const authHeader = `Bearer ${userToken}`;

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description); 
      data.append("instructions", formData.instructions);
      data.append("category", formData.category);
      data.append("cookingTime", formData.cookingTime);
      formData.ingredients.forEach((ing, i) => {
        if (ing.trim() !== "") data.append(`ingredients[${i}]`, ing);
      });
      if (image) data.append("image", image);

      await axios.post("/api/recipes", data, {
        headers: { 
            "Content-Type": "multipart/form-data",
            "Authorization": authHeader, // Sending the correct header
        },
      });

      setIsSuccess(true);
      setModalMessage("Recipe Created Successfully");
    } catch (err) {
      console.error("Recipe creation failed:", err.response?.data || err.message);
      setIsSuccess(false);
      setModalMessage(err.response?.data?.message || "Recipe creation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalMessage(null);
    if (isSuccess) navigate("/manage");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-[#1a1a2e] to-black px-4 py-12 text-gray-200 font-sans relative">
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        className="bg-[#1e1e2f]/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-2xl border border-[#2a2a40]"
      >
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 1 }}
          className="flex justify-center items-center gap-3 mb-8"
        >
          <PlusCircle className="text-5xl text-pink-500" />
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 font-sans">
            Create a New Recipe
          </h1>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-red-400 text-sm mb-4 bg-red-900/40 p-3 rounded"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm text-gray-400 font-medium mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#2a2a40] border border-[#33334d] text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
              placeholder="Recipe title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-gray-400 font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#2a2a40] border border-[#33334d] text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
              rows={3}
              placeholder="A brief description of the recipe"
            />
          </div>

          {/* Ingredients */}
          <div>
            <label className="block text-sm text-gray-400 font-medium mb-1">Ingredients</label>
            {formData.ingredients.map((ingredient, index) => (
              <div key={index} className="flex items-center gap-2 mb-3">
                <input
                  type="text"
                  value={ingredient}
                  onChange={(e) => handleIngredientChange(index, e.target.value)}
                  placeholder={`Ingredient ${index + 1}`}
                  className="flex-1 px-4 py-3 rounded-lg bg-[#2a2a40] border border-[#33334d] text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
                {formData.ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="text-red-400 hover:text-red-600 transition"
                    title="Remove"
                  >
                    <X />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="text-pink-400 font-medium hover:underline"
              onClick={addIngredient}
            >
              + Add Ingredient
            </button>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-sm text-gray-400 font-medium mb-1">Instructions</label>
            <textarea
              value={formData.instructions}
              onChange={(e) => handleInputChange("instructions", e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#2a2a40] border border-[#33334d] text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
              rows={5}
              required
              placeholder="Step-by-step instructions"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm text-gray-400 font-medium mb-1">Category</label>
            <select
              onChange={(e) => handleInputChange("category", e.target.value)}
              value={formData.category}
              className="w-full px-4 py-3 rounded-lg bg-[#2a2a40] border border-[#33334d] text-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            >
              <option value="" disabled>
                Select Category
              </option>
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Dessert">Dessert</option>
              <option value="Snack">Snack</option>
              <option value="Appetizer">Appetizer</option>
            </select>
          </div>

          {/* Cooking Time */}
          <div>
            <label className="block text-sm text-gray-400 font-medium mb-1">
              Cooking Time (minutes)
            </label>
            <input
              type="number"
              value={formData.cookingTime}
              onChange={(e) => handleInputChange("cookingTime", e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#2a2a40] border border-[#33334d] text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="e.g. 30"
              min={0}
              required
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm text-gray-400 font-medium mb-1">Upload Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="w-full text-gray-300"
              required
            />
            <AnimatePresence>
              {image && (
                <motion.img
                  key="preview-image"
                  src={URL.createObjectURL(image)}
                  alt="Preview"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="w-full h-48 object-cover rounded-lg border border-[#444] mt-3"
                />
              )}
            </AnimatePresence>
          </div>

          {/* Submit */}
          <div className="text-center pt-4">
            <button
              className={`w-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white py-3 rounded-lg font-semibold text-lg hover:brightness-110 transition cursor-pointer ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
              type="submit"
            >
              {loading ? "Creating..." : "Create Recipe"}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {modalMessage && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`bg-[#1e1e2f] border border-[#3a3a50] rounded-xl p-6 w-full max-w-sm shadow-xl`}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2
                className={`text-xl font-semibold mb-4 ${
                  isSuccess ? "text-green-400" : "text-red-400"
                }`}
              >
                {isSuccess ? "Success" : "Error"}
              </h2>
              <p className="text-gray-300 mb-6">{modalMessage}</p>
              <div className="flex justify-end">
                <button
                  onClick={handleCloseModal}
                  className={`px-4 py-2 rounded ${
                    isSuccess
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  } text-white transition`}
                >
                  OK
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddRecipe;