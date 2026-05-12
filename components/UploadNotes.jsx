"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function UploadNotes() {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (!file) return alert("Select file");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://localhost:5000/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    alert(data.message);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        padding: "30px",
        textAlign: "center",
        background: "#111",
        color: "#fff",
        borderRadius: "10px",
      }}
    >
      <h2>Upload Notes 📚</h2>

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleUpload}
      >
        Upload
      </motion.button>
    </motion.div>
  );
}