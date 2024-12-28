import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Shoes = () => {
  const navigate = useNavigate(); // For navigating to other pages
  const [shoes, setShoes] = useState([]);
  const [sortOption, setSortOption] = useState('price');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortedShoes, setSortedShoes] = useState([]);
  const [userName, setUserName] = useState(localStorage.getItem('name') || '');
  const userId = localStorage.getItem('userID'); // Retrieve userID from localStorage

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

  // Fetch user data based on userID from localStorage
  
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
        alert('User not logged in');
        console.log('User must log in first');
        
        return;
      }      // Fetch the shoe details (including the price) based on shoeId
      const response = await axios.get(`http://localhost:8800/shoes/${shoeId}`);
      const shoe = response.data;

      if (!shoe || !shoe.price) {
          console.error('Shoe data is invalid or missing price');
          return;
      }
      await axios.post('http://localhost:8800/cart/add', {
        userId,
        shoeId,
        quantity: 1, // Default quantity to 1
        cost: shoe.price
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

  // Go to the user page

const goToUserPage = () => {
  const userID = localStorage.getItem('userID'); // Retrieve userID from localStorage
  const token = localStorage.getItem('token'); // Retrieve token from localStorage

  // Check if userID and token exist in localStorage
  if (userID && token) {
    navigate('/user'); // Navigate to user page 
  } else {
    navigate('/login'); // If not authenticated, go to login page
  }
};

  return (
    <div>
      <h1>Home</h1>
      <p>Welcome, {userName || "Guest"}!</p>

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
      {!userName ? (
              <button>
              <Link to="/login">Log in</Link>
              </button>
              ) : (
              
              <button onClick={handleLogout}>
              Log out
              </button>
        )}
      <button onClick={goToUserPage}>Go to User Page</button>
    </div>
  );
};

export default Shoes;
