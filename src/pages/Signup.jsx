import React, { useState } from "react";
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail, sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "../config/firebase";
import { doc, setDoc, collection, getDocs } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);

    if (selectedRole === "teacher") {
      Swal.fire({
        title: "Teacher Password Required",
        input: "password",
        inputLabel: "Enter the teacher password:",
        inputPlaceholder: "Enter password...",
        showCancelButton: true,
        confirmButtonColor: "#7e22ce",
        cancelButtonColor: "#ef4444",
        inputValidator: (value) => {
          if (!value) return "Password is required!";
          if (value !== "JUADMIN54321") return "Incorrect password!";
          return null;
        },
      }).then((result) => {
        if (!result.isConfirmed) setRole("student");
      });
    }
  };

  const checkEmailExists = async (email) => {
    try {
      const providers = await fetchSignInMethodsForEmail(auth, email);
      return providers.length > 0;
    } catch (error) {
      console.error("Error checking email:", error);
      return false;
    }
  };

  const getNextRollNo = async () => {
    const snapshot = await getDocs(collection(db, "users"));
    const students = snapshot.docs
      .map(doc => doc.data())
      .filter(user => user.role === "student")
      .sort((a, b) => (b.rollNo || 0) - (a.rollNo || 0));

    return students.length ? (students[0].rollNo || 0) + 1 : 1;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        Swal.fire({
          icon: "warning",
          title: "Email Already Registered!",
          html: `This email is already registered. <br/>
                <div class="mt-4 space-y-2">
                  <a href="/login" class="text-purple-600 underline">Go to Login</a><br/>
                  <button id="resetPasswordBtn" class="text-purple-600 underline mt-2">
                    Reset Password
                  </button>
                </div>`,
          confirmButtonColor: "#7e22ce",
        });
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      const newUser = {
        uid: userCredential.user.uid,
        email,
        name,
        phone,
        address,
        imageURL: imageURL || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQoFRQjM-wM_nXMA03AGDXgJK3VeX7vtD3ctA&s',
        role,
        createdAt: new Date().toISOString(),
      };

      if (role === "student") {
        newUser.rollNo = await getNextRollNo();
      }

      await setDoc(doc(db, "users", userCredential.user.uid), newUser);

      Swal.fire({
        icon: "success",
        title: "Registration Successful! 🎉",
        text: "You've been successfully registered and are now logged in!",
        confirmButtonColor: "#7e22ce",
      }).then(() => {
        // Automatically navigate to the appropriate dashboard
        if (role === "teacher") {
          navigate("/teacher-dashboard");
        } else {
          navigate("/student-dashboard");
        }
      });

    } catch (err) {
      console.error("Signup error:", err);
      let errorMessage = "Something went wrong. Please try again.";

      if (err.code === "auth/email-already-in-use") {
        errorMessage = "This email is already registered. Try logging in!";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      } else if (err.code === "auth/weak-password") {
        errorMessage = "Password should be at least 6 characters long.";
      }

      Swal.fire({
        icon: "error",
        title: "Registration Failed 😢",
        text: errorMessage,
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      Swal.fire({
        icon: "warning",
        title: "Email Required",
        text: "Please enter your email address first",
        confirmButtonColor: "#7e22ce",
      });
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Swal.fire({
        icon: "success",
        title: "Password Reset Sent",
        text: `Check ${email} for reset instructions`,
        confirmButtonColor: "#7e22ce",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Reset Failed",
        text: "Error sending password reset email",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fef6fb]">
      <button id="resetPasswordBtn" onClick={handlePasswordReset} className="hidden" />
      
      <div className="flex w-[900px] bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Left Panel */}
        <div className="w-1/2 bg-purple-700 text-white flex flex-col items-center justify-center p-10">
          <h2 className="text-3xl font-bold mb-4">Welcome</h2>
          <p className="text-sm text-center mb-6">
            Join Our Unique Platform, Explore a New Experience
          </p>
          <Link to="/login">
            <button className="border border-white px-6 py-2 rounded hover:bg-white hover:text-purple-700 transition">
              LOGIN
            </button>
          </Link>
        </div>

        {/* Right Panel */}
        <div className="w-1/2 p-10 overflow-y-auto max-h-[90vh]">
          <h2 className="text-2xl font-semibold text-purple-700 mb-6">Sign Up</h2>
          <form onSubmit={handleSignup} className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              className="w-full px-4 py-2 border rounded bg-white"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-2 border rounded bg-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-2 border rounded bg-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
            />
            <select
              value={role}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="w-full px-4 py-2 border rounded bg-white"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
            <input
              type="tel"
              placeholder="Phone Number"
              className="w-full px-4 py-2 border rounded bg-white"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Address"
              className="w-full px-4 py-2 border rounded bg-white"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
            <input
              type="url"
              placeholder="Profile Image URL (optional)"
              className="w-full px-4 py-2 border rounded bg-white"
              value={imageURL}
              onChange={(e) => setImageURL(e.target.value)}
              pattern="https://.*"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-purple-700 text-white py-2 rounded transition ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-purple-800"
              }`}
            >
              {isSubmitting ? "Registering..." : "REGISTER"}
            </button>
          </form>
          <p className="mt-4 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-purple-700 font-semibold hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
