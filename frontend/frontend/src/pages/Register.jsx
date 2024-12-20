import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddUser = () => {
    // Combined state for user input
    const [user, setUser] = useState({
        name: "",
        email: "",
        password: "",
        role: "user", // Default role is "user"
    });
    const [error, setError] = useState(""); // Error state

    const navigate = useNavigate();

    // Handle input changes dynamically
    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser((prev) => ({ ...prev, [name]: value }));
    };

    // Handle form submission
    const handleClick = async (e) => {
        e.preventDefault();
        setError(""); // Reset error state

        try {
            // Send registration data to the backend
            const response = await axios.post("http://localhost:8800/register", {
                name: user.name,
                email: user.email,
                password: user.password,
                role: user.role,
            });

            // Role-based redirection
            if (response.data.role.toLowerCase() === "admin") {
                alert("Admin account created successfully!");
                navigate("/"); // Redirect to admin dashboard
            } else {
                alert("Customer account created successfully!");
                navigate("/home"); // Redirect to customer dashboard
            }
        } catch (err) {
            console.error(err);
            setError("An error occurred while adding the user. Please try again.");
        }
    };

    return (
        <div className="form" style={{ maxWidth: "400px", margin: "auto", padding: "20px" }}>
            <h1>Add User</h1>
            <input
                type="text"
                placeholder="Name"
                name="name"
                value={user.name}
                onChange={handleChange}
                required
            />
            <input
                type="email"
                placeholder="Email"
                name="email"
                value={user.email}
                onChange={handleChange}
                required
            />
            <input
                type="password"
                placeholder="Password"
                name="password"
                value={user.password}
                onChange={handleChange}
                required
            />
            <select name="role" value={user.role} onChange={handleChange}>
                <option value="user">Customer</option>
                <option value="admin">Admin</option>
            </select>
            <button onClick={handleClick} style={{ marginTop: "10px" }}>
                Add User
            </button>
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
};

export default AddUser;
