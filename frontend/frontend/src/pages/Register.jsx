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
  const [otp, setOtp] = useState(""); // OTP state
  const [otpSent, setOtpSent] = useState(false); // Track if OTP has been sent
  const [otpError, setOtpError] = useState(""); // OTP error state
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
  // Handle OTP submission
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setOtpError(""); // Clear previous OTP error messages
    
    try {
      const response = await axios.post("http://localhost:8800/verify-otp", {
        email: user.email,
        otp: otp,
      });

      if (response.data.success) {
        // Proceed with user creation after OTP verification
        handleUserCreation();
      } else {
        setOtpError("Invalid OTP. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setOtpError("Error verifying OTP. Please try again.");
    }
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
// Handle form submission to send OTP
const handleClick = async (e) => {
  e.preventDefault();
  setError(""); // Reset general error

  // If role is admin, show modal for agreement
  if (user.role.toLowerCase() === "admin") {
    setShowModal(true);
  } else {
    try {
      const otpResponse = await axios.post("http://localhost:8800/send-email", {
        email: user.email,
        name: user.name,
      });

      if (otpResponse.data.success) {
        setOtpSent(true); // Mark OTP as sent
        alert("OTP sent to your email!");
      } else {
        setError("Failed to send OTP.");
      }
    } catch (err) {
      console.error(err);
      setError("Error sending OTP. Please try again.");
    }
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

        
        <button type="submit" className="submit-button">
          Add User
        </button>
        
        {error && <p className="error-message">{error}</p>}
      </form>
      {otpSent && (
        <form onSubmit={handleOtpSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Enter OTP sent to your email"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="submit-button">
            Verify OTP
          </button>
          {otpError && <p className="error-message">{otpError}</p>}
        </form>
      )}

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
