import React from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import './css/Auth.css'; // Shared CSS file

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const getData = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:5000/login", { email, password });
            if (response.data.username) {
                localStorage.setItem("username", response.data.username);
                navigate("/home");
            }
        } catch (error) {
            alert("Failed to log in");
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h1>Login</h1>
                <form onSubmit={getData}>
                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        required
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <label>Password:</label>
                    <input
                        type="password"
                        name="password"
                        required
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <input type="submit" value="Login" />
                </form>
                <div className="extra-links">
                    <p><Link to="/forgot">Forget Password?</Link></p>
                    <p><Link to="/">Sign Up</Link></p>
                </div>
            </div>
        </div>
    );
}
