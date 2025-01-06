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
  const [otp, setOtp] = useState(""); // OTP state
  const [otpSent, setOtpSent] = useState(false); // State to track OTP sent status
  const [showModal, setShowModal] = useState(false);
  const [otpError, setOtpError] = useState(""); // OTP error message
  const navigate = useNavigate();

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

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
    setOtpError(""); // Clear OTP error message while typing
  };

  const closeModal = () => {
    setShowModal(false);
    sendOtp(); // Send OTP when user agrees
  };

  // Function to send OTP to admin's email
  const sendOtp = async () => {
    try {
      const response = await axios.post("http://localhost:8800/send-otp", {
        email: user.email, // Send the email to receive OTP
      });

      if (response.data.success) {
        setOtpSent(true); // Mark OTP as sent
        alert("OTP sent to your email!");
      } else {
        setOtpError("Failed to send OTP. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setOtpError("Error sending OTP. Please try again.");
    }
  };

  // Function to verify OTP
  const verifyOtp = async () => {
    try {
      const response = await axios.post("http://localhost:8800/verify-otp", {
        email: user.email,
        otp,
      });

      if (response.data.success) {
        handleUserCreation(); // Proceed with user creation if OTP is verified
      } else {
        setOtpError("Invalid OTP. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setOtpError("Error verifying OTP. Please try again.");
    }
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
      <h1>Add New User or Admin</h1>
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
              "By adding a new admin, you acknowledge and consent to sharing the 
              business's personal information with this account."
            </p>
            <button onClick={closeModal}>I Agree</button>
            <button onClick={handleDisagree}> I Disagree </button>
          </div>
        </div>
      )}

      {otpSent && (
        <div className="otp-modal">
          <div className="otp-modal-content">
            <h3>Enter OTP</h3>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={handleOtpChange}
            />
            <button onClick={verifyOtp}>Verify OTP</button>
            {otpError && <p className="error-message">{otpError}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddUser;
