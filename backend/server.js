import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import notesRoute from "./routes/notes.js";
import authRoute from "./routes/auth.js";
import groupsRoute from "./routes/groups.js";
import searchRoute from "./routes/search.js";
import adminRoute from "./routes/admin.js";

dotenv.config();

const app = express();


// ✅ CORS
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:3001"
  ],
  credentials: true
}));


// ✅ Body parser
app.use(express.json({ limit: "50mb" }));

app.use(express.urlencoded({
  limit: "50mb",
  extended: true
}));


// ✅ Static uploads
app.use("/uploads", express.static("uploads"));


// ✅ Routes
app.use("/api/auth", authRoute);
app.use("/api/notes", notesRoute);
app.use("/api/groups", groupsRoute);
app.use("/api/search", searchRoute);
app.use("/api/admin", adminRoute);


// ✅ Home route
app.get("/", (req, res) => {
  res.send("🚀 Supabase API Running");
});


// ✅ Health route
app.get("/health", (req, res) => {
  res.json({
    success: true
  });
});


// ✅ Error handler
app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    error: "Server Error"
  });
});


// ✅ Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 Server running on port ${PORT}`
  );
});