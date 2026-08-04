import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import toast from "react-hot-toast";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      // 1. Create Firebase Authentication account
      const result = await createUserWithEmailAndPassword(
        auth,
        cleanEmail,
        password
      );

      // 2. Create initial Firestore user document
      await setDoc(doc(db, "users", result.user.uid), {
        email: result.user.email,
        usage: {
          totalRequests: 0,
          summarize: 0,
          grammar: 0,
          tasks: 0,
          translate: 0,
          rewrite: 0,
          askAI: 0,
        },
        createdAt: serverTimestamp(),
      });

      toast.success("Account created successfully!");
    } catch (error) {
      console.error("Signup Error:", error);

      switch (error.code) {
        case "auth/email-already-in-use":
          toast.error("This email is already registered. Please login.");
          break;

        case "auth/invalid-email":
          toast.error("Please enter a valid email address.");
          break;

        case "auth/weak-password":
          toast.error("Password is too weak. Please use a stronger password.");
          break;

        case "auth/network-request-failed":
          toast.error("Network error. Please check your internet connection.");
          break;

        default:
          toast.error("Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignup} className="flex flex-col gap-4">
      <input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-400 outline-none focus:border-cyan-400 transition-colors"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-400 outline-none focus:border-cyan-400 transition-colors"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.98]"
      >
        {loading ? "Creating Account..." : "Sign Up"}
      </button>
    </form>
  );
}

export default Signup;

