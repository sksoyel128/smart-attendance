// SettingTeacher.jsx
import React, { useState, useEffect } from "react";
import Dashboard from "./Dashboard";
import { Moon, Sun, User, Lock, LogOut } from "lucide-react";
import { auth, db } from "../config/firebase";
import { signOut, updateProfile, updateEmail, updatePassword } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function TeacherSettings() {
  const [isDark, setIsDark] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showSecurityForm, setShowSecurityForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    imageURL: "",
    phone: "",
    address: ""
  });
  const [passwordData, setPasswordData] = useState({ newPassword: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const initializeSettings = async () => {
      try {
        const theme = localStorage.getItem("theme");
        setIsDark(theme === "dark");
        document.documentElement.classList.toggle("dark", theme === "dark");

        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setFormData({
              name: userData.name || "",
              email: userData.email || "",
              imageURL: userData.imageURL || "",
              phone: userData.phone || "",
              address: userData.address || ""
            });
          }
        }
      } catch (err) {
        console.error("Initialization error:", err);
      }
    };

    initializeSettings();
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    document.documentElement.classList.toggle("dark", newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
  };

  const handleUpdate = async (e, isPasswordUpdate = false) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      if (isPasswordUpdate) {
        await updatePassword(user, passwordData.newPassword);
        setSuccess("Password updated successfully!");
        setPasswordData({ newPassword: "" });
      } else {
        // Update profile information
        await Promise.all([
          updateProfile(user, {
            displayName: formData.name,
            photoURL: formData.imageURL
          }),
          formData.email !== user.email && updateEmail(user, formData.email),
          updateDoc(doc(db, "users", user.uid), {
            name: formData.name,
            email: formData.email,
            imageURL: formData.imageURL,
            phone: formData.phone,
            address: formData.address
          })
        ]);
        setSuccess("Profile updated successfully!");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <Dashboard>
      <div className="max-w-4xl mx-auto px-6 py-10 text-gray-900 dark:text-white">
        <h1 className="text-3xl font-bold mb-6 text-center">👩🏫 Teacher Settings</h1>

        {/* Status Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg dark:bg-green-900/20 dark:text-green-300">
            {success}
          </div>
        )}

        <div className="grid gap-6">
          {/* Profile Section */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-md transition-all">
            <div 
              className="cursor-pointer group"
              onClick={() => setShowProfileForm(!showProfileForm)}
            >
              <div className="flex items-center gap-4 mb-3">
                <User size={20} className="text-blue-500 transition-colors group-hover:text-blue-600" />
                <h2 className="text-xl font-semibold">Professional Profile</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Update your professional information and contact details
              </p>
            </div>

            {showProfileForm && (
              <form onSubmit={handleUpdate} className="mt-4 space-y-4">
                <input
                  name="name"
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="teacher-input"
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Institutional Email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="teacher-input"
                />
                <input
                  name="imageURL"
                  type="url"
                  placeholder="Profile Image URL"
                  value={formData.imageURL}
                  onChange={(e) => setFormData({...formData, imageURL: e.target.value})}
                  className="teacher-input"
                />
                <input
                  name="phone"
                  type="tel"
                  placeholder="Contact Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="teacher-input"
                />
                <input
                  name="address"
                  type="text"
                  placeholder="Office Address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="teacher-input"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="teacher-btn-primary"
                >
                  {loading ? "Saving..." : "Save Professional Details"}
                </button>
              </form>
            )}
          </div>

          {/* Security Section */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-md transition-all">
            <div 
              className="cursor-pointer group"
              onClick={() => setShowSecurityForm(!showSecurityForm)}
            >
              <div className="flex items-center gap-4 mb-3">
                <Lock size={20} className="text-red-400 transition-colors group-hover:text-red-500" />
                <h2 className="text-xl font-semibold">Account Security</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Manage password and authentication settings
              </p>
            </div>

            {showSecurityForm && (
              <form onSubmit={(e) => handleUpdate(e, true)} className="mt-4 space-y-4">
                <input
                  name="newPassword"
                  type="password"
                  placeholder="New Password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ newPassword: e.target.value })}
                  className="teacher-input"
                  minLength="8"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="teacher-btn-primary"
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </form>
            )}
          </div>

          {/* Appearance Section */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-md flex justify-between items-center transition-all">
            <div className="flex items-center gap-4">
              <div className="text-pink-500 dark:text-indigo-400">
                {isDark ? (
                  <Moon size={20} className="animate-fade-in" />
                ) : (
                  <Sun size={20} className="animate-fade-in" />
                )}
              </div>
              <h2 className="text-xl font-semibold">Appearance</h2>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`px-4 py-2 rounded-full font-medium shadow-md transition-colors ${
                isDark 
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              }`}
            >
              {isDark ? "Dark Theme" : "Light Theme"}
            </button>
          </div>

          {/* Logout Section */}
          <div 
            onClick={handleLogout}
            className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-md cursor-pointer transition-all hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <div className="flex items-center gap-4 group">
              <LogOut size={20} className="text-red-500 transition-colors group-hover:text-red-600" />
              <h2 className="text-xl font-semibold">Sign Out</h2>
            </div>
          </div>
        </div>
      </div>
    </Dashboard>
  );
}

// Custom Styling
const teacherInputClasses = 
  "w-full p-3 rounded-xl border border-gray-300 dark:border-slate-600 " +
  "bg-white dark:bg-slate-700 dark:text-white " +
  "focus:ring-2 focus:ring-blue-500 focus:border-transparent " +
  "transition-all placeholder-gray-400 dark:placeholder-slate-400";

const teacherButtonClasses = 
  "w-full py-3 px-6 rounded-xl font-medium " +
  "bg-blue-600 hover:bg-blue-700 text-white " +
  "disabled:opacity-50 disabled:cursor-not-allowed " +
  "transition-colors shadow-sm";

const teacherStyles = `
  .teacher-input { ${teacherInputClasses} }
  .teacher-btn-primary { ${teacherButtonClasses} }
`;