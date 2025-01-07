import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from "react-router-dom";
import '../products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [sortOption, setSortOption] = useState('price');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortedProducts, setSortedProducts] = useState([]);
  const [userName] = useState(localStorage.getItem('name') || '');
  const navigate = useNavigate();
  const [rating, setAverageRatings] = useState([]);
  const [showTagModal, setShowTagModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [tagsInput, setTagsInput] = useState([]);
  const [existingTags, setExistingTags] = useState([]);
  const [newTag, setNewTag] = useState('');  // New state to store the new tag input
 
  useEffect(() => {
    if (!userName) {
      navigate('/login');
    }
  }, [userName, navigate]);
  useEffect(() => {
    const fetchExistingTags = async () => {
      try {
        const response = await axios.get('http://localhost:8800/tags');  // API to fetch tags
        setExistingTags(response.data);  // Store fetched tags in state
      } catch (err) {
        console.error('Error fetching existing tags:', err);
      }
    };

    fetchExistingTags();
  }, []);

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
    const fetchTagsForProducts = async () => {
      try {
        const res = await axios.get("http://localhost:8800/product_tags");
        const productTagsMap = {};
  
        res.data.forEach(({ product_id, tag_name }) => {
          if (!productTagsMap[product_id]) {
            productTagsMap[product_id] = [];
          }
          productTagsMap[product_id].push(tag_name);
        });
  
        setProducts(products.map(product => ({
          ...product,
          tags: productTagsMap[product.id] || []
        })));
      } catch (err) {
        console.error(err);
      }
    };
  
    if (products.length > 0) fetchTagsForProducts();
  }, [products]);
  
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

 
const handleAddTags = async () => {
  if (!currentProduct || tagsInput.length === 0) return;

  try {
    // Iterate through the selected tag IDs (which are stored in tagsInput)
    for (let tagId of tagsInput) {
      // Associate the product with the tag ID in the 'product_tags' table
      await axios.post(
        `http://localhost:8800/product_tags`,
        { product_id: currentProduct.id, tag_id: tagId },
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // After adding, update product tags in state
    setProducts(products.map((product) =>
      product.id === currentProduct.id
        ? { ...product, tags: [...product.tags, ...tagsInput] }  // Add the tag IDs to the product tags
        : product
    ));

    // Close the modal and reset the inputs
    setShowTagModal(false);
    setTagsInput([]);  // Clear the tags input
    setNewTag('');  // Clear the new tag input
  } catch (err) {
    console.error('Error adding tags:', err);
  }
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

const handleTagSelection = (selectedTags) => {
  // Debugging log to see what tags are selected
  console.log('Selected Tags:', selectedTags);
  console.log('Existing Tags:', existingTags);

  // Map the selected tag names to their corresponding tag IDs
  const selectedTagIds = selectedTags.map(tagName => {
    // Find the tag in existingTags that matches the name
    const tag = existingTags.find(tag => tag.name === tagName);

    // If a matching tag is found, return its id, otherwise return null
    return tag ? tag.id : null;
  }).filter(tagId => tagId !== null); // Filter out any null values

  // Log the tag IDs to verify they are correct
  console.log('Selected Tag IDs:', selectedTagIds);

  // Store the tag IDs in state or proceed with further logic
  setTagsInput(selectedTagIds);  // Assuming you want to set them in state
};


  const handleNewTagChange = (e) => {
    setNewTag(e.target.value);  // Update new tag input state
  };

  const addNewTag = () => {
    if (newTag && !tagsInput.includes(newTag)) {
      setTagsInput([...tagsInput, newTag]);  // Add new tag to the list
      alert("Tag Added");
    }
  };

  const openTagModal = (product) => {
    setCurrentProduct(product);
    setTagsInput(product.tags || []);  // Pre-fill with existing tags
    setShowTagModal(true);
  };

  const closeTagModal = () => {
    setShowTagModal(false);
    setCurrentProduct(null);
    setTagsInput([]);
    setNewTag('');  // Clear new tag input
  };

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
    navigate('/addrole');
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
              <p className="tags">
                Tags: {product.tags ? product.tags.join(', ') : 'No tags yet'}
              </p>
            </div>
            <div className="product-actions">
              <button className="delete-btn" onClick={() => handleDelete(product.id)}>Delete</button>
              <button className="update-btn">
                <Link to={`/update/${product.id}`}>Update</Link>
              </button>
              <button onClick={() => openTagModal(product)}>Manage Tags</button>
            </div>
          </div>
        ))}
      </div>

      {showTagModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Manage Tags for {currentProduct?.prod_name}</h3>
            <div>
              <input
                type="text"
                value={newTag}
                onChange={handleNewTagChange}
                placeholder="Add a new tag"
              />
              <button onClick={addNewTag}>Add New Tag</button>
            </div>
            <select
              multiple
              value={tagsInput}
              onChange={(e) => handleTagSelection(Array.from(e.target.selectedOptions, option => option.value))}
            >
              {existingTags.map(tag => (
                <option key={tag.id} value={tag.name}>{tag.name}</option>
              ))}
            </select>
            <div className="modal-actions">
              <button onClick={handleAddTags}>Save Tags</button>
              <button onClick={closeTagModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Add New User and Logout */}
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
        <button onClick={goToUserPage}>Go to User Page</button>
      
      </div>
    </div>
  );
};

export default Products;
