// src/pages/ClassNotes.jsx
import React, { useEffect, useState } from 'react';
import DashboardLayout from './Dashboard';
import { db } from '../config/firebase'; // 👈 Import Firestore
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

const ClassNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Create a query to fetch notes from the 'classNotes' collection
    const notesQuery = query(
      collection(db, 'classNotes'),
      orderBy('createdAt', 'desc')
    );

    // 2. Use a real-time listener to get updates
    const unsubscribe = onSnapshot(notesQuery, (snapshot) => {
      const fetchedNotes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotes(fetchedNotes);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching notes:", error);
      setLoading(false);
    });

    // 3. Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-gray-500">
          Loading notes...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-green-700 mb-6 flex items-center gap-2">
          📚 Class Notes
        </h1>

        {notes.length === 0 ? (
          <p className="text-gray-500 text-center">No class notes uploaded yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {notes.map((note) => (
              <a 
                href={note.noteURL} 
                target="_blank" 
                rel="noopener noreferrer"
                key={note.id}
                className="block bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
              >
                <h2 className="text-xl font-semibold text-green-700 mb-4">{note.title}</h2>
                <p className="text-sm text-gray-800">
                  {/* You can add a description if you want */}
                  Click to view file: {note.fileName}
                </p>
                <p className="text-sm text-green-600 mt-2">
                  Uploaded: {note.createdAt ? new Date(note.createdAt.toDate()).toLocaleString() : 'N/A'}
                </p>
              </a>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClassNotes;