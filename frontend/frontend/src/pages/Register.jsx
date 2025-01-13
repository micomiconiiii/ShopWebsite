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
    console.log("Submitting OTP:", otp); // Debugging line

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
  
    // Save the email and name in localStorage before sending OTP
    localStorage.setItem("userEmail", user.email); // Store the user's email
    localStorage.setItem("userName", user.name); // Store the user's name

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
  <div className="register-container">
    <div className="register-form-container">
      {/* Left Side of the form */}
      <div className="left-section">
        <div className="content text-center">
          <h2 className="mb-4">Sign Up</h2>
          {!otpSent ? (
            // Sign Up form
            <form onSubmit={handleClick}>
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Full Name"
                  name="name"
                  value={user.name}
                  onChange={handleChange}
                  required
                  className="form-control input-box"
                  
                />
              </div>

              <div className="mb-3">
                <input
                  type="email"
                  placeholder="Email Address"
                  name="email"
                  value={user.email}
                  onChange={handleChange}
                  required
                  className="form-control input-box"
                />
              </div>

              <div className="mb-3">
                <input
                  type="password"
                  placeholder="Password"
                  name="password"
                  value={user.password}
                  onChange={handleChange}
                  required
                  className="form-control input-box"
                />
              </div>

              <div className="mb-3">
                <input
                  type="password"
                  placeholder="Confirm Password"
                  name="confirmPassword"
                  value={user.confirmPassword}
                  onChange={handleChange}
                  required
                  className="form-control input-box"
                />
              </div>

              {errorMessage && <p className="text-danger">{errorMessage}</p>}

              <button type="submit" className="btn w-100 button">
                Sign Up
              </button>

              {error && <p className="text-danger">{error}</p>}
            </form>
          ) : (
            // OTP form
            <form onSubmit={handleOtpSubmit}>
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Enter OTP sent to your email"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="form-control input-box"
                />
              </div>
              <button type="submit" className="btn btn-primary w-100 button">
                Verify OTP
              </button>
              {otpError && <p className="text-danger">{otpError}</p>}
            </form>
          )}

          {/* Admin Terms and Conditions Modal */}
          {showModal && (
            <div className="modal">
              <div className="modal-content">
                <h3>Admin Terms and Conditions</h3>
                <p>
                  By selecting the "Admin" role, you agree to the terms and
                  conditions. Admins are responsible for managing sensitive
                  information and ensuring platform security.
                </p>
                <button onClick={closeModal} className="modal-button">I Agree</button>
                <button onClick={handleDisagree} className="modal-button"> I Disagree </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right side: background image */}
      <div className="right-section"></div>
    </div>
  </div>
);
};


export default AddUser;
