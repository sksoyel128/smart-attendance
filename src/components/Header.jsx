import React, { useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function HeadNav() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } else {
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  return (
    <div className="flex items-center justify-between bg-white dark:bg-slate-900 text-black dark:border-slate-600 dark:text-white px-6 py-4 border-b border-gray-200 dark:border-slate-800 transition-all duration-300 shadow-[0_6px_12px_rgba(0,0,0,0.15)] dark:shadow-[0_6px_12px_rgba(255,255,255,0.05)]">
      {/* Left - Search */}
      <input
        type="text"
        placeholder="Search..."
        className="bg-white dark:bg-slate-800 text-black dark:text-white px-4 py-2 rounded-md border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md dark:shadow-inner w-64 transition-all duration-200"
      />

      {/* Middle - Role Title */}
      <div className="flex-grow text-center">
        <h1 className="text-2xl font-bold text-black dark:text-purple-600">
          {userData?.role === "teacher" ? "🧑‍🏫Teacher" : "🧑🏻‍🎓Student"} Dashboard
        </h1>
      </div>

      {/* Right - Profile + Toggle */}
      <div className="flex items-center space-x-5">
        {/* Dark Mode Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="px-2 py-1 rounded dark:border-slate-600 text-sm hover:bg-gray-100 dark:hover:bg-slate-700 transition"
        >
          {isDarkMode ? "☀️" : "🌙"}
        </button>

        {/* Notification Bell */}
        <span className="text-xl cursor-pointer hover:text-blue-500 transition-colors">🔔</span>

        {/* User Profile */}
        {userData && (
          <div className="flex items-center space-x-2">
            {/* Profile Image */}
            <div className="relative group">
              {userData.imageURL ? (
                <img 
                  src={userData.imageURL}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover border-2 border-transparent group-hover:border-blue-500 transition-all"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center">
                  <span className="text-sm">{userData.name[0]}</span>
                </div>
              )}
            </div>
            
            {/* User Name */}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {userData.name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}