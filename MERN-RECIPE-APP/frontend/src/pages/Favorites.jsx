// pages/Favorites.jsx
import axios from "axios";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";

import RecipeCard from "../components/RecipeCard";
import ConfirmUnfavoriteModal from "../components/ConfirmUnfavoriteModal";
import { toggleFavorite } from "../utils/toggleFavorite";

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [recipeToRemove, setRecipeToRemove] = useState(null);

  const fetchFavorites = async (query = "") => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to view favorites.");
        setLoading(false);
        return;
      }

      const res = await axios.get(
        `/api/recipes/favorites${query ? `?q=${encodeURIComponent(query)}` : ""}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setFavorites(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Favorites fetch error:", err.response?.data || err.message);
      setError("Failed to fetch favorites.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchFavorites(searchTerm);
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, refreshFlag]);

  useEffect(() => {
    const handleFavoriteUpdated = () => setRefreshFlag((prev) => !prev);
    window.addEventListener("favorite-updated", handleFavoriteUpdated);
    return () => window.removeEventListener("favorite-updated", handleFavoriteUpdated);
  }, []);

  const onHeartClick = (recipe) => {
    setRecipeToRemove(recipe);
    setShowConfirmModal(true);
  };

  const confirmRemoveFavorite = async () => {
    if (!recipeToRemove) return;

    setFavorites((prev) => prev.filter((r) => r._id !== recipeToRemove._id));
    setShowConfirmModal(false);

    try {
      await toggleFavorite(recipeToRemove._id);
      setRefreshFlag((prev) => !prev);
    } catch (err) {
      alert("Failed to update favorite status. Please try again.");
      fetchFavorites(searchTerm);
    } finally {
      setRecipeToRemove(null);
    }
  };

  const cancelRemoveFavorite = () => {
    setShowConfirmModal(false);
    setRecipeToRemove(null);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen px-4 py-10 bg-gradient-to-br from-gray-900 via-[#1a1a2e] to-black text-gray-200">
      <motion.div
        className="flex justify-center items-center mb-6 gap-3"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <Heart size={48} stroke="#ec4899" className="animate-pulse" />
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 tracking-tight">
          Your Favorites
        </h1>
      </motion.div>

      {/* Search Bar with Clear Button */}
      <motion.form
        onSubmit={(e) => e.preventDefault()}
        className="w-full max-w-xl mb-10 flex gap-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <input
          type="text"
          placeholder="Search favorites..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-5 py-3 text-lg rounded-full bg-[#1e1e2f] text-white border border-[#2a2a40] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
          aria-label="Search favorites"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="px-4 py-2 bg-red-500 text-white rounded-full text-sm hover:bg-red-600 transition cursor-pointer"
            aria-label="Clear search input"
          >
            Clear
          </button>
        )}
      </motion.form>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="bg-[#1e1e2f] border border-[#2a2a40] shadow-md rounded-2xl p-4 animate-pulse"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="h-48 bg-[#2a2a40] mb-4 rounded" />
              <div className="h-4 bg-[#33334d] rounded w-3/4 mb-2" />
              <div className="h-4 bg-[#33334d] rounded w-1/2" />
            </motion.div>
          ))}
        </div>
      )}

      {error && (
        <motion.p
          className="text-center text-red-400 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {error}
        </motion.p>
      )}

      {!loading && !error && favorites.length === 0 && (
        <motion.p
          className="text-center text-gray-400 mt-10 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          No favorite recipes found{searchTerm ? ` for "${searchTerm}"` : ""}.
        </motion.p>
      )}

      <AnimatePresence mode="wait">
        {!loading && !error && favorites.length > 0 && (
          <motion.div
            key="favorites-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            style={{ alignItems: "start" }}
          >
            {favorites
              .slice()
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((recipe) => (
                <RecipeCard
                  key={recipe._id}
                  recipe={recipe}
                  liked={true}
                  likesCount={typeof recipe.likes === "number" ? recipe.likes : 0}
                  simpleView={true}
                  onHeartClick={() => onHeartClick(recipe)}
                />
              ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Unfavorite Modal */}
      <ConfirmUnfavoriteModal
        isOpen={showConfirmModal}
        recipe={recipeToRemove}
        onConfirm={confirmRemoveFavorite}
        onCancel={cancelRemoveFavorite}
      />
    </div>
  );
};

export default Favorites;