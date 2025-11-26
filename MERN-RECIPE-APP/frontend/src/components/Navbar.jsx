import React, { useContext, useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FaUserCircle, FaUtensils } from "react-icons/fa";
import { motion } from "framer-motion";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsDropdownOpen(false);
  }, [user]);

  const navLinkClass = `relative text-gray-300 font-medium cursor-pointer transition-all duration-200 hover:text-pink-400 
    after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:h-[2px] after:w-0 
    hover:after:w-full after:bg-gradient-to-r after:from-pink-500 after:to-purple-500 after:transition-all after:duration-300`;

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-[#1a1a2e] to-black shadow-lg border-b border-[#2a2a40] py-4 px-6 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2">
          <FaUtensils className="text-3xl text-pink-500" />
          <h1
            className="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 font-bold tracking-tight"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            ReciPedia
          </h1>
        </Link>

        {/* Nav Links */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 items-center text-sm sm:text-base">
          {user ? (
            user.role === "admin" ? (
              <>
                {/* Admin Navbar */}
                <Link to="/adminpanel" className={navLinkClass}>
                  Admin Panel
                </Link>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-1 text-gray-300 hover:text-pink-400 transition cursor-pointer"
                  >
                    <FaUserCircle className="text-2xl" />
                  </button>

                  <div
                    className={`absolute right-0 mt-3 w-52 bg-[#1e1e2f] border border-[#2a2a40] rounded-xl shadow-lg z-50 py-3 transition-all duration-200 ${
                      isDropdownOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
                    }`}
                  >
                    <div className="px-5 pb-3 border-b border-[#2a2a40]">
                      <p className="font-semibold text-gray-100">{user.username}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-5 py-2 mt-2 text-sm text-red-400 rounded-lg hover:bg-red-900/50 transition-colors duration-200 cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Regular User Navbar */}
                <Link to="/" className={navLinkClass}>Home</Link>
                <Link to="/explore" className={navLinkClass}>Explore</Link>
                <Link to="/add-recipe" className={navLinkClass}>Create</Link>
                <Link to="/manage" className={navLinkClass}>Manage</Link>
                <Link to="/favorites" className={navLinkClass}>Favorites</Link>
                <Link to="/about-us" className={navLinkClass}>About us</Link>

                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-1 text-gray-300 hover:text-pink-400 transition cursor-pointer"
                  >
                    <FaUserCircle className="text-2xl" />
                  </button>

                  <div
                    className={`absolute right-0 mt-3 w-52 bg-[#1e1e2f] border border-[#2a2a40] rounded-xl shadow-lg z-50 py-3 transition-all duration-200 ${
                      isDropdownOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
                    }`}
                  >
                    <div className="px-5 pb-3 border-b border-[#2a2a40]">
                      <p className="font-semibold text-gray-100">{user.username}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-5 py-2 mt-2 text-sm text-red-400 rounded-lg hover:bg-red-900/50 transition-colors duration-200 cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )
          ) : (
            <>
              {/* Not logged in */}
              <Link to="/about-us" className={navLinkClass}>About us</Link>
              <Link to="/login" className={navLinkClass}>Login</Link>
              <Link to="/register">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-[2px] transition duration-300 cursor-pointer"
                >
                  <button
                    className="cursor-pointer bg-gradient-to-br from-gray-900 via-[#1a1a2e] to-black hover:from-[#23233a] hover:via-[#2a2a44] hover:to-[#1a1a2e] text-white font-semibold rounded-full px-4 py-2 w-full h-full text-sm sm:text-base transition duration-300"
                    type="button"
                  >
                    Register
                  </button>
                </motion.div>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
