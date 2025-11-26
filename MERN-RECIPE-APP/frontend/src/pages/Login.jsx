import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { BadgeCheck } from "lucide-react";
import { motion } from "framer-motion";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const user = await login(email, password); // get returned user

    if (user.role === "admin") {
      navigate("/adminpanel"); // redirect admin
    } else {
      navigate("/"); // normal users
    }
  } catch (err) {
    if (err.response?.data?.message) {
      const message = err.response.data.message.toLowerCase();
      if (message.includes("user not found")) {
        setError("User not found, please register.");
      } else if (message.includes("invalid")) {
        setError("Invalid password.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } else {
      setError("Server connection error. Please try again.");
    }
  }
};

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-[#1a1a2e] to-black px-4 py-12 text-gray-200 font-sans"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-[#1e1e2f]/80 backdrop-blur-lg p-8 rounded-2xl shadow-lg w-full max-w-md border border-[#2a2a40]"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h1
          className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-center mb-6 flex justify-center items-center gap-3"
          style={{ fontFamily: "'Inter', sans-serif" }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <BadgeCheck className="w-7 h-7 text-pink-400 drop-shadow-md animate-pop-pulse" />
          Log In
        </motion.h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm text-gray-400 font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-[#2a2a40] border border-[#33334d] text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Enter your email"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-gray-400 font-medium mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 pr-10 rounded-lg bg-[#2a2a40] border border-[#33334d] text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-pink-400 text-lg cursor-pointer"
              >
                {showPassword ? "🔓" : "🔒"}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              className="text-red-400 text-sm text-center font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.div>
          )}

          {/* Submit */}
          <motion.button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:brightness-110 text-white py-3 rounded-lg font-semibold text-lg transition cursor-pointer"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Log In
          </motion.button>
        </form>

        {/* Register Link */}
        <div className="mt-6 text-center text-sm text-gray-400">
          Don't have an account?{" "}
          <a href="/register" className="text-pink-400 font-medium hover:underline">
            Register here
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Login;
