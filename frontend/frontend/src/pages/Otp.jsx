import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const VerifyOTP = () => {
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); // Clear previous error messages

        try {
            const response = await axios.post("http://localhost:8800/verify-otp", {
                email: localStorage.getItem("email"), // Assuming email was stored in localStorage
                otp,
            });

            alert("OTP verified successfully!");
            navigate("/dashboard"); // Redirect to the appropriate page after successful verification
        } catch (err) {
            setError("Invalid OTP. Please try again.");
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "auto", padding: "20px" }}>
            <h2>Enter OTP</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>OTP:</label>
                    <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter the OTP sent to your email"
                        required
                    />
                </div>
                <button type="submit" style={{ marginTop: "10px" }}>
                    Verify OTP
                </button>
                {error && <p style={{ color: "red" }}>{error}</p>}
            </form>
        </div>
    );
};

export default VerifyOTP;
