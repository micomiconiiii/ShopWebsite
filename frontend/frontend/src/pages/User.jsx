import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const User = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');
    const [currentPassword, setCurrentPassword] = useState(""); // For current password
    const [newPassword, setNewPassword] = useState(""); // For new password
    const [confirmPassword, setConfirmPassword] = useState(""); // For confirming the new password
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    
    // Retrieve the userID and token from localStorage
    const userID = localStorage.getItem('userID'); 
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!userID || !token) {
            navigate('/login');
            return;
        }

        const fetchUserData = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`http://localhost:8800/user/${userID}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setUserName(res.data.name);
                setLoading(false);
            } catch (err) {
                setLoading(false);
                setError('Failed to fetch user data');
                console.log(err);
            }
        };

        fetchUserData();
    }, [userID, navigate, token]);

    // Handle logout
    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    // Handle password reset
    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) {
            setError("New password and confirmation don't match");
            return;
        }

        try {
          console.log('Sending verify password request');  // Debugging log
          console.log(currentPassword);  // Debugging log
          console.log(userID);
          // Step 1: Verify current password using the JWT token
            const response = await axios.post("http://localhost:8800/user/verify-password", {
                userId: userID,
                password: currentPassword,  // Send currentPassword as part of the request
            }, {
                headers: {
                    Authorization: `Bearer ${token}`  // Ensure the token is included here
                }
            });
            console.log('verify password request done');  // Debugging log
  
            if (response.data.success) {
                // Step 2: Proceed to update the password
                const updateResponse = await axios.put(
                    `http://localhost:8800/user/update-password/${userID}`,
                    {
                        newPassword
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`  // Include token for authentication
                        }
                    }
                );

                if (updateResponse.data.success) {
                    setSuccessMessage("Password updated successfully!");
                    setCurrentPassword("");  // Clear the fields
                    setNewPassword("");
                    setConfirmPassword("");
                } else {
                    setError("Failed to update password");
                }
            } else {
                setError("Current password is incorrect");
            }
        } catch (err) {
            console.error("Error: ", err.message);  // Log the error for more details
            setError('An error occurred while resetting the password');
        }
    };

    // Handle account deletion
    const handleDeleteAccount = async () => {
        try {
            console.log('Token:', token);

            await axios.delete(`http://localhost:8800/user/remove/${userID}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            alert('Account deleted successfully');
            localStorage.clear();
            navigate('/login');
        } catch (error) {
            console.error('Error deleting account', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
            }
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h1>Welcome, {userName || 'Unknown User'}</h1>
            <h2>Name: {userName}</h2>
            <h2>User ID: {userID}</h2>

            <div>
                <h3>Reset Password</h3>
                <input
                    type="password"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                />
                    
                <input
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button onClick={handleResetPassword}>Reset Password</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
            </div>

            <button onClick={handleLogout}>Log Out</button>
            <button onClick={handleDeleteAccount} style={{ backgroundColor: 'red', color: 'white' }}>
                Delete Account
            </button>
            <button><Link to="/home">Back</Link></button>
        </div>
    );
};

export default User;
