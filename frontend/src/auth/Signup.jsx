import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";

function Signup() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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


    try {

      await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      alert("Account created successfully!");


      // clear form
      setEmail("");
      setPassword("");


    } catch (error) {

      console.log(error.code);

      if (error.code === "auth/email-already-in-use") {
        alert("This email is already registered. Please login.");
      }

      else if (error.code === "auth/invalid-email") {
        alert("Invalid email format.");
      }

      else if (error.code === "auth/weak-password") {
        alert("Password is too weak.");
      }

      else {
        alert(error.message);
      }

    }
  };


  return (
    <div>

      <h2>Signup</h2>

      <form onSubmit={handleSignup}>

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />


        <input
          type="password"
          placeholder="Create Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />


        <button type="submit">
          Signup
        </button>

      </form>

    </div>
  );
}

export default Signup;