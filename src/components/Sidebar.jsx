import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";

const Sidebar = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState("student");

  const teacherNavItems = [
    { path: "/teacher-dashboard", name: "Dashboard", emoji: "📊" },
    { path: "/mark-attendance", name: "Mark Attendance", emoji: "✅" },
    { path: "/Manage-UploadNotes", name: "Upload Notes", emoji: "📤" },
    { path: "/Manage-Assignments", name: "Manage Assignments", emoji: "📄" },
    { path: "/SendReminder", name: "Send Reminder", emoji: "📢" },
    { path: "/Manage-Students", name: "Manage Students", emoji: "👥" },
    { path: "/Teacher-Settings", name: "Settings", emoji: "⚙️" },
  ];

  const studentNavItems = [
    { path: "/student-dashboard", name: "Dashboard", emoji: "📊" },
    { path: "/student-attendance", name: "Attendance", emoji: "🕒" },
    { path: "/student-ClassNotes", name: "Class Notes", emoji: "📚" },
    { path: "/student-Assignments", name: "Assignments", emoji: "📝" },
    { path: "/student-reminders", name: "Reminders", emoji: "⏰" },
    { path: "/student-Setting", name: "Settings", emoji: "⚙️" },
  ];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role || "student");
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="w-64 bg-[#0f172a] text-white flex flex-col h-screen fixed left-0 top-0 z-50">
      <div className="flex-shrink-0">
        <div className="text-2xl font-bold px-6 py-4 border-b border-slate-700">
          🎓 {userRole === "teacher" ? "JU College (Teacher)" : "JU College (Student)"}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-2">
          {(userRole === "teacher" ? teacherNavItems : studentNavItems).map(
            (item) => (
              <Link
                key={item.path}
                to={item.path}
                className="p-2 rounded-md hover:bg-slate-700 transition-all flex items-center space-x-2"
              >
                <span>{item.emoji}</span>
                <span className="text-sm font-semibold">{item.name}</span>
              </Link>
            )
          )}
        </div>
      </nav>

      <div className="px-4 py-4 border-t border-slate-700 bg-[#0f172a] sticky bottom-0">
        <button
          onClick={handleLogout}
          className="w-full text-left text-red-400 hover:text-red-500 transition"
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;