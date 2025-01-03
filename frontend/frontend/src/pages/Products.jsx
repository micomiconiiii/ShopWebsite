  import React, { useEffect, useState } from 'react';
  import axios from 'axios';
  import { Link, useNavigate } from "react-router-dom";

  const Products = () => {
    const [products, setProducts] = useState([]);
    const [sortOption, setSortOption] = useState('price'); // Default sorting by price
    const [searchQuery, setSearchQuery] = useState(''); // State for search query
    const [sortedproducts, setSortedproducts] = useState([]); // Store sorted products here
    const [userName] = useState(localStorage.getItem('name') || '');
    const navigate = useNavigate(); // For navigating to other pages
    const [rating, setAverageRatings] = useState([]);
    // Fetch all products data
    useEffect(() => {
      const fetchAllProducts = async () => {
        try {
          const res = await axios.get("http://localhost:8800/products");
          setProducts(res.data); // Set the products data after fetching
        } catch (err) {
          console.log(err);
        }
      };
      fetchAllProducts();
    }, []); // Empty dependency array to run once on component mount
    useEffect(() => {
      const fetchAverageRatings = async () => {
          const ratings = {};
  
          try {
              const requests = products.map(product =>
                  axios.get(`http://localhost:8800/reviews/average/${product.id}`)
              );
  
              const responses = await Promise.allSettled(requests);
  
              responses.forEach((response, index) => {
                  const productId = products[index].id;
                  if (response.status === 'fulfilled') {
                      ratings[productId] = response.value.data?.averageRating ?? 0;
      
                    } else {
                      console.log(`Error fetching average rating for product ID ${productId}:`, response.reason);
                      ratings[productId] = 0;
                  }
              });
  
              setAverageRatings(ratings);
          } catch (err) {
              console.error('Error fetching average ratings:', err);
          }
      };
  
      if (products.length > 0) {
          fetchAverageRatings();
      }
  }, [products]);
  
    // Apply sorting logic when products or sortOption changes
    useEffect(() => {
      let filteredproducts = [...products]; // Create a shallow copy to avoid mutation

      // Apply filtering for out-of-stock products based on selected sortOption
      if (sortOption === '0stock') {
        filteredproducts = filteredproducts.filter(product => product.stock === 0); // Only out of stock products
      }

      // Apply sorting based on selected option
      if (sortOption === 'lprice') {
        filteredproducts.sort((a, b) => a.price - b.price); // Sort by price (ascending)
      } else if (sortOption === 'hprice') {
        filteredproducts.sort((a, b) => b.price - a.price); // Sort by price (descending)
      } else if (sortOption === 'stock') {
        filteredproducts.sort((a, b) => b.stock - a.stock); // Sort by stock (descending)
      } else if (sortOption === 'price and stock') {
        filteredproducts.sort((a, b) => {
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

      setSortedproducts(filteredproducts); // Update sorted products
    }, [products, sortOption]); // Only re-sort when products or sortOption changes

    // Filter products based on the search query
    const filteredproducts = sortedproducts.filter(product => 
      product.prod_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      product.prod_description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    

    // Delete a product
    const handleDelete = async (id) => {
      try {
        // Send DELETE request to remove the product
        await axios.delete(`http://localhost:8800/products/${id}`);
        
        // Re-fetch the updated products data after deletion
        const res = await axios.get("http://localhost:8800/products");
        setProducts(res.data); // Update the state with the newly fetched product list
      } catch (err) {
        console.error("Error deleting product:", err);
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
        {products.some((product) => product.stock > 0 && product.stock <= 5) && (
          <p style={{ color: 'red', fontWeight: 'bold' }}>
            Warning: Some products have low stocks!
          </p>
        )}

        <div className='products'>
          {filteredproducts.map((product) => (
            <div
              className='product'
              key={product.id}
              style={{
                backgroundColor: product.stock === 0 ? '#d3d3d3' : 'white',
                opacity: product.stock === 0 ? 0.6 : 1,
              }}
            >
              {product.image && <img src={product.image} alt="" style={{ opacity: product.stock === 0 ? 0.6 : 1 }} />}

              <h2>{product.prod_name}</h2>
              <p>{product.prod_description}</p>
              <span>Price: {product.price}</span>
              <p>Rating: {rating[product.id] === 0 ? "No ratings yet" : rating[product.id]?.toFixed(2)}</p>

              <span style={{ color: product.stock < 10 ? 'red' : 'black' }}>
                Stock: {product.stock}
              </span>

              {product.stock === 0 && (
                <p style={{ color: 'gray', fontWeight: 'bold' }}>Out of Stock</p>
              )}

              <button className='delete' onClick={() => handleDelete(product.id)}>
                Delete
              </button>
              <button className='update'>
                <Link to={`/update/${product.id}`}>Update</Link>
              </button>
            </div>
          ))}
        </div>

        <button>
          <Link to="/add">Add new products</Link>
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

  export default Products;
