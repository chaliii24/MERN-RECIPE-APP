import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import axios from 'axios'; // 1. Import axios
import { AuthProvider } from './context/AuthContext'; // 2. Import AuthProvider

// --- MANDATORY FIX FOR RENDER DEPLOYMENT ---
// This line configures ALL subsequent API calls.
// It uses the VITE_API_URL environment variable (set in Render) if available, 
// otherwise, it defaults to the local development server URL.
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
// --- END FIX ---


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* 3. Wrap App with AuthProvider */}
      <AuthProvider> 
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);