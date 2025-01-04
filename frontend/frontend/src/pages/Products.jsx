import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from "react-router-dom";
import '../products.css';
import AddUser from './Register';
const Products = () => {
  const [products, setProducts] = useState([]);
  const [sortOption, setSortOption] = useState('price');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortedProducts, setSortedProducts] = useState([]);
  const [userName] = useState(localStorage.getItem('name') || '');
  const navigate = useNavigate();
  const [rating, setAverageRatings] = useState([]);

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const res = await axios.get("http://localhost:8800/products");
        setProducts(res.data);
      } catch (err) {
        console.log(err);
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

  useEffect(() => {
    let filteredProducts = [...products];
    if (sortOption === '0stock') {
      filteredProducts = filteredProducts.filter(product => product.stock === 0);
    }
    if (sortOption === 'lprice') {
      filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'hprice') {
      filteredProducts.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'stock') {
      filteredProducts.sort((a, b) => b.stock - a.stock);
    } else if (sortOption === 'price and stock') {
      filteredProducts.sort((a, b) => {
        if (a.stock === 0 && b.stock === 0) {
          return b.price - a.price;
        } else if (a.stock === 0) {
          return 1;
        } else if (b.stock === 0) {
          return -1;
        }
        return a.price - b.price;
      });
    }
    setSortedProducts(filteredProducts);
  }, [products, sortOption]);

  const filteredProducts = sortedProducts.filter(product =>
    product.prod_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.prod_description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8800/products/${id}`);
      const res = await axios.get("http://localhost:8800/products");
      setProducts(res.data);
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const addUser = () => {
    navigate('/register');
  };
  return (
    <div className="products-container">
      <header>
        <h1>MARKETPLACE</h1>
        <p>Welcome, {userName || "Guest"}!</p>
      </header>

      <div className="filters">
        <div className="sort-options">
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

        <div className="search-input">
          <label htmlFor="searchQuery">Search:</label>
          <input
            id="searchQuery"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or description"
          />
        </div>
      </div>

      {products.some((product) => product.stock > 0 && product.stock <= 5) && (
        <p className="low-stock-warning">
          Warning: Some products have low stocks!
        </p>
      )}

      <div className="products-grid">
        {filteredProducts.map((product) => (
          <div className="product-card" key={product.id}>
            <img src={product.image} alt={product.prod_name} />
            <div className="product-details">
              <h3>{product.prod_name}</h3>
              <p>{product.prod_description}</p>
              <span className="price">${product.price}</span>
              <p className="rating">Rating: {rating[product.id] === 0 ? "No ratings yet" : rating[product.id]?.toFixed(2)}</p>
              <span className={`stock-status ${product.stock < 10 ? 'low' : ''}`}>Stock: {product.stock}</span>

              {product.stock === 0 && (
                <p className="out-of-stock">Out of Stock</p>
              )}
            </div>
            <div className="product-actions">
              <button className="delete-btn" onClick={() => handleDelete(product.id)}>Delete</button>
              <button className="update-btn">
                <Link to={`/update/${product.id}`}>Update</Link>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-actions">
        <button className="add-btn">
          <Link to="/add">Add new products</Link>
        </button>
        <button className="order-dashboard-btn">
          <Link to="/orderdashboard">View Order Dashboard</Link>
        </button>
        <button className="view-users-btn">
          <Link to="/showusers">View Users</Link>
        </button>
        <button className="add-btn" onClick={addUser}>
          Add New User
        </button>
        

        {!userName ? (
          <button className="login-btn">
            <Link to="/login">Log in</Link>
          </button>
        ) : (
          <button className="logout-btn" onClick={handleLogout}>Log out</button>
        )}
      </div>
    </div>
  );
};

export default Products;
