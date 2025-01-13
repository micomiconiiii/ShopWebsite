import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {Link, useNavigate} from 'react-router-dom';
import '../user.css';
const AdminUser = () => {
    const navigate = useNavigate(); // For navigating to other pages
    const [user, setUser] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
       
    useEffect(()=>{
        const fetchAllUsers = async () =>{
        try{
        const res = await axios.get('http://localhost:8800/showusers/');
        setUser(res.data);
        } catch (error){
            console.error('Error fetching users: ', error);
        }
    }; fetchAllUsers();
    },[]);

    const filteredUsers = user.filter((user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
      // Handle logout
    const handleLogout = () => {
    localStorage.clear();
    navigate('/login'); // Redirect to login page
  };
  const handleDelete = async (userID, name) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user's account?");

    if (confirmDelete) {
        try {
            await axios.delete(`http://localhost:8800/user/remove/${userID}`);
            setUser(user.filter(user => user.userID !== userID));
            alert(name + "'s Account has been successfully deleted");
        } catch (error) {
            console.error('Error Deleting Order', error);
        }
    } else {
        console.log('Order deletion canceled');
    }
};

  return (
    <div className="admin-container mt-5 mb-5">
    <h1 className="admin-title">List of Users</h1>

    <div className="admin-search">
        <label htmlFor="searchQuery">Search:</label>
        <input
            id="searchQuery"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or role"
        />
    </div>

    <div className="user-grid">
        {filteredUsers.map((user) => (
            <div key={user.userID} className="user-card">
                <h2 className="user-name">{user.name}</h2>
                <p><strong>User ID:</strong> {user.userID}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
                <button
                    onClick={() => handleDelete(user.userID, user.name)}
                    className="delete-button"
                >
                    Delete Account
                </button>
            </div>
        ))}
    </div>

    <div className="admin-actions">
        <button className="action-button">
            <Link to="/products">Back</Link>
        </button>
        <button className="action-button" onClick={handleLogout}>
            Log Out
        </button>
    </div>
</div>
);
}
export default AdminUser;