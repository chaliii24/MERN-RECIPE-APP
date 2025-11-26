import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, recipes: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const usersRes = await axios.get("/api/admin/users-count");
      const recipesRes = await axios.get("/api/admin/recipes-count");
      setStats({ users: usersRes.data.count, recipes: recipesRes.data.count });
    };
    fetchStats();
  }, []);

  return (
    <div className="p-6 flex flex-col gap-6">
      <motion.h2
        className="text-3xl font-bold text-green-400"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Admin Dashboard
      </motion.h2>

      <div className="grid grid-cols-2 gap-4 max-w-md">
        <div className="p-4 bg-black border border-green-400 rounded">
          <h3 className="text-green-400">Total Users</h3>
          <p className="text-2xl font-bold">{stats.users}</p>
        </div>
        <div className="p-4 bg-black border border-green-400 rounded">
          <h3 className="text-green-400">Total Recipes</h3>
          <p className="text-2xl font-bold">{stats.recipes}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;