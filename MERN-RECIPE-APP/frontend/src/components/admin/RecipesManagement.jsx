import React, { useEffect, useState } from "react";
import axios from "axios";

const RecipesManagement = () => {
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState("");

  const fetchRecipes = async () => {
    try {
      const res = await axios.get("/api/admin/recipes");
      setRecipes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteRecipe = async (id) => {
    if (window.confirm("Are you sure you want to delete this recipe?")) {
      await axios.delete(`/api/admin/recipes/${id}`);
      fetchRecipes();
    }
  };

  useEffect(() => { fetchRecipes(); }, []);

  const filteredRecipes = recipes.filter(recipe =>
    recipe.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Recipes Management</h2>
      <input
        type="text"
        placeholder="Search recipes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 p-2 border rounded w-full"
      />
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="border p-2">Title</th>
            <th className="border p-2">Author</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredRecipes.map(recipe => (
            <tr key={recipe._id}>
              <td className="border p-2">{recipe.title}</td>
              <td className="border p-2">{recipe.author}</td>
              <td className="border p-2 flex gap-2">
                <button
                  onClick={() => deleteRecipe(recipe._id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecipesManagement;
