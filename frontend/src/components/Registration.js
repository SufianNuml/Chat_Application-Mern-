import React from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/Auth.css'; // Shared CSS file

export default function Registration() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const getData = (e) => {
        e.preventDefault();
        axios.post("http://localhost:5000/register", { username, email, password })
            .then(result => {
                navigate('/login');
            })
            .catch(err => {
                alert("This Email or Password was already registered. Please try again");
            });
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h1>Sign Up</h1>
                <form onSubmit={getData}>
                    <label>Username:</label>
                    <input type="text" name="username" required onChange={(e) => setUsername(e.target.value)} />
                    <label>Email:</label>
                    <input type="email" name="email" required onChange={(e) => setEmail(e.target.value)} />
                    <label>Password:</label>
                    <input type="password" name="password" required onChange={(e) => setPassword(e.target.value)} />
                    <input type="submit" value="Submit" />
                </form>
                <div className="extra-links">
                    <p>Already have an account? <Link to="/login">Login here</Link></p>
                </div>
            </div>
        </div>
    );
}
