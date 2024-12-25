import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams, useNavigate } from 'react-router-dom';

const Shoes = () => {
  const { userID } = useParams(); // Retrieve userID from the URL
  const navigate = useNavigate(); // For navigating to other pages
  const [shoes, setShoes] = useState([]);
  const [sortOption, setSortOption] = useState('price');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortedShoes, setSortedShoes] = useState([]);
  const [userName, setUserName] = useState(localStorage.getItem('name') || '');
  const userId = localStorage.getItem('userID'); // Ensure userId is available

  // Fetch all shoes data
  useEffect(() => {
    const fetchAllShoes = async () => {
      try {
        const res = await axios.get('http://localhost:8800/shoes');
        setShoes(res.data);
      } catch (err) {
        console.error('Error fetching shoes:', err);
      }
    };
    fetchAllShoes();
  }, []);

  // Fetch user data based on userID
  useEffect(() => {
    if (userID) {
      const token = localStorage.getItem('token'); // Get the token from localStorage
      
      const fetchUserData = async () => {
        try {
          const res = await axios.get(`http://localhost:8800/home/${userID}`, {
            headers: {
              Authorization: `Bearer ${token}`, // Add the token in the Authorization header
            },
            
          });
          setUserName(res.data.name);
          
        } catch (err) {
          console.error('Error fetching user data:', err);
          if (err.response) {
            // This is the response from the server, contains status and data
            console.error('Response error status:', err.response.status);
            console.error('Response error data:', err.response.data);
          } else if (err.request) {
            // The request was made, but no response was received
            console.error('Request error:', err.request);
          } else {
            // Some error occurred setting up the request
            console.error('Error message:', err.message);
          }
        }
      };
      fetchUserData();
    }
  }, [userID]);

  // Sort shoes based on the selected option
  useEffect(() => {
    let filteredShoes = [...shoes];

    if (sortOption === '0stock') {
      filteredShoes = filteredShoes.filter((shoe) => shoe.stock === 0);
    } else if (sortOption === 'lprice') {
      filteredShoes.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'hprice') {
      filteredShoes.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'stock') {
      filteredShoes.sort((a, b) => b.stock - a.stock);
    } else if (sortOption === 'price and stock') {
      filteredShoes.sort((a, b) => {
        if (a.stock === 0 && b.stock === 0) return b.price - a.price;
        if (a.stock === 0) return 1;
        if (b.stock === 0) return -1;
        return a.price - b.price;
      });
    }

    setSortedShoes(filteredShoes);
  }, [shoes, sortOption]);

  // Filter shoes based on search query
  const filteredShoes = sortedShoes.filter((shoe) =>
    shoe.prod_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shoe.prod_description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add item to cart
  const addItemToCart = async (shoeId) => {
    try {
      if (!userId) {
        console.error('User not logged in');
        return;
      }
      await axios.post('http://localhost:8800/cart/add', {
        userId,
        shoeId,
        quantity: 1, // Default quantity to 1
      });
      alert('Item added to cart!');
    } catch (error) {
      console.error('Error adding item to cart:', error);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login'); // Redirect to login page
  };

  return (
    <div>
      <h1>Home</h1>
      <p>Welcome, {userName}!</p>

      <div>
        <label htmlFor="sortOption">Sort by:</label>
        <select
          id="sortOption"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="lprice">Lowest Price</option>
          <option value="hprice">Highest Price</option>
          <option value="stock">Available Stock</option>
          <option value="0stock">Out of Stock</option>
          <option value="price and stock">Price and Stock</option>
        </select>
      </div>

      <div>
        <label htmlFor="searchQuery">Search:</label>
        <input
          id="searchQuery"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or description"
        />
      </div>

      {shoes.some((shoe) => shoe.stock > 0 && shoe.stock <= 5) && (
        <p style={{ color: 'red', fontWeight: 'bold' }}>
          Warning: Some products have low stocks!
        </p>
      )}

      <div className="shoes">
        {filteredShoes.map((shoe) => (
          <div
            className="shoe"
            key={shoe.id}
            style={{
              backgroundColor: shoe.stock === 0 ? '#d3d3d3' : 'white',
              opacity: shoe.stock === 0 ? 0.6 : 1,
            }}
          >
            {shoe.image && <img src={shoe.image} alt={shoe.prod_name} />}
            <h2>{shoe.prod_name}</h2>
            <p>{shoe.prod_description}</p>
            <span>Price: ${shoe.price}</span>
            <span style={{ color: shoe.stock < 10 ? 'red' : 'black' }}>
              Stock: {shoe.stock}
            </span>
            <div>
              <button onClick={() => addItemToCart(shoe.id)}>Add to Cart</button>
            </div>
          </div>
        ))}
      </div>

      <button>
        <Link to="/cart">Show Cart</Link>
      </button>
      <button onClick={handleLogout}>Log Out</button>
    </div>
  );
};

export default Shoes;
