// backend/server.js

// backend/server.js

// 🔥 CRITICAL FIX: This MUST be the very first line. 
// It loads the .env file before any other imports (like recipes.js) run.
import "dotenv/config"; 

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import recipesRoutes from "./routes/recipes.js";
import { connectDB } from "./config/db.js";   
import adminRoutes from "./routes/adminRoutes.js";  

const PORT = process.env.PORT || 5000;

const app = express();

// --- DEBUG CHECK ---
// You should see your keys printed in the terminal now
console.log("CLOUDINARY CHECK:", process.env.CLOUDINARY_CLOUD_NAME ? "✅ Loaded" : "❌ Missing");

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Set up directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static uploads (kept for backup, though you are now using Cloudinary)
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/recipes", recipesRoutes);

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});

// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import helmet from "helmet";
// import authRoutes from "./routes/auth.js";
// import recipesRoutes from "./routes/recipes.js";
// import adminRoutes from "./routes/adminRoutes.js";
// import { connectDB } from "./config/db.js";

// dotenv.config();
// const PORT = process.env.PORT || 5000;

// const app = express();

// // Middleware
// app.use(cors());
// app.use(helmet());
// app.use(express.json());

// // Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/recipes", recipesRoutes);
// app.use("/api/admin", adminRoutes);

// // Basic error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ message: "Internal Server Error" });
// });

// // Connect to DB then start server
// connectDB()
//   .then(() => {
//     app.listen(PORT, () => {
//       console.log(`Server started on port ${PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.error("Failed to connect to DB", err);
//     process.exit(1);
//   });
