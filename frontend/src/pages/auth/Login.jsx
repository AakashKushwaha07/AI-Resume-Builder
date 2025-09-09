// src/pages/auth/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Loginlg.css";

export default function Login({ setUserName }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (email && password) {
      setUserName(name || email.split("@")[0]); // take name if available, else use email prefix
      navigate("/dashboard");
    }
  };

  const handleSignup = () => {
    if (name && email && password) {
      setUserName(name);
      navigate("/dashboard");
    }
  };

  return (
    <div className="login-container">
      <div className={`card ${isSignUp ? "rotate" : ""}`}>
        {/* Front - Login */}
        <div className="card-face card-front">
          <h2>Login</h2>
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin}>Login</button>
          <p onClick={() => setIsSignUp(true)}>Don’t have an account? Sign Up</p>
        </div>

        {/* Back - Signup */}
        <div className="card-face card-back">
          <h2>Sign Up</h2>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleSignup}>Sign Up</button>
          <p onClick={() => setIsSignUp(false)}>Already have an account? Login</p>
        </div>
      </div>
    </div>
  );
}
