import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Products = () => {
  const navigate = useNavigate(); // For navigating to other pages
  const [products, setproducts] = useState([]);
  const [sortOption, setSortOption] = useState('price');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortedproducts, setSortedproducts] = useState([]);
  const [userName, setUserName] = useState(localStorage.getItem('name') || '');
  const userId = localStorage.getItem('userID'); // Retrieve userID from localStorage
  const [rating, setAverageRatings] = useState([]);
   
  // Fetch all products data
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const res = await axios.get('http://localhost:8800/products');
        setproducts(res.data);
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };
    fetchAllProducts();
  }, []);
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

  
  // Sort products based on the selected option
  useEffect(() => {
    let filteredproducts = [...products];

    if (sortOption === '0stock') {
      filteredproducts = filteredproducts.filter((product) => product.stock === 0);
    } else if (sortOption === 'lprice') {
      filteredproducts.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'hprice') {
      filteredproducts.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'stock') {
      filteredproducts.sort((a, b) => b.stock - a.stock);
    } else if (sortOption === 'price and stock') {
      filteredproducts.sort((a, b) => {
        if (a.stock === 0 && b.stock === 0) return b.price - a.price;
        if (a.stock === 0) return 1;
        if (b.stock === 0) return -1;
        return a.price - b.price;
      });
    }

    setSortedproducts(filteredproducts);
  }, [products, sortOption]);

  // Filter products based on search query
  const filteredproducts = sortedproducts.filter((product) =>
    product.prod_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.prod_description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add item to cart
  const addItemToCart = async (productId) => {
    try {
      if (!userId) {
        alert('User not logged in');
        console.log('User must log in first');
        
        return;
      }      // Fetch the product details (including the price) based on productId
      const response = await axios.get(`http://localhost:8800/products/${productId}`);
      const product = response.data;

      if (!product || !product.price) {
          console.error('product data is invalid or missing price');
          return;
      }
      await axios.post('http://localhost:8800/cart/add', {
        userId,
        productId,
        quantity: 1, // Default quantity to 1
        cost: product.price
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
          <option value="select">Select</option>
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

      {products.some((product) => product.stock > 0 && product.stock <= 5) && (
        <p style={{ color: 'red', fontWeight: 'bold' }}>
          Warning: Some products have low stocks!
        </p>
      )}

      <div className="products">
        {filteredproducts.map((product) => (
          <div
            className="product"
            key={product.id}
            style={{
              backgroundColor: product.stock === 0 ? '#d3d3d3' : 'white',
              opacity: product.stock === 0 ? 0.6 : 1,
            }}
          >
            {product.image && <img src={product.image} alt={product.prod_name} />}
            <h2>{product.prod_name}</h2>
            <p>{product.prod_description}</p>
            <span>Price: ${product.price}</span>
            <span style={{ color: product.stock < 10 ? 'red' : 'black' }}>
              Stock: {product.stock}
            </span>
            <p>Rating: {rating[product.id] === 0 ? "No ratings yet" : rating[product.id]?.toFixed(2)}</p>
          <div>
              <button onClick={() => addItemToCart(product.id)}>Add to Cart</button>
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
      <button type="button"><Link to ="/orders">View Order Status</Link></button>
      </div>
  );
};

export default Products;
