import React, { useEffect, useState, useContext, useCallback } from "react";
import { Link } from "react-router-dom";
import { FaUtensils, FaSearch, FaUserFriends } from "react-icons/fa";
import axios from "axios";
import RecipeCard from "../components/RecipeCard";
import { AuthContext } from "../context/AuthContext";
import { Flame } from "lucide-react";
import { motion } from "framer-motion";
import { toggleFavorite } from "../utils/toggleFavorite";
import LoginPromptModal from "../components/LoginPromptModal";

const Home = () => {
  const [latestRecipes, setLatestRecipes] = useState([]);
  const { user } = useContext(AuthContext);

  // Track liked status and likes count by recipe ID
  const [likesState, setLikesState] = useState({}); // { [recipeId]: { liked: bool, likesCount: number } }
  // 🔥 FIX: Initialize state correctly using useState(new Set())
  const [pendingToggles, setPendingToggles] = useState(new Set()); 

  // Modal state for login prompt or error messages
  const [modalState, setModalState] = useState({
    visible: false,
    message: "Please log in to like a recipe",
  });

  // Fetch latest recipes and initialize likes state
  const fetchLatestRecipes = useCallback(async () => {
    try {
      const res = await axios.get("/api/recipes/latest");
      const recipes = res.data;

      setLatestRecipes(recipes);

      // Assuming each recipe has 'likes' and 'likedByUser'
      const initialLikes = {};
      recipes.forEach((r) => {
        initialLikes[r._id] = {
          liked: r.likedByUser || false,
          likesCount: r.likes || 0,
        };
      });

      setLikesState((prev) => {
        const updated = { ...prev };
        for (const [id, val] of Object.entries(initialLikes)) {
          // Check against the current state variable which is a Set
          if (!pendingToggles.has(id)) { 
            // Keep optimistic count if already liked
            if (prev[id]?.liked === true) {
              updated[id] = {
                liked: true,
                likesCount: prev[id].likesCount,
              };
            } else {
              updated[id] = val;
            }
          }
        }
        return updated;
      });
    } catch (err) {
      console.error("Failed to fetch latest recipes", err);
    }
  }, [pendingToggles]); // pendingToggles is a dependency now

  useEffect(() => {
    fetchLatestRecipes();

    // Listen for global favorite update event to refresh data
    const onFavoriteUpdated = () => {
      fetchLatestRecipes();
    };

    window.addEventListener("favorite-updated", onFavoriteUpdated);
    return () => {
      window.removeEventListener("favorite-updated", onFavoriteUpdated);
    };
  }, [fetchLatestRecipes]);

  // Handler to toggle favorite with optimistic UI update
  const handleHeartClick = async (recipeId) => {
    if (!user) {
      setModalState({
        visible: true,
        message: "Please log in to like a recipe",
      });
      return;
    }

    // Optimistically toggle liked state and likes count
    setLikesState((prev) => {
      const prevLiked = prev[recipeId]?.liked || false;
      const prevCount = prev[recipeId]?.likesCount || 0;
      return {
        ...prev,
        [recipeId]: {
          liked: !prevLiked,
          likesCount: prevCount + (prevLiked ? -1 : 1),
        },
      };
    });

    // Add recipeId to pending toggles
    setPendingToggles((prev) => {
      const copy = new Set(prev);
      copy.add(recipeId);
      return copy; // Return a new Set for immutability
    });

    try {
      await toggleFavorite(recipeId);

      // Remove from pending toggles after success
      setPendingToggles((prev) => {
        const copy = new Set(prev);
        copy.delete(recipeId);
        return copy; // Return a new Set for immutability
      });
    } catch (error) {
      setModalState({
        visible: true,
        message: error.message || "Something went wrong while liking the recipe.",
      });

      // Revert optimistic update on failure
      setLikesState((prev) => {
        const currentLiked = prev[recipeId]?.liked || false;
        const currentCount = prev[recipeId]?.likesCount || 0;
        return {
          ...prev,
          [recipeId]: {
            liked: !currentLiked,
            likesCount: currentCount + (currentLiked ? -1 : 1),
          },
        };
      });

      // Remove from pending toggles
      setPendingToggles((prev) => {
        const copy = new Set(prev);
        copy.delete(recipeId);
        return copy; // Return a new Set for immutability
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#1a1a2e] to-black text-gray-200 px-6 py-12 font-sans">
      {/* Hero Section */}
      <section className="relative text-center mb-16 max-w-5xl mx-auto px-4">
        <div className="relative z-10">
          <div className="flex justify-center items-center gap-3 mb-4">
            <FaUtensils className="text-5xl text-pink-500 animate-wiggle" />

            <motion.h1
              className="text-5xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 font-bold tracking-tight"
              style={{ fontFamily: "'Inter', sans-serif" }}
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              ReciPedia
            </motion.h1>

            <motion.p
              className="text-sm font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              
            </motion.p>
          </div>

          <motion.p
            className="text-md text-gray-400 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            Discover, share, and cook your favorite recipes. ReciPedia is your
            personalized hub for everything culinary.
          </motion.p>

          <br />

          {/* Features Section */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
            {[
              {
                icon: <FaSearch className="text-purple-400 text-3xl" />,
                title: "Smart Search",
                desc: "Easily find recipes by title, category, or ingredient.",
              },
              {
                icon: <FaUserFriends className="text-pink-400 text-3xl" />,
                title: "Community Driven",
                desc: "Browse user-submitted recipes and discover new flavors.",
              },
              {
                icon: <FaUtensils className="text-red-400 text-3xl" />,
                title: "Your Cookbook",
                desc: "Manage your own recipes and edit them anytime.",
              },
            ].map((f, index) => (
              <motion.div
                key={index}
                className="bg-[#1e1e2f] bg-opacity-90 shadow-md rounded-xl p-6 text-center hover:shadow-xl transform transition duration-300 hover:scale-105 cursor-pointer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <motion.div
                  className="mb-4"
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "loop",
                    delay: index * 0.3,
                    ease: "easeInOut",
                  }}
                >
                  {f.icon}
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-100 mb-2">
                  {f.title}
                </h3>
                <p className="text-gray-400">{f.desc}</p>
              </motion.div>
            ))}
          </section>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/explore">
              <div className="inline-block rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-[2px] transition duration-300">
                <button className="flex items-center gap-2 justify-center cursor-pointer bg-gradient-to-br from-gray-900 via-[#1a1a2e] to-black hover:from-[#23233a] hover:via-[#2a2a44] hover:to-[#1a1a2e] text-white font-semibold rounded-full px-6 py-2 w-full h-full transition duration-300">
                  Explore Recipes <span className="text-xl">→</span>
                </button>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      <br />

      {/* Latest Recipes Section */}
      <section className="max-w-7xl mx-auto px-4 mb-20">
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-pink-400 flex items-center justify-center gap-2 mb-2">
            <Flame className="w-7 h-7 text-pink-400 animate-flicker" />
            Latest Recipes
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-full mx-auto"></div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {latestRecipes.map((recipe, index) => {
            return (
              <motion.div
                key={recipe._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <RecipeCard
                  recipe={recipe}
                  isLatestOrExplore={true}
                  liked={likesState[recipe._id]?.liked || false}
                  likesCount={likesState[recipe._id]?.likesCount || 0}
                  onHeartClick={() => handleHeartClick(recipe._id)}
                />
              </motion.div>
            );
          })}
        </div>
      </section>


      {/* Call to Action Section */}
      <section className="max-w-4xl mx-auto text-center mt-10 px-4">
        {user ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-[#1e1e2f] bg-opacity-90 rounded-xl p-8 shadow-lg"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Welcome back, <span className="text-pink-400">{user.username}</span>!
            </h2>
            <p className="text-gray-400 mb-6">
              Got a delicious idea? Share your next culinary masterpiece with the world.
            </p>
            <Link to="/add-recipe">
              <div className="inline-block rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-[2px] transition duration-300">
                <button className="flex items-center justify-center bg-[#1a1a2e] hover:bg-[#23233a] text-white font-semibold rounded-full px-6 py-2 transition duration-300">
                  Share a Recipe ✍️
                </button>
              </div>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-[#1e1e2f] bg-opacity-90 rounded-xl p-8 shadow-lg"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 text-center">
              Unlock your inner chef — start your cooking journey today.
            </h2>

            <p className="text-gray-400 mb-6">
              Discover, save, and share recipes with a vibrant food-loving community. Sign up and get cooking!
            </p>
            <Link to="/register">
              <div className="inline-block rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-[2px] transition duration-300">
                <button className="flex items-center justify-center bg-[#1a1a2e] hover:bg-[#23233a] text-white font-semibold rounded-full px-6 py-2 transition duration-300">
                  Get Started 🚀
                </button>
              </div>
            </Link>
          </motion.div>
        )}
      </section>


      {/* Show modal if triggered */}
      {modalState.visible && (
        <LoginPromptModal
          message={modalState.message}
          onClose={() => setModalState({ visible: false, message: "" })}
        />
      )}
    </div>
  );
};

export default Home;