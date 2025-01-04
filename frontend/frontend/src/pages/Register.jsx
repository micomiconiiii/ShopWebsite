import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../register.css'; // Assuming we will add custom CSS here

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
  const [showModal, setShowModal] = useState(false);

  const handleDisagree = () => {
    setShowModal(false);
    setUser({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "user",
    }); // Reset user input
    setError("Account creation canceled as the terms were not accepted.");
    localStorage.clear();
  };

  // Handle input changes dynamically
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));

    // Clear password mismatch error while typing
    if (name === "password" || name === "confirmPassword") {
      setErrorMessage("");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    handleUserCreation();
  };

  // Handle user creation (common for both regular users and admins)
  const handleUserCreation = async () => {
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

      // Redirect based on role
      if (role.toLowerCase() === "admin") {
        alert("Admin account created successfully!");
        navigate(`/products`); // Redirect to admin dashboard
      } else {
        alert("Customer account created successfully!");
        navigate(`/home`); // Redirect to customer dashboard
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while adding the user. Please try again.");
    }
  };

  // Handle form submission
  const handleClick = (e) => {
    e.preventDefault(); // Prevent form submission

    // If role is admin, show modal to confirm agreement
    if (user.role.toLowerCase() === "admin") {
      setShowModal(true);
    } else {
      handleUserCreation(); // Proceed with user creation
    }
  };

  return (
    <div className="add-user-container">
      <h1>Add New User</h1>
      <form className="add-user-form" onSubmit={handleClick}>
        <div className="form-group">
          <input
            type="text"
            placeholder="Full Name"
            name="name"
            value={user.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <input
            type="email"
            placeholder="Email Address"
            name="email"
            value={user.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={user.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <input
            type="password"
            placeholder="Confirm Password"
            name="confirmPassword"
            value={user.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <div className="form-group">
          <select
            name="role"
            value={user.role}
            onChange={handleChange}
            className="role-select"
          >
            <option value="user">Customer</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button type="submit" className="submit-button">
          Add User
        </button>
        
        {error && <p className="error-message">{error}</p>}
      </form>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Admin Terms and Conditions</h3>
            <p>
              By selecting the "Admin" role, you agree to the terms and
              conditions. Admins are responsible for managing sensitive
              information and ensuring platform security.
            </p>
            <button onClick={closeModal}>I Agree</button>
            <button onClick={handleDisagree}> I Disagree </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddUser;
