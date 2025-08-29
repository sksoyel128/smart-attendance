import React, { useState, useEffect } from "react";
import DashboardLayout from "./Dashboard";
import { db } from "../config/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";
import Swal from "sweetalert2";

const UploadNotes = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState(""); // Changed from file to message
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchNotes = async () => {
    try {
      const q = query(collection(db, "classNotes"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const notesList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotes(notesList);
    } catch (error) {
      console.error("Error fetching notes:", error);
      Swal.fire("Error", "Failed to load notes.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (title.trim() === "" || message.trim() === "") {
      Swal.fire("Error", "Please enter a title and a message.", "error");
      return;
    }

    setUploading(true);
    try {
      await addDoc(collection(db, "classNotes"), {
        title,
        message, // Changed from fileUrl to message
        createdAt: serverTimestamp(),
      });

      Swal.fire("Success", "Note sent successfully!", "success");
      setTitle("");
      setMessage(""); // Reset message state
      fetchNotes();
    } catch (error) {
      console.error("Error sending note:", error);
      Swal.fire("Error", "Failed to send note. Please try again.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteDoc(doc(db, "classNotes", id));
          Swal.fire("Deleted!", "The note has been deleted.", "success");
          fetchNotes();
        } catch (error) {
          console.error("Error deleting note:", error);
          Swal.fire("Error", "Failed to delete note.", "error");
        }
      }
    });
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-6 flex items-center gap-2">
          📤 Send Class Notes
        </h1>

        {/* Note Sending Form */}
        <div className="bg-gray-100 dark:bg-slate-800 p-6 rounded-2xl shadow-lg max-w-2xl mx-auto mb-8">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Send New Note</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Note Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:bg-slate-700 dark:text-white"
            />
            <textarea
              placeholder="Type your note message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:bg-slate-700 dark:text-white"
              rows="6"
            ></textarea>
            <button
              type="submit"
              disabled={uploading}
              className="w-full py-3 font-semibold bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {uploading ? "Sending..." : "Send Note"}
            </button>
          </form>
        </div>

        {/* Notes List */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg max-w-2xl mx-auto">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Current Notes</h2>
          {loading ? (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">Loading notes...</div>
          ) : notes.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No notes sent yet.</p>
          ) : (
            <ul className="space-y-4">
              {notes.map((note) => (
                <li
                  key={note.id}
                  className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm flex justify-between items-center transition-all hover:bg-gray-50 dark:hover:bg-slate-700"
                >
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">{note.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{note.message}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    🗑️
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UploadNotes;