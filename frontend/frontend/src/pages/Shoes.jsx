  import React, { useEffect, useState } from 'react';
  import axios from 'axios';
  import { Link, useNavigate } from "react-router-dom";

  const Shoes = () => {
    const [shoes, setShoes] = useState([]);
    const [sortOption, setSortOption] = useState('price'); // Default sorting by price
    const [searchQuery, setSearchQuery] = useState(''); // State for search query
    const [sortedShoes, setSortedShoes] = useState([]); // Store sorted shoes here
    const [userName] = useState(localStorage.getItem('name') || '');
    const navigate = useNavigate(); // For navigating to other pages
      
    // Fetch all shoes data
    useEffect(() => {
      const fetchAllShoes = async () => {
        try {
          const res = await axios.get("http://localhost:8800/shoes");
          setShoes(res.data); // Set the shoes data after fetching
        } catch (err) {
          console.log(err);
        }
      };
      fetchAllShoes();
    }, []); // Empty dependency array to run once on component mount

    // Apply sorting logic when shoes or sortOption changes
    useEffect(() => {
      let filteredShoes = [...shoes]; // Create a shallow copy to avoid mutation

      // Apply filtering for out-of-stock shoes based on selected sortOption
      if (sortOption === '0stock') {
        filteredShoes = filteredShoes.filter(shoe => shoe.stock === 0); // Only out of stock shoes
      }

      // Apply sorting based on selected option
      if (sortOption === 'lprice') {
        filteredShoes.sort((a, b) => a.price - b.price); // Sort by price (ascending)
      } else if (sortOption === 'hprice') {
        filteredShoes.sort((a, b) => b.price - a.price); // Sort by price (descending)
      } else if (sortOption === 'stock') {
        filteredShoes.sort((a, b) => b.stock - a.stock); // Sort by stock (descending)
      } else if (sortOption === 'price and stock') {
        filteredShoes.sort((a, b) => {
          if (a.stock === 0 && b.stock === 0) {
            return b.price - a.price; // If both are out of stock, sort by price (descending)
          } else if (a.stock === 0) {
            return 1; // Out of stock comes last
          } else if (b.stock === 0) {
            return -1; // Out of stock comes last
          }
          return a.price - b.price; // If both have stock, sort by price (ascending)
        });
      }

      setSortedShoes(filteredShoes); // Update sorted shoes
    }, [shoes, sortOption]); // Only re-sort when shoes or sortOption changes

    // Filter shoes based on the search query
    const filteredShoes = sortedShoes.filter(shoe => 
      shoe.prod_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      shoe.prod_description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    

    // Delete a shoe
    const handleDelete = async (id) => {
      try {
        // Send DELETE request to remove the product
        await axios.delete(`http://localhost:8800/shoes/${id}`);
        
        // Re-fetch the updated shoes data after deletion
        const res = await axios.get("http://localhost:8800/shoes");
        setShoes(res.data); // Update the state with the newly fetched shoe list
      } catch (err) {
        console.error("Error deleting shoe:", err);
      }
    };
    const handleLogout = () => {
      localStorage.clear();
      navigate('/login'); // Redirect to login page
    };
  
    return (
      <div>
        <h1>MARKETPLACE</h1>
        <p>Welcome, {userName || "Guest"}!</p>
        {/* Sorting options */}
        <div>
          <label htmlFor="sortOption">Sort by: </label>
          <select
            id="sortOption"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="select">Select</option>
            <option value="lprice">Lowest Price</option>
            <option value="hprice">Highest Price</option>
            <option value="stock">Available Stock</option>
            <option value="0stock">Out of Stock</option>
            <option value="price and stock">Price and Stock</option>
          </select>
        </div>

        {/* Search Input */}
        <div>
          <label htmlFor="searchQuery">Search: </label>
          <input
            id="searchQuery"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or description"
          />
        </div>

        {/* Warning for low stock */}
        {shoes.some((shoe) => shoe.stock > 0 && shoe.stock <= 5) && (
          <p style={{ color: 'red', fontWeight: 'bold' }}>
            Warning: Some products have low stocks!
          </p>
        )}

        <div className='shoes'>
          {filteredShoes.map((shoe) => (
            <div
              className='shoe'
              key={shoe.id}
              style={{
                backgroundColor: shoe.stock === 0 ? '#d3d3d3' : 'white',
                opacity: shoe.stock === 0 ? 0.6 : 1,
              }}
            >
              {shoe.image && <img src={shoe.image} alt="" style={{ opacity: shoe.stock === 0 ? 0.6 : 1 }} />}

              <h2>{shoe.prod_name}</h2>
              <p>{shoe.prod_description}</p>
              <span>Price: {shoe.price}</span>

              <span style={{ color: shoe.stock < 10 ? 'red' : 'black' }}>
                Stock: {shoe.stock}
              </span>

              {shoe.stock === 0 && (
                <p style={{ color: 'gray', fontWeight: 'bold' }}>Out of Stock</p>
              )}

              <button className='delete' onClick={() => handleDelete(shoe.id)}>
                Delete
              </button>
              <button className='update'>
                <Link to={`/update/${shoe.id}`}>Update</Link>
              </button>
            </div>
          ))}
        </div>

        <button>
          <Link to="/add">Add new Shoes</Link>
        </button>
        <button>
          <Link to="/orderdashboard">View Order Dashboard</Link>
        </button>
        <button>
          <Link to="/showusers">View Users</Link>
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
 </div>
    );
  };

  export default Shoes;
