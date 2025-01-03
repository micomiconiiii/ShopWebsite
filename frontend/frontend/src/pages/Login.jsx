import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); // Clear previous error messages

        try {
            const response = await axios.post("http://localhost:8800/login", {
                email,
                password,
                
            });
            
            // Assuming the response contains the user's name, token, role, and userID
            const { token, role, name, userID } = response.data;

            // Store the user's data in localStorage
            localStorage.setItem("token", token);
            localStorage.setItem("role", role);
            localStorage.setItem("name", name);
            localStorage.setItem("userID", userID); // Store the user's ID
            console.log(response.data);

            // Redirect based on role
            if (role === "admin") {
                alert("Admin Login successful!");
                navigate("/products"); // Redirect to admin dashboard
            } else {
                
                alert("Welcome back " + name+"!");
                navigate('/home'); 
            }
        } catch (err) {
            console.error(err);
            setError("Invalid email or password. Please try again.");
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "auto", padding: "20px" }}>
            <h2>Login</h2>
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
                    <button><Link to = "/register">Register Here</Link></button>
                </div>
            </form>
        </div>
    );
};

export default Login;
