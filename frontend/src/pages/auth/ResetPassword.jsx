// src/pages/auth/ResetPassword.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "../auth/Loginlg.css";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link. Please request a new password reset.");
    }
  }, [token]);

  const handleReset = async () => {
    if (!newPassword || !confirmPassword) {
      setError("Please enter and confirm your new password");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        setError(data.error || "Failed to reset password");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="card" style={{ transform: "none" }}>
        <div className="card-face card-front">
          <h2>Reset Password</h2>
          
          {!token ? (
            <p className="error-msg">Invalid or expired reset link.</p>
          ) : message ? (
            <p className="success-msg">{message}</p>
          ) : (
            <>
              <p>Enter your new password</p>
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {error && <p className="error-msg">{error}</p>}
              <button 
                onClick={handleReset} 
                disabled={isLoading}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
            </>
          )}
          
          <p onClick={() => navigate("/")}>Back to Login</p>
        </div>
      </div>
    </div>
  );
}