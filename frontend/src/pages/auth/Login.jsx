// src/pages/auth/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Loginlg.css";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

export default function Login({ setUserName }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotError, setForgotError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUserName(data.user.username || email.split("@")[0]);
        navigate("/dashboard");
      } else {
        alert(data.error || "Login failed");
      }
    } catch (err) {
      alert("Server error. Is the backend running?");
    }
  };

  const handleSignup = async () => {
    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: name, email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert("Account created! Please login.");
        setIsSignUp(false);
      } else {
        alert(data.error || "Signup failed");
      }
    } catch (err) {
      alert("Server error. Is the backend running?");
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      setForgotError("Please enter your email");
      return;
    }
    
    setForgotError("");
    setForgotMessage("");
    
    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setForgotMessage(data.message);
        setTimeout(() => {
          setShowForgotModal(false);
          setForgotMessage("");
          setForgotEmail("");
        }, 3000);
      } else {
        setForgotError(data.error || "Failed to send reset email");
      }
    } catch (err) {
      setForgotError("Server error. Please try again later.");
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
          <p className="forgot-link" onClick={() => setShowForgotModal(true)}>
            Forgot Password?
          </p>
          <p onClick={() => setIsSignUp(true)}>Don&apos;t have an account? Sign Up</p>
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

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal-overlay" onClick={() => setShowForgotModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Reset Password</h3>
            <p>Enter your Gmail address and we&apos;ll send you a reset link.</p>
            <input
              type="email"
              placeholder="your.email@gmail.com"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
            />
            {forgotError && <p className="error-msg">{forgotError}</p>}
            {forgotMessage && <p className="success-msg">{forgotMessage}</p>}
            <div className="modal-buttons">
              <button onClick={handleForgotPassword}>Send Reset Link</button>
              <button className="cancel-btn" onClick={() => {
                setShowForgotModal(false);
                setForgotEmail("");
                setForgotError("");
                setForgotMessage("");
              }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}