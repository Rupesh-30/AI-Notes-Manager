import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Added loading state for better UX

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Success alert removed! App.jsx will auto-redirect.
    } catch (error) {
      // User friendly error message
      alert("Login failed. Check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-white mb-2 text-center">
        Welcome Back
      </h2>

      <input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full bg-slate-800 text-white placeholder-slate-400 px-4 py-3 rounded-xl outline-none border border-slate-700 focus:border-cyan-500 transition-colors"
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full bg-slate-800 text-white placeholder-slate-400 px-4 py-3 rounded-xl outline-none border border-slate-700 focus:border-cyan-500 transition-colors"
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-500/50 text-white font-semibold py-3 rounded-xl transition-colors mt-2"
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}

export default Login;