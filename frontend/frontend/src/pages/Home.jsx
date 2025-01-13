import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import "../Home.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Carousel } from 'react-bootstrap'; // Import Carousel

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [sortOption, setSortOption] = useState('price');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortedProducts, setSortedProducts] = useState([]);
  const [userName, setUserName] = useState(localStorage.getItem('name') || '');
  const userId = localStorage.getItem('userID');
  const [rating, setAverageRatings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [tags, setTags] = useState([]);
  const [uniqueTags, setUniqueTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const res = await axios.get('http://localhost:8800/products');
        setProducts(res.data);
        const uniqueCategories = [...new Set(res.data.map(product => product.category))];
        setCategories(uniqueCategories);
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };
    fetchAllProducts();
  }, []);

  useEffect(() => {
    const fetchProductTags = async () => {
      try {
        const res = await axios.get('http://localhost:8800/product_tags');
        const tagMap = {};
        res.data.forEach((tag) => {
          if (!tagMap[tag.product_id]) {
            tagMap[tag.product_id] = [];
          }
          tagMap[tag.product_id].push(tag.tag_name);
        });
        setTags(tagMap);
        const allTags = res.data.map((tag) => tag.tag_name);
        setUniqueTags([...new Set(allTags)]);
      } catch (err) {
        console.error('Error fetching product tags:', err);
      }
    };
    fetchProductTags();
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
      filteredProducts = filteredProducts.filter((product) => product.stock === 0);
    } else if (sortOption === 'lprice') {
      filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'hprice') {
      filteredProducts.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'stock') {
      filteredProducts.sort((a, b) => b.stock - a.stock);
    } else if (sortOption === 'price and stock') {
      filteredProducts.sort((a, b) => {
        if (a.stock === 0 && b.stock === 0) return b.price - a.price;
        if (a.stock === 0) return 1;
        if (b.stock === 0) return -1;
        return a.price - b.price;
      });
    }

    if (selectedCategory) {
      filteredProducts = filteredProducts.filter(product => product.category === selectedCategory);
    }
    if (selectedTag) {
      filteredProducts = filteredProducts.filter((product) =>
        tags[product.id]?.includes(selectedTag)
      );
    }

    setSortedProducts(filteredProducts);
  }, [products, sortOption, selectedCategory, selectedTag]);

  const filteredProducts = sortedProducts.filter((product) =>
    product.prod_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.prod_description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addItemToCart = async (productId) => {
    console.log("product id: ", productId);
    try {
      if (!userId) {
        alert('User not logged in');
        return;
      }
      const response = await axios.get(`http://localhost:8800/products/${productId}`);
      const product = response.data;
      console.log(product.data);
      if (!product || !product.price) {
        console.error('Product data is invalid or missing price');
        return;
      }

      await axios.post('http://localhost:8800/cart/add', {
        userId,
        productId,
        quantity: 1,
        cost: product.price
      });
      alert('Item added to cart!');
    } catch (error) {
      console.error('Error adding item to cart:', error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const goToUserPage = () => {
    const userID = localStorage.getItem('userID');
    const token = localStorage.getItem('token');
    if (userID && token) {
      navigate('/user');
    } else {
      navigate('/login');
    }
  };
  const carouselItems = [
    {
      id: 1,
      image: '/images/product1.jpg'
    },
    {
      id: 2,
      image: '/images/product2.jpg'
    },
    {
      id: 3,
      image: '/images/product3.jpg'
    },
    {
      id: 4,
      image: '/images/product4.jpg'
    },
    {
      id: 5,
      image: '/images/product5.jpg'}
  ];
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);


  return (
<div>
{/* Carousel */}
<div className="carousel-container position-relative">
  {/* Overlay Content */}
  <div className="overlay-content d-flex flex-column justify-content-center align-items-center">
    {/* Navbar */}
    <nav className={`navbar navbar-expand-lg navbar-light ${scrolled ? 'scrolled' : ''}`}>
      <div className="container-fluid">
        <div className="logo">
          <img src="/HAUTE.png" alt="Logo" className="logo-img" />
        </div>
        <button
          className="navbar-toggler text-white"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
          style={{ border: 'none' }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
          {!userName ? (
          // Display if no user is logged in
          <>
            <li className="nav-item">
              <Link to="/home" className="nav-link text-white">Browse</Link>
            </li>
            <li className="nav-item">
              <Link to="/login" className="nav-link text-white">Log In</Link>
            </li>
            <li className="nav-item">
              <Link to="/register" className="nav-link text-white">Sign Up</Link>
            </li>
          </>
        ) : (
          // Display if a user is logged in
          <>
            <li className="nav-item">
              <Link to="/cart" className="nav-link text-white">Cart</Link>
            </li>
            <li className="nav-item">
              <Link to="/orders" className="nav-link text-white">Orders</Link>
            </li>
            <li className="nav-item">
              <Link to="/user" className="nav-link text-white">Profile</Link>
            </li>
            
          </>
        )}
          </ul>
        </div>
      </div>
    </nav>

    <h1
      className="overlay-heading text-white text-center fw-bold"
      style={{ margin: '150px 0 0 0' }}
    >
      Welcome, {userName || "Guest"}!
    </h1>
  </div>

  <Carousel>
    {carouselItems.map((item) => (
      <Carousel.Item key={item.id}>
        <img
          className="d-block w-100 carousel-img"
          src={item.image || '/placeholder.jpg'}
          alt={item.prod_name}
          style={{ objectFit: 'cover' }}
        />
        <Carousel.Caption>
          <h3>{item.prod_name}</h3>
          <p>{item.prod_description}</p>
        </Carousel.Caption>
      </Carousel.Item>
    ))}
  </Carousel>
</div>

  <div className="container mt-4">
  <h1>Home</h1>
  
  <div className="row mb-3 mt-3">
    <div className="col-md-3">
      <label htmlFor="sortOption">Sort by:</label>
      <select
        id="sortOption"
        className="form-select"
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

    <div className="col-md-3">
      <label htmlFor="searchQuery">Search:</label>
      <input
        id="searchQuery"
        className="form-control"
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search by name or description"
      />
    </div>

    <div className="col-md-3">
      <label htmlFor="categoryFilter">Filter by Category:</label>
      <select
        id="categoryFilter"
        className="form-select"
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
      >
        <option value="">All Categories</option>
        {categories.map((category, index) => (
          <option key={index} value={category}>
            {category}
          </option>
        ))}
      </select>
    </div>

    <div className="col-md-3">
      <label htmlFor="tagFilter">Filter by Tag:</label>
      <select
        id="tagFilter"
        className="form-select"
        value={selectedTag}
        onChange={(e) => setSelectedTag(e.target.value)}
      >
        <option value="">All Tags</option>
        {uniqueTags.map((tag, index) => (
          <option key={index} value={tag}>
            {tag}
          </option>
        ))}
      </select>
    </div>
  </div>

  {/* Low stock warning */}
  {products.some((product) => product.stock > 0 && product.stock <= 5) && (
    <p style={{ color: 'red', fontWeight: 'bold'   }}>
      Warning! Some products will be out of stock soon!
    </p>
  )}

  {/* Product list in row format */}
  <div className="row g-4">
        {filteredProducts.map((product) => (
          <div
            className="col-6 col-md-3"
            key={product.id}
          >
            <div
              className="product-card border p-3 h-100 d-flex flex-column justify-content-between"
              style={{
                backgroundColor: product.stock === 0 ? '#f8d7da' : '#ffffff',
                opacity: product.stock === 0 ? 0.6 : 1,
              }}
            >
              {product.image && (
                <img
                  src={product.image}
                  alt={product.prod_name}
                  className="img-fluid mb-2"
                  style={{ maxHeight: '400px', objectFit: 'cover', position:'center' }}
                />
              )}
              
              {rating[product.id] === 0 ? (
              'No ratings yet'
              ) : (
              <span>
              {'★'.repeat(Math.floor(rating[product.id]))}
              {'☆'.repeat(5 - Math.floor(rating[product.id]))}
              ({rating[product.id]?.toFixed(2)})
              </span>
              )}
              <h5>{product.prod_name}</h5>
              <p>{product.prod_description}</p>
              <p>Price: ${product.price}</p>
              <p style={{ color: product.stock < 10 ? 'red' : 'black' }}>
                Stock: {product.stock}
              </p>
              
              <button className="btn" id="btn" onClick={() => addItemToCart(product.id)}>Add to Cart</button>
            </div>
          </div>
        ))}
      </div>
      <div className="row mt-4 justify-content-center text-center">
  {/* Show Cart Button */}
  <div  className="col-6 col-md-3 mb-3">
    <Link to="/cart" style={{backgroundColor:'#F27405'}} className="btn btn-primary btn-block">
      Show Cart
    </Link>
  </div>

    {/* View Orders Button */}
    <div className="col-6 col-md-3 mb-3">
    <Link to="/orders" style={{backgroundColor:'#F27405'}} className="btn btn-success btn-block">
      View Orders
    </Link>
  </div>
 
  {/* User Page Button */}
  <div className="col-6 col-md-3 mb-3">
    <button className="btn btn-info btn-block" style={{backgroundColor:'#F27405', color:'#f9f8fa'}} onClick={goToUserPage}>
      User Page
    </button>
  </div>

   {/* Log In / Log Out Button */}
   <div className="col-6 col-md-3 mb-3">
    {!userName ? (
      <Link to="/login" className="btn btn-secondary btn-block">
        Log In
      </Link>
    ) : (
      <button className="btn btn-danger btn-block" onClick={handleLogout}>
        Log Out
      </button>
    )}
  </div>

</div>

</div>
</div>

    );
};

export default Products;
