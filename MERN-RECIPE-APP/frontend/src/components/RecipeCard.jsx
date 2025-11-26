import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Clock, Utensils } from 'lucide-react';
import { motion } from 'framer-motion';

// Helper function to correctly determine the image source
const getImageUrl = (imagePath) => {
  if (!imagePath) {
    // Return a default placeholder if no image exists
    return "https://via.placeholder.com/800x600?text=Recipedia+No+Image"; 
  }
  
  // 🔥 CRITICAL FIX: If it starts with 'http' (Cloudinary), use the URL directly.
  if (imagePath.startsWith("http")) {
    return imagePath;
  }
  
  // Otherwise, assume it's an old local path and prepend the base URL.
  return `http://localhost:5000${imagePath}`; 
};

const RecipeCard = ({ 
  recipe, 
  liked, 
  likesCount, 
  onHeartClick, 
  isLatestOrExplore = false, // Used in Home.jsx
  simpleView = false // Used in Favorites.jsx
}) => {

  const imageUrl = getImageUrl(recipe.image);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative bg-[#1e1e2f] border border-[#2a2a40] shadow-md hover:shadow-pink-700/40 text-gray-100 rounded-2xl overflow-hidden transition-all duration-300 h-full flex flex-col"
    >
      <Link to={`/recipe/${recipe._id}`} className="block">
        <img
          src={imageUrl}
          alt={recipe.title}
          className="w-full h-48 object-cover"
        />
      </Link>

      <div className="p-4 space-y-3 flex flex-col flex-grow">
        <div className="flex justify-between items-start">
          <Link to={`/recipe/${recipe._id}`}>
            <h2 className="text-xl font-bold text-pink-400 capitalize hover:text-pink-300 transition line-clamp-2">
              {recipe.title}
            </h2>
          </Link>
          
          <button 
            onClick={() => onHeartClick(recipe._id)}
            className="text-white hover:scale-110 transition ml-3 flex-shrink-0"
            title={liked ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart 
              className={liked ? "fill-red-500 text-red-500" : "fill-gray-500 text-gray-500"} 
              size={24} 
            />
          </button>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-400">
          <span className="flex items-center gap-1">
            <Clock size={16} className="text-purple-400" />
            {recipe.cookingTime || 'N/A'} mins
          </span>
          <span className="flex items-center gap-1">
            <Heart size={16} className="text-red-500 fill-red-500" />
            {likesCount} Likes
          </span>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-400 pt-2 border-t border-[#2a2a40] mt-auto">
            <span className="bg-pink-900 text-pink-200 px-3 py-1 rounded-full text-xs font-medium">
              {recipe.category || 'Uncategorized'}
            </span>
            {isLatestOrExplore && recipe.createdBy && (
              <span className="text-xs flex items-center gap-1 text-gray-400">
                <Utensils size={14} className="text-green-400" />
                {recipe.createdBy.username || 'Anonymous'}
              </span>
            )}
        </div>
      </div>
    </motion.div>
  );
};

export default RecipeCard;