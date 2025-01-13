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
    const [selectedTag, setSelectedTag] = useState('');
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [uniqueTags, setUniqueTags] = useState([]);
    const [tags, setTags] = useState([]);
    const closePopup = () => {
      setIsVisible(false);
    };
    const [isVisible, setIsVisible] = useState(false);
    const togglePopup = () => {
      setIsVisible((prev) => !prev);
    };
  
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
          const uniqueCategories = [...new Set(res.data.map(product => product.category))];
          setCategories(uniqueCategories);
      
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

      if (selectedCategory) {
        filteredProducts = filteredProducts.filter(product => product.category === selectedCategory);
      }
      if (selectedTag) {
        filteredProducts = filteredProducts.filter((product) =>
          tags[product.id]?.includes(selectedTag)
        );
      }
  
      setSortedProducts(filteredProducts);
    }, [products, sortOption]);

    const filteredProducts = sortedProducts.filter(product =>
      product.prod_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.prod_description.toLowerCase().includes(searchQuery.toLowerCase())
    );


    const handleAddTags = async () => {
      if (!currentProduct) return;
    
      try {
        const existingTagIds = currentProduct.tags || []; // Existing tags for the product
        const tagsToAdd = tagsInput.filter((id) => !existingTagIds.includes(id)); // New tags to add
        const tagsToRemove = existingTagIds.filter((id) => !tagsInput.includes(id)); // Tags to remove
    
        // Add new tags
        const addTagRequests = tagsToAdd.map((tagId) =>
          axios.post(
            'http://localhost:8800/product_tags',
            { product_id: currentProduct.id, tag_id: tagId },
            { headers: { 'Content-Type': 'application/json' } }
          )
        );
        
        // Remove disassociated tags
        const removeTagRequests = tagsToRemove.map((tagId) =>
          axios.delete(`http://localhost:8800/product_tags`, {
            data: { product_id: currentProduct.id, tag_id: tagId },
            headers: { 'Content-Type': 'application/json' },
          })
        );
    
        // Wait for all requests to complete
        await Promise.all([...addTagRequests, ...removeTagRequests]);
    
        // Notify the user
        alert('Tags updated successfully!');
        closeTagModal();
      } catch (error) {
        console.error('Error updating tags:', error);
        alert('Failed to update tags. Please try again.');
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


    

    const handleNewTagChange = (e) => {
      setNewTag(e.target.value);  // Update new tag input state
    };

    const addNewTag = async (tag) => {
     console.log("tag: ",tag);
     
      // Check if tag already exists in the input
      if (tagsInput.includes(tag)) {
          alert("Tag already added!");
          return;
      }
  
      try {
          // Send the new tag to the backend
          const response = await axios.post(
              "http://localhost:8800/tags",
              { name: tag },
              { headers: { "Content-Type": "application/json" } }
          );
  
          // Add the returned tag to the local state
          const savedTag = response.data;
          setTagsInput((prev) => [...prev, savedTag.name]);
          alert("Tag added successfully!");
          window.location.reload();
          setNewTag(""); // Clear the input field
      } catch (error) {
          console.error("Error adding tag:", error);
          alert("Failed to add tag. Please try again.");
      }
  };
  
  const handleRemoveTag = async (tagName) => {
    if (!currentProduct) return;
  
    // Find the tag ID based on the name
    const tag = existingTags.find((t) => t.name === tagName);
    if (!tag) {
      alert('Tag not found!');
      return;
    }
  
    const tagId = tag.id;
  
    try {
      await axios.delete('http://localhost:8800/product_tags', {
        data: { product_id: currentProduct.id, tag_id: tagId },
        headers: { 'Content-Type': 'application/json' },
      });
  
      // Update the local states
      setCurrentProduct((prev) => ({
        ...prev,
        tags: prev.tags.filter((t) => t !== tagName),
      }));
  
      setTagsInput((prev) => prev.filter((id) => id !== tagName));
  
      alert('Tag removed successfully!');
      closeTagModal();
    } catch (error) {
      console.error('Error removing tag:', error);
      alert('Failed to remove tag. Please try again.');
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
      const confirmDelete = window.confirm("Are you sure you want to delete?");
      console.log("Id is: ", id);
      // If user clicks "Cancel", stop the operation
      if (!confirmDelete) {
        return; // Exit the function without deleting
      }
    
      try {
        // Proceed with the delete request if user clicks "OK"
        const res = await axios.delete(`http://localhost:8800/products/${id}`);
    
        // Refresh the products list and reload the page
        setProducts(res.data);
        window.location.reload();
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete the product. Please try again.");
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
        <header className='header'>
        <div className="logo">
          <img src="/HAUTE.png" alt="Logo" className="logo-img" />
        </div>
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
        {uniqueTags.map((tag) => (
          <option key={tag.id} value={tag.id}>
            {tag}
          </option>
        ))}
      </select>
    </div>

        </div>
        
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <div className="product-card" key={product.id}>
              <img src={product.image} alt={product.prod_name} />
              <div className="product-details">
              {rating[product.id] === 0 ? (
              'No ratings yet'
              ) : (
              <span>
              {'★'.repeat(Math.floor(rating[product.id]))}
              {'☆'.repeat(5 - Math.floor(rating[product.id]))}
              ({rating[product.id]?.toFixed(2)})
              </span>
              )}
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
                <button className="minimal-btn" onClick={() => handleDelete(product.id)}>Delete</button>
                <button className="minimal-btn">
                  <Link to={`/update/${product.id}`}>Update</Link>
                </button>
                <button className="minimal-btn" onClick={() => openTagModal(product)}>Tags</button>
              </div>
            </div>
          ))}
        </div>

        {showTagModal && currentProduct && (
  <div
    className="modal d-flex align-items-center justify-content-center"
    style={{
      display: "block",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    }}
  >
    <div
      className="modal-dialog modal-dialog-centered"
      style={{
        maxWidth: "500px", // Constrain modal width
        width: "100%", // Ensure responsiveness
      }}
    >
      <div className="modal-content">
        {/* Modal Header */}
        <div className="modal-header">
          <h3 className="modal-title">Manage Tags for {currentProduct?.prod_name}</h3>
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={closeTagModal}
          ></button>
        </div>

        {/* Modal Body */}
        <div
          className="modal-body"
          style={{
            maxHeight: "60vh", // Constrain height of the body
            overflowY: "auto", // Enable scrolling
          }}
        >
          {/* Add a New Tag */}
          <div className="new-tag-input mb-3">
            <label htmlFor="new-tag" className="form-label">
              Add a New Tag:
            </label>
            <div className="d-flex gap-2">
              <input
                type="text"
                id="new-tag"
                className="form-control"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Enter tag name"
              />
              <button className="btn btn-primary" onClick={() => addNewTag(newTag)}>
                Add
              </button>
            </div>
          </div>

          {/* Checkbox List */}
          <div className="tag-checkboxes" >
            <h4 className="checkbox-title mb-2">Select Tags:</h4>
            <div className="checkbox-grid">
              {existingTags.map((tag) => (
                <div key={tag.id} className="form-check  justify-content-left align-items-left text-align-left">
                  <input
                    type="checkbox"
                    id={`tag-${tag.id}`}
                    className="form-check-input  justify-content-left align-items-left text-align-left"
                    checked={tagsInput.includes(tag.id)}
                    onChange={(e) => {
                      const updatedTags = e.target.checked
                        ? [...tagsInput, tag.id]
                        : tagsInput.filter((tagId) => tagId !== tag.id);
                      setTagsInput(updatedTags);
                    }}
                  />
                  <label htmlFor={`tag-${tag.id}`} className="form-check-label">
                    {tag.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Removing Tags */}
          <div className="mt-4">
            <h4>Selected Tags:</h4>
            <ul className="list-group">
              {tagsInput.map((tag, index) => (
                <li
                  key={index}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  {tag}
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer align-items-center justify-content-center text-align-center">
          <button className="btn btn-success" onClick={handleAddTags}>
            Save Tags
          </button>
          <button className="btn btn-secondary" onClick={closeTagModal}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
)}



     <div>
      {/* Toggle Button */}
      <button className="toggle-btn" onClick={togglePopup}>
        {isVisible ? "Close" : "Open Admin Panel"}
      </button>

          {/* Add New User and Logout */}
          {isVisible && (
          <div className="admin-actions">
             <button className="close-btn" onClick={closePopup}>
            ✕
          </button>
            <button className="minimal-btn">
              <Link to="/add">Add new products</Link>
            </button>
            <button className="minimal-btn">
              <Link to="/orderdashboard">View Order Dashboard</Link>
            </button>
            <button className="minimal-btn">
              <Link to="/showusers">View Users</Link>
            </button>
            <button className="minimal-btn" onClick={addUser}>
              Add New User
            </button>
            
            <button className='minimal-btn' onClick={goToUserPage}>Go to User Page</button>
            {!userName ? (
              <button className="minimal-btn">
                <Link to="/login">Log in</Link>
              </button>
            ) : (
              <button className="minimal-btn" onClick={handleLogout}>Log out</button>
            )}
        </div>)}
        </div>
        <footer className="footer">
      <div className="footer-container">
        <div className="contact-info">
          <p>Contact us: <a href="mailto:contact@hautesummer.com">contact@hautesummer.com</a></p>
          <p>Phone: 09123456789</p>
          <p>&copy; Haute Summer</p>
        </div>
        
      </div>
    </footer>

      </div>
    );
  };

  export default Products;
