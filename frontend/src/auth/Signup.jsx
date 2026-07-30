import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    if (!email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      toast.success("Account created successfully!");

    } catch (error) {
      console.log(error.code);

      if (error.code === "auth/email-already-in-use") {
        toast.error("This email is already registered. Please login.");
      } 
      else if (error.code === "auth/invalid-email") {
        toast.error("Invalid email format.");
      } 
      else if (error.code === "auth/weak-password") {
        toast.error("Password is too weak.");
      } 
      else {
        toast.error(error.message);
      }

    } finally {
      setLoading(false);
    }
  };


  return (
    <motion.form
      onSubmit={handleSignup}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-5"
    >

      <div className="text-center">

        <motion.h2
          initial={{scale:0.8}}
          animate={{scale:1}}
          className="text-3xl font-bold text-white"
        >
          Create Account 🚀
        </motion.h2>

        <p className="text-slate-400 text-sm mt-2">
          Start managing your notes with AI
        </p>

      </div>


      <motion.input
        whileFocus={{scale:1.02}}
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
        className="
        w-full bg-slate-800/80 
        text-white 
        placeholder-slate-400
        px-4 py-3
        rounded-xl
        outline-none
        border border-slate-700
        focus:border-cyan-400
        transition-all
        "
        required
      />


      <motion.input
        whileFocus={{scale:1.02}}
        type="password"
        placeholder="Create Password"
        value={password}
        onChange={(e)=>setPassword(e.target.value)}
        className="
        w-full bg-slate-800/80
        text-white
        placeholder-slate-400
        px-4 py-3
        rounded-xl
        outline-none
        border border-slate-700
        focus:border-cyan-400
        transition-all
        "
        required
      />


      <motion.button
        whileHover={{
          scale:1.03
        }}
        whileTap={{
          scale:0.95
        }}
        type="submit"
        disabled={loading}
        className="
        w-full
        bg-gradient-to-r
        from-cyan-500
        to-blue-500
        hover:from-cyan-400
        hover:to-blue-400
        text-white
        font-semibold
        py-3
        rounded-xl
        shadow-lg
        shadow-cyan-500/20
        transition-all
        "
      >
        {loading ? "⏳ Creating Account..." : "✨ Signup"}

      </motion.button>


    </motion.form>
  );
}

export default Signup;