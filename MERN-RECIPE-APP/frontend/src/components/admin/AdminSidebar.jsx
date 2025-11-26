import React from "react";
import { Utensils, User } from "lucide-react";

const AdminSidebar = ({ view, setView }) => {
  return (
    <div className="w-56 bg-[#0f0f0f] text-green-400 p-6 flex flex-col space-y-4">
      <h2 className="text-xl font-bold mb-4">Admin Dashboard</h2>

      <button
        onClick={() => setView("recipes")}
        className={`flex items-center px-4 py-2 text-left rounded hover:bg-green-800 transition-colors ${
          view === "recipes" ? "bg-green-700 text-black" : ""
        }`}
      >
        <Utensils className="mr-2" />
        Recipes
      </button>

      <button
        onClick={() => setView("users")}
        className={`flex items-center px-4 py-2 text-left rounded hover:bg-green-800 transition-colors ${
          view === "users" ? "bg-green-700 text-black" : ""
        }`}
      >
        <User className="mr-2" />
        Users
      </button>
    </div>
  );
};

export default AdminSidebar;
