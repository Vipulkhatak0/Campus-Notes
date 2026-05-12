import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import notesRoute from "./routes/notes.js";
import authRoute from "./routes/auth.js";
import groupsRoute from "./routes/groups.js";
import searchRoute from "./routes/search.js";
import adminRoute from "./routes/admin.js";
import dotenv from 'dotenv';
dotenv.config();

const app = express();

// ✅ CORS
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  credentials: true
}));

// ✅ Body parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ✅ Static folder
app.use("/uploads", express.static("uploads"));

// ✅ MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/notes")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ MongoDB Error:", err));

// ✅ Routes
app.use("/api/auth", authRoute);
app.use("/api/notes", notesRoute);
app.use("/api/groups", groupsRoute);
app.use("/api/search", searchRoute);
app.use("/api/admin", adminRoute);

// ✅ Health check
app.get("/", (req, res) => res.send("API is running 🚀"));
app.get("/health", (req, res) => res.json({ status: "API is running" }));

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong" });
});

// ✅ Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});