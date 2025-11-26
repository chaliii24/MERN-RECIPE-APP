import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Trash2, Settings } from "lucide-react";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";

const ManageRecipeCard = ({ recipe, onDelete, deleting, recipeToDelete }) => (
  <motion.div
    initial={{ scale: 0.95, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.95, opacity: 0 }}
    whileHover={{ scale: 1.03 }}
    transition={{ type: "spring", stiffness: 250, damping: 20 }}
    className="relative bg-[#1e1e2f] border border-[#2a2a40] shadow-md hover:shadow-purple-700/40 text-gray-100 rounded-2xl overflow-hidden transition-all duration-300"
  >
    <Link to={`/recipe/${recipe._id}`}>
      {recipe.image || recipe.photoUrl ? (
        <img
          src={
            recipe.image
              ? (recipe.image.startsWith('http') // 🔥 FIX APPLIED HERE
                  ? recipe.image
                  : `http://localhost:5000${recipe.image}`)
              : recipe.photoUrl
          }
          alt={recipe.title}
          className="w-full h-48 object-cover rounded-lg"
        />
      ) : (
        <div className="w-full h-48 bg-[#2a2a40] flex items-center justify-center text-gray-500">
          No Image
        </div>
      )}
    </Link>

    <div className="p-4 space-y-2">
      <h2 className="text-lg font-semibold text-pink-400 capitalize truncate">
        {recipe.title}
      </h2>
      <div className="flex justify-between items-center text-sm text-gray-400">
        <span className="bg-pink-900 text-pink-200 px-3 py-1 rounded-full text-xs">
          {recipe.category}
        </span>
        <span className="text-xs">{recipe.cookingTime} mins</span>
      </div>
      <div className="flex justify-end gap-2 mt-2">
        <Link
          to={`/edit-recipe/${recipe._id}`}
          className="w-8 h-8 flex items-center justify-center bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition"
          title="Edit"
        >
          <Pencil size={16} />
        </Link>
        <button
          onClick={() => onDelete(recipe._id)}
          className="cursor-pointer w-8 h-8 flex items-center justify-center bg-red-600 text-white rounded-full hover:bg-red-700 transition"
          title="Delete"
          disabled={deleting && recipeToDelete === recipe._id}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  </motion.div>
);

const Manage = () => {
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredRecipes, setFilteredRecipes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMyRecipes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/recipes/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecipes(res.data || []);
      setFilteredRecipes(null);
    } catch (err) {
      console.error("Failed to fetch user's recipes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRecipes();
  }, []);

  const openModal = (id) => {
    setRecipeToDelete(id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setRecipeToDelete(null);
  };

  const confirmDelete = async () => {
    if (!recipeToDelete) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/recipes/${recipeToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecipes((prev) => prev.filter((r) => r._id !== recipeToDelete));
      setFilteredRecipes((prev) => (prev ? prev.filter((r) => r._id !== recipeToDelete) : null));
      closeModal();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting(false);
    }
  };

  // Debounced search effect that updates filteredRecipes
  useEffect(() => {
    if (!search.trim()) {
      setFilteredRecipes(null);
      return;
    }

    const delayDebounce = setTimeout(() => {
      const filtered = recipes.filter((recipe) =>
        recipe.title.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredRecipes(filtered);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [search, recipes]);

  const handleClearSearch = () => {
    setSearch("");
    setFilteredRecipes(null);
  };

  const displayedRecipes = filteredRecipes ?? recipes;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#1a1a2e] to-black px-6 py-12 text-gray-200 font-sans relative">
      {/* Title */}
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        className="flex justify-center items-center mb-8 gap-3"
      >
        <Settings size={48} className="stroke-pink-500 animate-spin-slow" />
        <h1 className="text-5xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 font-bold tracking-tight">
          Manage
        </h1>
      </motion.div>

      {/* Search */}
      <motion.form
        onSubmit={(e) => e.preventDefault()}
        className="w-full max-w-xl mx-auto mb-12 flex gap-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <input
          type="text"
          placeholder="Search your recipes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-5 py-3 text-lg rounded-full bg-[#1e1e2f] text-white border border-[#2a2a40] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
          aria-label="Search your recipes"
        />
        {search && (
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

      {/* Recipes Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={search || "all"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {loading ? (
            [...Array(6)].map((_, i) => (
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
            ))
          ) : displayedRecipes.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center text-gray-400 col-span-full text-lg"
            >
              No recipes found{search ? ` for "${search}"` : ""}.
            </motion.p>
          ) : (
            displayedRecipes.map((recipe) => (
              <ManageRecipeCard
                key={recipe._id}
                recipe={recipe}
                onDelete={openModal}
                deleting={deleting}
                recipeToDelete={recipeToDelete}
              />
            ))
          )}
        </motion.div>
      </AnimatePresence>

      {/* Delete Modal */}
      <ConfirmDeleteModal
        isOpen={showModal}
        onClose={closeModal}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this recipe? This action cannot be undone."
        loading={deleting}
      />
    </div>
  );
};

export default Manage;