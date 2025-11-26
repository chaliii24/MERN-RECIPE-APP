import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Pencil, Trash2, Heart } from "lucide-react";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";

// Simple Star component for Rating
const Star = ({ filled, onClick, onMouseEnter, onMouseLeave }) => (
  <svg
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    xmlns="http://www.w3.org/2000/svg"
    fill={filled ? "gold" : "none"}
    stroke="gold"
    strokeWidth="2"
    viewBox="0 0 24 24"
    className="w-6 h-6 cursor-pointer transition-colors duration-150"
  >
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

// Modal component for login required message
const LoginRequiredModal = ({ message, onClose }) => (
  <motion.div
    className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className="bg-[#1e1e2f] p-6 rounded-lg shadow-xl w-80 text-center"
      initial={{ opacity: 0, scale: 0.8, y: "-50%", x: "-50%" }}
      animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
      exit={{ opacity: 0, scale: 0.8, y: "-50%", x: "-50%" }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      style={{ position: "absolute", top: "50%", left: "50%" }}
    >
      <h2 className="text-xl font-semibold text-white mb-4">Heads up!</h2>
      <p className="text-gray-300 mb-6">{message}</p>
      <div className="flex justify-center gap-4">
        <button
          onClick={onClose}
          className="bg-pink-600 hover:bg-pink-700 text-white font-semibold px-4 py-2 rounded"
        >
          OK
        </button>
      </div>
    </motion.div>
  </motion.div>
);

const RecipeDetail = () => {
  const [recipe, setRecipe] = useState(null);
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Rating states
  const [userRating, setUserRating] = useState(0); // user's rating
  const [hoverRating, setHoverRating] = useState(0); // rating on hover

  // Like state
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  // Login required modal states
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginModalMessage, setLoginModalMessage] = useState("");

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        // Axios uses the base URL set in main.jsx (VITE_API_URL or localhost)
        const res = await axios.get(`/api/recipes/${id}`);
        const recipeData = res.data;
        setRecipe(recipeData);

        // Set initial likes count and liked by user
        setLikesCount(recipeData.likes || 0);
        if (user && recipeData.likedBy) {
          // Check if the current user ID is in the likedBy array
          const isLiked = recipeData.likedBy.some(
            (userId) => userId === user._id || userId === user._id.toString()
          );
          setLiked(isLiked);
        }

        // Set user rating if exists
        if (user && recipeData.ratings) {
          const ratingObj = recipeData.ratings.find(
            (r) => r.user === user._id || r.user === user._id.toString()
          );
          setUserRating(ratingObj ? ratingObj.value : 0);
        }
      } catch (err) {
        console.error("Failed to fetch recipe", err);
      }
    };
    fetchRecipe();
  }, [id, user]);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`/api/recipes/${id}`);
      navigate("/my-recipes");
    } catch (error) {
      console.error("Error deleting recipe:", error);
      setDeleting(false);
      setModalOpen(false);
    }
  };

  // Handle rating click
  const handleRating = async (value) => {
    if (!user) {
      setLoginModalMessage("You must be logged in to rate.");
      setShowLoginModal(true);
      return;
    }
    try {
      setUserRating(value);
      await axios.post(`/api/recipes/${id}/rate`, { value });
      // Fetch updated recipe data to reflect new average rating
      const res = await axios.get(`/api/recipes/${id}`);
      setRecipe(res.data);
    } catch (err) {
      console.error("Error rating recipe:", err);
    }
  };

  // Handle like toggle
  const handleLike = async () => {
    if (!user) {
      setLoginModalMessage("You must be logged in to like recipes.");
      setShowLoginModal(true);
      return;
    }
    try {
      // Optimistic UI update
      setLiked(!liked);
      setLikesCount((prev) => (liked ? prev - 1 : prev + 1));

      await axios.post(`/api/recipes/${id}/like`);
    } catch (err) {
      console.error("Error liking recipe:", err);
      // Revert UI change on error
      setLiked(liked);
      setLikesCount((prev) => (liked ? prev + 1 : prev - 1));
    }
  };

  if (!recipe)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-[#1a1a2e] to-black text-gray-200 font-sans text-lg">
        Loading...
      </div>
    );

  const listVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  // Round average rating to 1 decimal place
  const avgRating = recipe.rating ? Math.round(recipe.rating * 10) / 10 : 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-[#1a1a2e] to-black px-4 py-10 text-gray-200 font-sans">
      <ConfirmDeleteModal
        isOpen={modalOpen}
        onClose={closeModal}
        onConfirm={handleDelete}
        message="Are you sure you want to delete this recipe? This action cannot be undone."
        title="Confirm Deletion"
        isProcessing={deleting}
      />

      {showLoginModal && (
        <LoginRequiredModal
          message={loginModalMessage}
          onClose={() => setShowLoginModal(false)}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-4xl w-full bg-[#1e1e2f]/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-[#2a2a40]"
      >
        <Link to="/explore">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mb-6 inline-block rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-[2px] transition duration-300 cursor-pointer"
          >
            <button className="cursor-pointer bg-gradient-to-br from-gray-900 via-[#1a1a2e] to-black hover:from-[#23233a] hover:via-[#2a2a44] hover:to-[#1a1a2e] text-white font-semibold rounded-full px-6 py-2 w-full h-full transition duration-300">
              ← More Recipes
            </button>
          </motion.div>
        </Link>

       {recipe.image && (
          <motion.img
            // *** FIX FOR RENDER DEPLOYMENT ***
            // The backend now provides the full Cloudinary URL, so we use it directly.
            src={recipe.image}
            alt={recipe.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full h-96 object-cover rounded-2xl mb-6 border border-[#44445e]"
          />
        )}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 mb-4 capitalize"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {recipe.title}
        </motion.h1>

        {/* Likes + Like button */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={handleLike}
            aria-label={liked ? "Unlike" : "Like"}
            className={`transition-colors duration-300 ${
              liked ? "text-red-500" : "text-gray-500 hover:text-red-400"
            }`}
          >
            <Heart size={28} fill={liked ? 'currentColor' : 'none'} />
          </button>
          <span className="select-none">
            {likesCount} {likesCount === 1 ? "like" : "likes"}
          </span>
        </div>

        {/* Rating stars */}
        <div className="flex items-center gap-1 mb-6 select-none">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              filled={hoverRating >= star || (!hoverRating && userRating >= star)}
              onClick={() => handleRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
            />
          ))}
          <span className="ml-2 text-yellow-400 font-semibold">
            {avgRating.toFixed(1)} / 5
          </span>
        </div>

        {recipe.createdBy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex items-center gap-3 mb-6 text-gray-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-pink-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.121 17.804A9 9 0 1119 12M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <div>
              <p className="font-semibold">{recipe.createdBy.username}</p>
              <p className="text-sm text-gray-500">{recipe.createdBy.email}</p>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mb-6"
        >
          <h2 className="text-2xl font-bold mb-3 border-b border-pink-500 pb-1">
            Ingredients
          </h2>
          <motion.ul
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="list-disc list-inside"
          >
            {/* Handle both array and single string for ingredients */}
            {Array.isArray(recipe.ingredients) ? (
              recipe.ingredients.map((ingredient, idx) => (
                <motion.li
                  key={idx}
                  variants={itemVariants}
                  className="mb-1"
                >
                  {ingredient}
                </motion.li>
              ))
            ) : (
              <motion.li variants={itemVariants}>
                {recipe.ingredients || "No ingredients provided."}
              </motion.li>
            )}
          </motion.ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-3 border-b border-pink-500 pb-1">
            Instructions
          </h2>
          <motion.ol
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="list-decimal list-inside"
          >
            {/* Handle both array and single string for instructions */}
            {Array.isArray(recipe.instructions) ? (
              recipe.instructions.map((step, idx) => (
                <motion.li
                  key={idx}
                  variants={itemVariants}
                  className="mb-2"
                >
                  {step}
                </motion.li>
              ))
            ) : (
              <motion.li variants={itemVariants}>
                {recipe.instructions || "No instructions provided."}
              </motion.li>
            )}
          </motion.ol>
        </motion.div>

        {user && user._id === recipe.createdBy?._id && (
          <div className="flex gap-4 mt-8 justify-end">
            <Link to={`/edit-recipe/${id}`}>
              <button
                type="button"
                className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-5 py-2 rounded-lg transition shadow-md"
              >
                <Pencil size={18} /> Edit
              </button>

            </Link>
            <button
              type="button"
              onClick={openModal}
              disabled={deleting}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-lg transition shadow-md disabled:bg-red-800 disabled:cursor-not-allowed"
            >
              <Trash2 size={18} /> {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default RecipeDetail;