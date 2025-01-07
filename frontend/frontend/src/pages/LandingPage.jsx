/*
- browse
- log in
- sign up
- picture
- navbar
- logo
*/
import React from 'react';
import { Link } from 'react-router-dom';
import '../LandingPage.css'; // Create a CSS file for styling

const LandingPage = () => {
   // Get the viewport size excluding tabs, address bar, etc.
console.log(`Viewport Width: ${window.innerWidth}px`);
console.log(`Viewport Height: ${window.innerHeight}px`);

    return (
        <div className="landing-page">
            {/* Navbar Section */}
            <nav className="navbar">
                <div className="logo">
                    <img src="/logo.png" alt="Logo" className="logo-img" /> {/* Replace with your logo image */}
                </div>
                <div className="nav-links">
                    <Link to="/home">Browse</Link>
                    <Link to="/login">Log In</Link>
                    <Link to="/register">Sign Up</Link>
                </div>
            </nav>

            {/* Main Content Section */}
            <div className="main-content">
                <div className="hero-section">
                    <Link to="/home" className="browse-btn">Browse Now</Link>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
