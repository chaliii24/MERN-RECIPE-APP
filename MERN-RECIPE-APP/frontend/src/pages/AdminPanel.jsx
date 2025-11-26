import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Terminal, User, Utensils, Search } from "lucide-react";
import AdminSidebar from "../components/admin/AdminSidebar";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AdminPanel = () => {
  const [recipes, setRecipes] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState("recipes");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const { logout } = useContext(AuthContext);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [recipesRes, usersRes] = await Promise.all([
        axios.get("/api/admin/recipes"),
        axios.get("/api/admin/users"),
      ]);
      setRecipes(recipesRes.data);
      setUsers(usersRes.data);
      setError("");
    } catch {
      setError("Failed to fetch data. Please try again.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filteredData = (data) =>
    data.filter((item) =>
      Object.values(item)
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );

  const handleDelete = async (type, id) => {
    try {
      await axios.delete(`/api/admin/${type}/${id}`);
      fetchAll();
    } catch {
      setError("Delete operation failed.");
    }
  };

  const handleAdminLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-black text-green-400 font-mono">
      <AdminSidebar view={view} setView={setView} />

      <div className="flex-1 p-8">
        {/* Header with Logout */}
        <motion.div
          className="flex justify-between items-center max-w-6xl mx-auto mb-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4">
            <Terminal className="text-green-400" size={40} />
            <div>
              <h1 className="text-4xl font-bold tracking-widest text-green-400">
                RECIPEDIA ADMIN TERMINAL
              </h1>
              <p className="text-sm text-green-600">root access granted</p>
            </div>
          </div>

          <button
            onClick={handleAdminLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-semibold transition-all shadow-md"
          >
            Logout
          </button>
        </motion.div>

        {/* Search and view buttons */}
        <div className="flex justify-between items-center max-w-4xl mx-auto mb-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setView("recipes")}
              className={`px-4 py-2 border ${view === "recipes" ? "bg-green-700 text-black" : "border-green-400"}`}
            >
              <Utensils className="inline mr-2" size={16} />
              Recipes
            </button>
            <button
              onClick={() => setView("users")}
              className={`px-4 py-2 border ${view === "users" ? "bg-green-700 text-black" : "border-green-400"}`}
            >
              <User className="inline mr-2" size={16} />
              Users
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <Search size={18} />
            <input
              type="text"
              placeholder={`Search ${view}...`}
              className="bg-black border border-green-400 px-2 py-1 text-sm text-green-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-center font-semibold">{error}</p>}

        {loading ? (
          <p className="text-center text-green-300 animate-pulse">Loading...</p>
        ) : (
          <div className="max-w-6xl mx-auto border border-green-600 p-4 rounded-md bg-[#0a0a0a] overflow-auto">
            {view === "recipes" ? (
              <table className="w-full text-left text-sm">
                <thead className="border-b border-green-400">
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Likes</th>
                    <th>Created By</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData(recipes).map((r) => (
                    <tr key={r._id} className="border-b border-green-800">
                      <td>{r.title}</td>
                      <td>{r.category}</td>
                      <td>{r.likes}</td>
                      <td>
                        {r.createdBy
                          ? `${r.createdBy.username} (${r.createdBy.email})`
                          : "Unknown"}
                      </td>
                      <td className="space-x-2">
                        <button
                          className="text-blue-400 hover:text-blue-600"
                          onClick={() => navigate(`/edit-recipe/${r._id}`)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-400 hover:text-red-600"
                          onClick={() => handleDelete("recipes", r._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="border-b border-green-400">
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData(users).map((u) => (
                    <tr key={u._id} className="border-b border-green-800">
                      <td>{u.username}</td>
                      <td>{u.email}</td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="space-x-2">
                        <button
                          className="text-blue-400 hover:text-blue-600"
                          onClick={() => navigate(`/admin/users/${u._id}/edit`)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-400 hover:text-red-600"
                          onClick={() => handleDelete("users", u._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
