// src/utils/toggleFavorite.js
import axios from "axios";

export async function toggleFavorite(recipeId) {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("No token found in localStorage");
    throw new Error("User not logged in");
  }

  try {
    await axios.post(
      `/api/recipes/${recipeId}/like`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    window.dispatchEvent(new Event("favorite-updated"));
  } catch (error) {
    console.error("Failed to toggle favorite:", error.response?.data || error.message);
    throw error;
  }
}
