import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [otp, setOtp] = useState(""); // New state for OTP
    const [otpSent, setOtpSent] = useState(false); // Track if OTP has been sent
    const [otpError, setOtpError] = useState(""); // OTP error state
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

            
          
            // Send OTP for 2FA
            const otpResponse = await axios.post("http://localhost:8800/send-email", {
                email, // Send the email to receive OTP
                name
            });

            if (otpResponse.data.success) {
                setOtpSent(true); // Mark OTP as sent
                alert("OTP sent to your email!");

                  // Store the user's data in localStorage
            localStorage.setItem("token", token);
            localStorage.setItem("role", role);
            localStorage.setItem("name", name);
            localStorage.setItem("userID", userID); // Store the user's ID
          
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
        
        // Retrieve the name from localStorage
        const name = localStorage.getItem("name");
    
        try {
            const response = await axios.post("http://localhost:8800/verify-otp", {
                email,
                otp,
            });
    
            if (response.data.success) {
                // OTP verified successfully, now use the name from localStorage
                const { role } = response.data;
                if (role === "admin") {
                    alert("Admin Login successful!");
                    navigate("/products"); // Redirect to admin dashboard
                } else {
                    alert("Welcome back " + name + "!");
                    navigate('/home');
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
        <div style={{ maxWidth: "400px", margin: "auto", padding: "20px" }}>
            <h2>Login</h2>
            {!otpSent ? (
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div>
                        <label>Password:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    <button type="submit" style={{ marginTop: "10px" }}>
                        Login
                    </button>
                    {error && <p style={{ color: "red" }}>{error}</p>}
                    <div>
                        <p>No account yet?</p>
                        <button>
                            <Link to="/register">Register Here</Link>
                        </button>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleOtpSubmit}>
                    <div>
                        <label>Enter OTP sent to your email:</label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter OTP"
                            required
                        />
                    </div>
                    <button type="submit" style={{ marginTop: "10px" }}>
                        Verify OTP
                    </button>
                    {otpError && <p style={{ color: "red" }}>{otpError}</p>}
                </form>
            )}
        </div>
    );
};

export default Login;
