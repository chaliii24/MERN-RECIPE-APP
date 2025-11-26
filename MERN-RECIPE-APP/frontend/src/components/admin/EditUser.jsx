import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

const EditUser = () => {
  const { id } = useParams(); // user ID from URL
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    username: "",
    email: "",
    password: "", // optional
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch user details on load
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`/api/admin/users/${id}`);
        setUserData({
          username: res.data.username,
          email: res.data.email,
          password: "",
        });
      } catch {
        setError("Failed to load user data.");
      }
    };
    fetchUser();
  }, [id]);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await axios.put(`/api/admin/users/${id}`, userData);
      setSuccess("User updated successfully!");
      setTimeout(() => navigate("/admin"), 1000); // redirect to admin panel
    } catch {
      setError("Failed to update user.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-green-400 font-mono px-4">
      <motion.div
        className="w-full max-w-md p-6 bg-[#0a0a0a] border border-green-400 rounded"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-2xl font-bold mb-4">Edit User</h1>

        {error && <p className="text-red-500 mb-2">{error}</p>}
        {success && <p className="text-green-400 mb-2">{success}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
          <div>
            <label className="block mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={userData.username}
              onChange={handleChange}
              className="w-full px-2 py-1 border border-green-400 rounded bg-black text-green-300"
              required
            />
          </div>

          <div>
            <label className="block mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              className="w-full px-2 py-1 border border-green-400 rounded bg-black text-green-300"
              required
            />
          </div>

          <div>
            <label className="block mb-1">Password (optional)</label>
            <input
              type="password"
              name="password"
              value={userData.password}
              onChange={handleChange}
              className="w-full px-2 py-1 border border-green-400 rounded bg-black text-green-300"
              placeholder="Leave blank to keep current password"
            />
          </div>

          <button
            type="submit"
            className="bg-green-700 hover:bg-green-600 text-black font-bold px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default EditUser;
