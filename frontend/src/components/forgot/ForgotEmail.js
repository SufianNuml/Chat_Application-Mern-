import React, { useState } from "react";
import axios from "axios";
import '../css/Auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleForgotPassword = async () => {
    try {
      await axios.post("http://localhost:5000/forgot-password", { email });
      alert("Email sent successfully.");
    } catch (error) {
      alert("Failed to send email.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Forgot Password</h2>
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
        />
        <button onClick={handleForgotPassword}>Send Email</button>
      </div>
    </div>
  );
}
