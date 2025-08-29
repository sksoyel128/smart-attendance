import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../config/firebase";
import { useNavigate, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore"; // Import doc and getDoc
import Swal from "sweetalert2";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // Add state for submission
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get user's role from Firestore after successful login
      const userDoc = await getDoc(doc(db, "users", user.uid));
      let role = "student"; // Default to student role
      if (userDoc.exists()) {
        role = userDoc.data().role;
      }

      Swal.fire({
        icon: "success",
        title: "Welcome Back! 🎉",
        text: "Login successful!",
        confirmButtonColor: "#22c55e",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        // Navigate based on the user's role
        if (role === "teacher") {
          navigate("/teacher-dashboard");
        } else {
          navigate("/student-dashboard");
        }
      });
      
    } catch (err) {
      console.error("Login error:", err.message);
      let errorMessage = "Something went wrong. Please try again.";

      if (err.code === "auth/user-not-found") {
        errorMessage = "No account found with this email.";
      } else if (err.code === "auth/wrong-password") {
        errorMessage = "Incorrect password. Please try again.";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Invalid email format.";
      }

      Swal.fire({
        icon: "error",
        title: "Login Failed 😔",
        text: errorMessage,
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setIsSubmitting(false); // Reset submitting state
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fef6fb]">
      <div className="flex w-[900px] bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Left Panel */}
        <div className="w-1/2 bg-purple-700 text-white flex flex-col items-center justify-center p-10">
          <h2 className="text-3xl font-bold mb-4">Welcome Back</h2>
          <p className="text-sm text-center mb-6">
            Glad to see you again! Please login to continue
          </p>
          <Link to="/signup">
            <button className="border border-white px-6 py-2 rounded hover:bg-white hover:text-purple-700 transition">
              SIGN UP
            </button>
          </Link>
        </div>

        {/* Right Panel */}
        <div className="w-1/2 p-10">
          <h2 className="text-2xl font-semibold text-purple-700 mb-6">Login</h2>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-2 mb-4 border rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-2 mb-6 border rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={isSubmitting} // Disable button while submitting
              className={`w-full bg-purple-700 text-white py-2 rounded transition ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-purple-800"
              }`}
            >
              {isSubmitting ? "Logging In..." : "LOGIN"}
            </button>
          </form>
          <p className="mt-4 text-sm">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-purple-700 font-semibold hover:underline">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
