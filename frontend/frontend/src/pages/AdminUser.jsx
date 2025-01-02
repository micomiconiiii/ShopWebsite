import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {Link, useNavigate} from 'react-router-dom';

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
    <div>
        <h1>List of Users on your Site</h1>
    
      {filteredUsers.map((user) => (
         <div key={user.userID}>
            <h2>{user.name}</h2>
            <p>{user.userID}</p>
            <p>{user.email}</p>
            <p>{user.role}</p>

            <button onClick={() => handleDelete(user.userID, user.name)} className="cancel-button">
                                Delete Account
            </button>
                            

         </div>
      )
     
        )

      }
          <div>
        <label htmlFor="searchQuery">Search:</label>
        <input
          id="searchQuery"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or role"
        />
      </div>
      <div>
        <button>
            <Link to="/shoes">Back</Link>
        </button>
        <button onClick={handleLogout}>
            Log out
        </button>
      </div>
    </div>
  );
}
export default AdminUser;