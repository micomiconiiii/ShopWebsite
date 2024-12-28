import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddUser = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user", // Default role is "user"
  });
  const [error, setError] = useState(""); // General error state
  const [errorMessage, setErrorMessage] = useState(""); // Password mismatch error
  const navigate = useNavigate();

  // Handle input changes dynamically
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));

    // Clear password mismatch error while typing
    if (name === "password" || name === "confirmPassword") {
      setErrorMessage("");
    }
  };

  // Handle form submission
  const handleClick = async (e) => {
    e.preventDefault();
    setError(""); // Reset general error

    // Check if passwords match
    if (user.password !== user.confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    try {
      // Send registration data to the backend
      const response = await axios.post("http://localhost:8800/register", {
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
      });
      
      const { token, role, userName, userID } = response.data;

      localStorage.setItem("userID", userID); // Store the user's ID
      localStorage.setItem("name", userName); // Store the user's name
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
            
    

      // Role-based redirection
      if (response.data.role.toLowerCase() === "admin") {
        alert("Admin account created successfully!");
        navigate(`/`); // Redirect to admin dashboard
      } else {
        alert("Customer account created successfully!");
        navigate(`/home`); // Redirect to customer dashboard
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
      <input
        type="password"
        placeholder="Confirm Password"
        name="confirmPassword"
        value={user.confirmPassword}
        onChange={handleChange}
        required
      />
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
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
