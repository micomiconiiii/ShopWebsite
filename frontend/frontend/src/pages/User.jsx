import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const User = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');
    const [newUserName, setNewUserName] = useState(''); // New username state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [image, setImage] = useState(null); // State to hold the image file
    const [imagePreview, setImagePreview] = useState(null); // Preview of the image
    const [profileImage, setProfileImage] = useState(null); // New state for profile image
    const userID = localStorage.getItem('userID');
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role'); // Get the role from localStorage

    useEffect(() => {
        if (!userID || !token) {
            navigate('/login');
            return;
        }
        console.log('Token:', token);   // Debugging log
        console.log('User ID:', userID);   // Debugging log
        const fetchUserData = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`http://localhost:8800/user/${userID}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setUserName(res.data.name);
                setProfileImage(res.data.image_path);  // Set profile image URL from the backend
                console.log("profile image",profileImage);
                setLoading(false);
            } catch (err) {
                setLoading(false);
                setError('Failed to fetch user data');
            }
        };

        fetchUserData();
    }, [userID, navigate, token]);

    // Handle username change
    const handleChangeName = async () => {
        console.log("New Username: ",newUserName );
        try {
            const response = await axios.put(
                `http://localhost:8800/user/update-username/${userID}`,
                {
                    newUserName
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                setUserName(newUserName);  // Update the username in the state
                setSuccessMessage('Username updated successfully!');
                setNewUserName('');  // Clear the input field
                localStorage.setItem('name', newUserName); 
            } else {
                setError('Failed to update username');
            }
        } catch (err) {
            setError('An error occurred while updating the username');
        }
    };
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
        setImagePreview(URL.createObjectURL(file)); // Preview the selected image
    };

    const handleImageUpload = async () => {
        if (!image) {
            alert('Please select an image to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('image', image);

        try {
            const response = await axios.post(`http://localhost:8800/user/upload-image/${userID}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                setSuccessMessage('Profile picture updated successfully!');
                window.location.reload(); // Reload the page
            } else {
                setError('Failed to update profile picture.');
            }
        } catch (err) {
            setError('An error occurred while uploading the image.');
        }
    };
    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) {
            setError("New password and confirmation don't match");
            return;
        }

        try {
            const response = await axios.post("http://localhost:8800/user/verify-password", {
                userId: userID,
                password: currentPassword,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.success) {
                const updateResponse = await axios.put(
                    `http://localhost:8800/user/update-password/${userID}`,
                    { newPassword },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (updateResponse.data.success) {
                    setSuccessMessage("Password updated successfully!");
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                } else {
                    setError("Failed to update password");
                }
            } else {
                setError("Current password is incorrect");
            }
        } catch (err) {
            setError('An error occurred while resetting the password');
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await axios.delete(`http://localhost:8800/user/remove/${userID}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            alert('Account deleted successfully');
            localStorage.clear();
            navigate('/login');
        } catch (error) {
            setError('Error deleting account');
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
                <h3>Profile Picture</h3>
                {profileImage ? (
                    <div>
                        <img
                            src={`http://localhost:8800/${profileImage}`} // Display the uploaded image
                            alt="Profile"
                            width="150"
                            height="150"
                        />
                    </div>
                ) : (
                    <p>No profile picture available</p>
                )}
            </div>
            <div>
                <h3>Change Username</h3>
                <input
                    type="text"
                    placeholder="Enter new username"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                />
                <button onClick={handleChangeName}>Update Username</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
            </div>
            <div>
                <h3>Update Profile Picture</h3>
                <input type="file" onChange={handleImageChange} />
                {imagePreview && <img src={imagePreview} alt="Image Preview" width="100" />}
                <button onClick={handleImageUpload}>Upload Profile Picture</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
            </div>
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
            <button>
                <Link to={role === 'admin' ? '/products' : '/home'}>Back</Link>
            </button>
        </div>
    );
};

export default User;
