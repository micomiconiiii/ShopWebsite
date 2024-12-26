import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const User = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Retrieve the userID from localStorage
    const userID = localStorage.getItem('userID'); 
    const token = localStorage.getItem('token');
    useEffect(() => {
        // If there's no userID in localStorage, navigate to login page
        if (!userID) {
            navigate('/login');
            return;
        }

        const token = localStorage.getItem('token'); // Get the token from localStorage

        // If no token is found, redirect to the login page
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchUserData = async () => {
            try {
                setLoading(true);  // Set loading state
                const res = await axios.get(`http://localhost:8800/user/${userID}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,  // Add the token in the Authorization header
                    },
                });

                setUserName(res.data.name);  // Set the user name after fetching data
                setLoading(false);  // Stop loading
            } catch (err) {
                console.error('Error fetching user data:', err);
                setLoading(false);
                setError('Failed to fetch user data');
            }
        };

        fetchUserData();
    }, [userID, navigate]);

    // Handle logout
    const handleLogout = () => {
        localStorage.clear();  // Clear localStorage
        navigate('/login');  // Redirect to login page
    };

    const handleDeleteAccount = async () => {
        try {
          // Retrieve the token from localStorage
          const token = localStorage.getItem('token');
      
          // Ensure token exists
          if (!token) {
            console.error('Token not found');
            return;
          }
      
          // Retrieve the userID from localStorage
          const userID = localStorage.getItem('userID');
      
          // Ensure userID exists
          if (!userID) {
            console.error('User ID not found');
            return;
          }
          
          // Send DELETE request with userID in the URL and token in the headers
          await axios.delete(`http://localhost:8800/user/remove/${userID}`, {
            headers: {
              Authorization: `Bearer ${token}`,  // Add token to the headers
            },
          });
      
          alert('Account deleted successfully');
          localStorage.clear();  // Clear localStorage
          navigate('/login');  // Redirect to login page
    
        } catch (error) {
          console.error('Error deleting account', error);
          if (error.response) {
            // Log the error response for more details
            console.error('Error response:', error.response.data);
          }
        }
      };
      

    // Show loading message if still loading
    if (loading) {
        return <div>Loading...</div>;
    }

    // Show error message if fetching user data fails
    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h1>Welcome, {userName || 'Unknown User'}</h1>
            <h2>Name: {userName}</h2>
            <h2>User ID: {userID}</h2>

            <button onClick={handleLogout}>Log Out</button>
            <button onClick={handleDeleteAccount} style={{ backgroundColor: 'red', color: 'white' }}>
                Delete Account
            </button>
        </div>
    );
};

export default User;
