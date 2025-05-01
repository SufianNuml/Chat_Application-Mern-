import React, { useState } from 'react';
import './css/Navbar.css';
import { Link } from 'react-router-dom';
import img1 from './img/logo.jpg';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <nav className="navbar">
            <Link to="/home" className="navbar-brand">
                <img src={img1} alt="Logo" className="navbar-logo" />
            </Link>
            <div className={`navbar-toggle ${isOpen ? 'open' : ''}`} onClick={toggleMenu}>
                <span className="navbar-toggle-icon"></span>
                <span className="navbar-toggle-icon"></span>
                <span className="navbar-toggle-icon"></span>
            </div>
            <ul className={`navbar-menu ${isOpen ? 'active' : ''}`}>
                <li className="navbar-item"><Link to="/adduser">Add User</Link></li>
                <li className="navbar-item"><Link to="/Profile">Profile</Link></li>
            </ul>
        </nav>
    );
}
