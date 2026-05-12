"use client";

import { motion } from "framer-motion";

const notes = [
  { title: "Math Notes" },
  { title: "OS Notes" },
  { title: "DBMS Notes" },
];

export default function ScrollNotes() {
  return (
    <div style={{ padding: "50px" }}>
      {notes.map((note, i) => (
        <motion.div
          key={i}
          initial={{ y: 200, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          style={{
            marginBottom: "20px",
            padding: "20px",
            background: "#222",
            color: "#fff",
            borderRadius: "10px",
          }}
        >
          {note.title}
        </motion.div>
      ))}
    </div>
  );
}