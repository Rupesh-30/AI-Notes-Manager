import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Added loading state

  const handleSignup = async (e) => {
    e.preventDefault();

    // Validation
    if (!email) {
      alert("Please enter your email");
      return;
    }

    if (!email.includes("@")) {
      alert("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    setLoading(true); // Start loading

    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      // Removed success alert and form clear because App.jsx will auto-redirect to dashboard
    } catch (error) {
      console.log(error.code);

      if (error.code === "auth/email-already-in-use") {
        alert("This email is already registered. Please login.");
      } else if (error.code === "auth/invalid-email") {
        alert("Invalid email format.");
      } else if (error.code === "auth/weak-password") {
        alert("Password is too weak.");
      } else {
        alert(error.message);
      }
    } finally {
      setLoading(false); // Stop loading if there's an error
    }
  };

  return (
    <form onSubmit={handleSignup} className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-white mb-2 text-center">
        Create Account
      </h2>

      <input
        type="email"
        placeholder="Enter Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full bg-slate-800 text-white placeholder-slate-400 px-4 py-3 rounded-xl outline-none border border-slate-700 focus:border-cyan-500 transition-colors"
      />

      <input
        type="password"
        placeholder="Create Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full bg-slate-800 text-white placeholder-slate-400 px-4 py-3 rounded-xl outline-none border border-slate-700 focus:border-cyan-500 transition-colors"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-500/50 text-white font-semibold py-3 rounded-xl transition-colors mt-2"
      >
        {loading ? "Creating Account..." : "Signup"}
      </button>
    </form>
  );
}

export default Signup;