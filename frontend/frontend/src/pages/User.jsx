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
        <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            {/* Welcome Card */}
            <div className="card mb-4 shadow-sm">
              <div className="card-body text-center">
                <h1 className="card-title">Welcome, {userName}</h1>
                </div>
            </div>
    
            {/* Profile Picture Card */}
            <div className="card mb-4 shadow-sm">
              <div className="card-body text-center">
                <h3 className="card-title">Profile Picture</h3>
                {profileImage ? (
                  <img
                    src={`http://localhost:8800/${profileImage}`}
                    alt="Profile"
                    className="rounded-circle mb-3"
                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                  />
                ) : (
                  <p>No profile picture available</p>
                )}
                <h3 className="card-subtitle mb-3">Name: {userName}</h3>
                  <h3 className="card-subtitle">User ID: {userID}</h3>
                
                  <div 
  className="mt-3 d-flex flex-column align-items-center" 
  style={{ textAlign: 'center' }}
>
  <input
    type="file"
    className="form-control mb-2"
    onChange={handleImageChange}
    style={{ width: '50%' }} /* Adjust width as needed */
  />
  {imagePreview && (
    <img
      src={imagePreview}
      alt="Image Preview"
      style={{ height: '300px', width: '300px', marginBottom: '15px' }}
    />
  )}
  <button 
    className="btn btn-primary mt-2"
    onClick={handleImageUpload}
  >
    Upload Profile Picture
  </button>
</div>
  </div>
            </div>
    
            {/* Change Username Card */}
            <div className="card mb-4 shadow-sm">
              <div className="card-body">
                <h3 className="card-title">Change Username</h3>
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Enter new username"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                />
                <button className="btn btn-success" onClick={handleChangeName}>
                  Update Username
                </button>
                {error && <p className="text-danger mt-2">{error}</p>}
                {successMessage && <p className="text-success mt-2">{successMessage}</p>}
              </div>
            </div>
    
            {/* Reset Password Card */}
            <div className="card mb-4 shadow-sm">
              <div className="card-body">
                <h3 className="card-title">Reset Password</h3>
                <input
                  type="password"
                  className="form-control mb-2"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <input
                  type="password"
                  className="form-control mb-2"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <input
                  type="password"
                  className="form-control mb-2"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button className="btn btn-warning" onClick={handleResetPassword}>
                  Reset Password
                </button>
                {error && <p className="text-danger mt-2">{error}</p>}
                {successMessage && <p className="text-success mt-2">{successMessage}</p>}
              </div>
            </div>
 {/* Action Buttons */}
<div className="d-flex flex-column align-items-center gap-2">
  <Link 
    to={role === 'admin' ? '/products' : '/home'} 
    className="btn btn-primary w-100" 
    style={{ maxWidth: '300px' }}
  >
    Back
  </Link>
  <button 
    className="btn btn-danger w-100" 
    onClick={handleDeleteAccount} 
    style={{ maxWidth: '300px' }}
  >
    Delete Account
  </button>
  <button 
    className="btn btn-secondary w-100" 
    onClick={handleLogout} 
    style={{ maxWidth: '300px' }}
  >
    Log Out
  </button>
</div>

          </div>
        </div>
      </div>    );
};

export default User;
