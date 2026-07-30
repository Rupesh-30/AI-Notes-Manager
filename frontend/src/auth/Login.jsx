import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Login successful!");
    } catch (error) {
      toast.error("Login failed. Check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleLogin}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-5"
    >

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-3xl font-bold text-white text-center">
          Welcome Back 👋
        </h2>

        <p className="text-slate-400 text-center mt-2 text-sm">
          Login to your AI Notes Manager
        </p>
      </motion.div>


      <motion.input
        whileFocus={{ scale: 1.02 }}
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="
        w-full bg-slate-800/80 text-white 
        placeholder-slate-400 px-4 py-3 
        rounded-xl outline-none 
        border border-slate-700 
        focus:border-cyan-500 
        transition-all duration-300
        "
        required
      />


      <motion.input
        whileFocus={{ scale: 1.02 }}
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="
        w-full bg-slate-800/80 text-white 
        placeholder-slate-400 px-4 py-3 
        rounded-xl outline-none 
        border border-slate-700 
        focus:border-cyan-500 
        transition-all duration-300
        "
        required
      />


      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.95 }}
        type="submit"
        disabled={loading}
        className="
        w-full bg-cyan-500 
        hover:bg-cyan-600 
        disabled:bg-cyan-500/50 
        text-white font-semibold 
        py-3 rounded-xl 
        transition-all duration-300
        shadow-lg shadow-cyan-500/20
        "
      >
        {loading ? "⏳ Logging in..." : "🚀 Login"}
      </motion.button>


    </motion.form>
  );
}

export default Login;