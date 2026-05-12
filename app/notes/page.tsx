'use client';

import { useEffect, useState } from "react";
import { notesApi } from "@/lib/api"; // Corrected import

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Logic from your lib/api.ts: notesApi.getAll()
    notesApi.getAll()
      .then(data => {
        // Handling both possible return structures: { notes: [] } or just []
        const fetchedNotes = data.notes || data; 
        setNotes(fetchedNotes);
      })
      .catch(err => console.error("Failed to fetch notes", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10 text-white">Loading notes...</div>;

  return (
    <div className="p-10">
      <h1 className="text-white text-2xl mb-6">Available Notes</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {notes.length === 0 ? (
          <p className="text-gray-400">No notes found.</p>
        ) : (
          notes.map((note: any) => (
            <div key={note._id || note.id} className="bg-slate-800 border border-slate-700 p-4 rounded-lg text-white shadow-lg">
              <h3 className="text-xl font-bold mb-3 truncate">{note.title}</h3>

              {/* PDF Preview / Thumbnail */}
              <div className="bg-slate-900 rounded mb-4 overflow-hidden border border-slate-700">
                <iframe 
                   src={`${note.fileUrl}#toolbar=0`} 
                   className="w-full h-48 pointer-events-none" 
                />
              </div>

              <div className="flex justify-between items-center mt-auto">
                <span className="font-semibold text-green-400">
                  {note.price > 0 ? `₹${note.price}` : "Free"}
                </span>

                {note.price > 0 ? (
                  <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-4 py-2 rounded text-sm transition">
                    Buy Now
                  </button>
                ) : (
                  <a 
                    href={note.fileUrl} 
                    target="_blank"
                    download 
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm transition text-center"
                  >
                    Download
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}