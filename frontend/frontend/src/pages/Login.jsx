import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../Login.css";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [otp, setOtp] = useState(""); // New state for OTP
    const [otpSent, setOtpSent] = useState(false); // Track if OTP has been sent
    const [otpError, setOtpError] = useState(""); // OTP error state
    const [token, setToken] = useState(""); // Save token before OTP verification
    const [role, setRole] = useState(""); // Save role before OTP verification
    const [name, setName] = useState(""); // Save name before OTP verification
    const [userID, setUserID] = useState(""); // Save userID before OTP verification
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); // Clear previous error messages

        try {
            const response = await axios.post("http://localhost:8800/login", {
                email,
                password,
            });

            const { token, role, name, userID } = response.data;

            // Store token, role, name, and userID temporarily
            setToken(token);
            setRole(role);
            setName(name);
            setUserID(userID);

            // Send OTP for 2FA
            const otpResponse = await axios.post("http://localhost:8800/send-email", {
                email, // Send the email to receive OTP
                name
            });

            if (otpResponse.data.success) {
                setOtpSent(true); // Mark OTP as sent
                alert("OTP sent to your email!");
            } else {
                throw new Error("Failed to send OTP.");
            }
        } catch (err) {
            console.error(err);
            setError("Invalid email or password. Please try again.");
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setOtpError(""); // Clear previous OTP error messages

        try {
            const response = await axios.post("http://localhost:8800/verify-otp", {
                email,
                otp,
            });

            if (response.data.success) {
                // OTP verified successfully, now store data in localStorage
                localStorage.setItem("token", token);
                localStorage.setItem("role", role);
                localStorage.setItem("name", name);
                localStorage.setItem("userID", userID); // Store the user's ID

                // Redirect based on role
                if (role === "admin") {
                    alert("Admin Login successful!");
                    navigate("/products"); // Redirect to admin dashboard
                } else {
                    alert("Welcome back " + name + "!");
                    navigate("/home"); // Redirect to customer dashboard
                }
            } else {
                setOtpError("Invalid OTP. Please try again.");
            }
        } catch (err) {
            console.error(err);
            setOtpError("Error verifying OTP. Please try again.");
        }
    };

    return (
        <div className="login-container">
            <div className="login-form-container">
                {/* Left Side of the form */}
                <div className="left-section">
                    <div className="content text-center">
                        <h2 className="mb-4">Login</h2>
                        {!otpSent ? (
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <input 
                                        type="email"
                                        className="form-control input-box"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <input
                                        type="password"
                                        className="form-control input-box"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        required
                                    />
                                </div>
                                <button className="btn w-100 button" type="submit">
                                    Login
                                </button>
                                {error && <p className="text-danger">{error}</p>}
                            </form>
                        ) : (
                            <form onSubmit={handleOtpSubmit}>
                                <div className="mb-3">
                                    <label style={{textDecoration:'none', fontWeight:'lighter'}}>Enter OTP sent to your email:</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        placeholder="Enter OTP"
                                        required
                                    />
                                </div>
                                <button className="btn w-100 button" type="submit">
                                    Verify OTP
                                </button>
                                {otpError && <p className="text-danger">{otpError}</p>}
                            </form>
                        )}
                        {/* Separate Register Button */}
                        <div>
                            <p>No account yet?</p>
                            <button className="button btn w-100">
                                <Link to="/register" className="text-decoration-none custom-text">Register Here</Link>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right side: background image */}
                <div className="right-section-login"></div>
            </div>
        </div>
    );
};

export default Login;
