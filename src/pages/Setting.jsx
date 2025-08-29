import React, { useState, useEffect } from "react";
import Dashboard from "./Dashboard";
import { Moon, Sun, User, Lock, LogOut } from "lucide-react";
import { auth, db } from "../config/firebase";
import {
  signOut,
  updateProfile,
  updateEmail,
  updatePassword,
} from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const [isDark, setIsDark] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showSecurityForm, setShowSecurityForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    imageURL: "",
    phone: "",
    address: "",
    rollNo: "",
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }

    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setFormData({
              name: docSnap.data().name || "",
              email: docSnap.data().email || "",
              imageURL: docSnap.data().imageURL || "",
              phone: docSnap.data().phone || "",
              address: docSnap.data().address || "",
              rollNo: docSnap.data().rollNo || "",
            });
          }
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchData();
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    const html = document.documentElement;
    newMode ? html.classList.add("dark") : html.classList.remove("dark");
    localStorage.setItem("theme", newMode ? "dark" : "light");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const user = auth.currentUser;
      if (!user) return;

      // Firebase Auth update
      if (user.displayName !== formData.name || user.photoURL !== formData.imageURL) {
        await updateProfile(user, {
          displayName: formData.name,
          photoURL: formData.imageURL,
        });
      }

      if (user.email !== formData.email) {
        await updateEmail(user, formData.email);
      }

      // Firestore update
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        name: formData.name,
        email: formData.email,
        imageURL: formData.imageURL,
        phone: formData.phone,
        address: formData.address,
        rollNo: formData.rollNo,
      });

      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const user = auth.currentUser;
      await updatePassword(user, passwordData.newPassword);
      setSuccess("Password updated successfully!");
      setPasswordData({ newPassword: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dashboard>
      <div className="max-w-4xl mx-auto px-6 py-10 text-gray-900 dark:text-white">
        <h1 className="text-3xl font-bold mb-6 text-center">⚙️ Settings</h1>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">{success}</div>}

        <div className="grid gap-6">
          {/* Profile Section */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-md">
            <div onClick={() => setShowProfileForm(!showProfileForm)} className="cursor-pointer">
              <div className="flex items-center gap-4 mb-3">
                <User size={20} className="text-blue-500" />
                <h2 className="text-xl font-semibold">Profile</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400">Update your name, photo, email, etc.</p>
            </div>

            {showProfileForm && (
              <form onSubmit={handleProfileUpdate} className="mt-4 space-y-4">
                <input name="name" type="text" placeholder="Name" value={formData.name} onChange={handleChange} className="input" />
                <input name="imageURL" type="text" placeholder="Image URL" value={formData.imageURL} onChange={handleChange} className="input" />
                <input name="phone" type="text" placeholder="Phone" value={formData.phone} onChange={handleChange} className="input" />
                <input name="address" type="text" placeholder="Address" value={formData.address} onChange={handleChange} className="input" />

                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? "Updating..." : "Save Changes"}
                </button>
              </form>
            )}
          </div>

          {/* Security Section */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-md">
            <div onClick={() => setShowSecurityForm(!showSecurityForm)} className="cursor-pointer">
              <div className="flex items-center gap-4 mb-3">
                <Lock size={20} className="text-red-400" />
                <h2 className="text-xl font-semibold">Security</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400">Change your password securely.</p>
            </div>

            {showSecurityForm && (
              <form onSubmit={handlePasswordUpdate} className="mt-4 space-y-4">
                <input
                  name="newPassword"
                  type="password"
                  placeholder="New Password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="input"
                />
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? "Updating..." : "Change Password"}
                </button>
              </form>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-md flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Sun size={20} className="text-pink-500 dark:hidden" />
              <Moon size={20} className="text-indigo-400 hidden dark:block" />
              <h2 className="text-xl font-semibold">Dark Mode</h2>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`px-4 py-2 rounded-full font-medium shadow-md ${
                isDark ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-800"
              }`}
            >
              {isDark ? "Dark" : "Light"}
            </button>
          </div>

          {/* Logout */}
          <div onClick={handleLogout} className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-md cursor-pointer">
            <div className="flex items-center gap-4">
              <LogOut size={20} className="text-red-500" />
              <h2 className="text-xl font-semibold">Logout</h2>
            </div>
          </div>
        </div>
      </div>
    </Dashboard>
  );
}

// Tailwind-style input and button utility classes
const inputClasses =
  "w-full p-2 rounded border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white";
const buttonClasses =
  "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50";

const input = { className: inputClasses };
const button = { className: buttonClasses };
