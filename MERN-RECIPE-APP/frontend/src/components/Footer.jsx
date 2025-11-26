import React from "react";
import {
  FaFacebookF,
  FaGithub,
  FaLinkedin,
  FaArrowUp,
  FaUtensils,
} from "react-icons/fa";
import { useLocation } from "react-router-dom";


const Footer = () => {
  const location = useLocation();

  // Hide footer on admin routes
  if (location.pathname.startsWith("/admin")) return null;
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-[#1a1a2e] to-black text-gray-300 py-12 border-t border-[#2a2a40] shadow-inner">
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center space-y-6 text-center">

        {/* Logo / Title with Icon */}
        <div className="flex items-center gap-2">
          <FaUtensils className="text-3xl text-pink-500" />
          <h2
            className="text-3xl font-bold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            ReciPedia
          </h2>
        </div>

        {/* Tagline */}
        <p className="text-sm text-gray-400 max-w-xl leading-relaxed">
          Share and discover a world of flavors. ReciPedia brings home cooks and chefs together — to inspire, cook, and connect.
        </p>

        {/* Divider */}
        <div className="w-24 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-full shadow-md" />

        {/* Social Links */}
        <div className="flex space-x-6 text-xl text-gray-400">
          <a
            href="https://www.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-pink-400 transition-transform transform hover:scale-125"
          >
            <FaFacebookF />
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-pink-400 transition-transform transform hover:scale-125"
          >
            <FaGithub />
          </a>
          <a
            href="https://www.linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-pink-400 transition-transform transform hover:scale-125"
          >
            <FaLinkedin />
          </a>
        </div>


        {/* Back to top */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="mt-2 text-xs text-pink-400 hover:text-red-400 transition-all flex items-center gap-1"
        >
          <FaArrowUp /> Back to Top
        </button>

        {/* Copyright */}
        <p className="text-xs text-gray-500 mt-4">
          &copy; {new Date().getFullYear()} <span className="text-pink-400 font-medium">ReciPedia</span>. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
