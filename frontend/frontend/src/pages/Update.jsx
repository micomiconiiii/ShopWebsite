import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const Update = () => {
  const [shoe, setShoe] = useState({
    prod_name: "",
    prod_description: "",
    price: "",
    stock: "",
    image: "",
    category: "",
  });
  const [newCategory, setNewCategory] = useState(""); // State for adding a new category
  const [categories, setCategories] = useState(["Men", "Women", "Kids"]); // Default categories

  const navigate = useNavigate();
  const location = useLocation();
  const productID = location.pathname.split("/")[2]; // Get the shoe ID from URL

  // Fetch the shoe data when the component loads
  useEffect(() => {
    const fetchShoeData = async () => {
      try {
        const response = await axios.get(`http://localhost:8800/products/${productID}`);
        setShoe(response.data); // Set the fetched data into state
      } catch (error) {
        console.error("Error fetching shoe data:", error);
      }
    };

    fetchShoeData();
  }, [productID]);

  // Handle input changes for form fields
  const handleChange = (e) => {
    setShoe((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Handle the addition of a new category
  const handleAddCategory = () => {
    if (newCategory.trim() !== "" && !categories.includes(newCategory.trim())) {
      setCategories((prevCategories) => [...prevCategories, newCategory.trim()]);
      setNewCategory(""); // Clear the new category input after adding
    } else {
      alert("Please enter a valid and unique category name.");
    }
  };

  // Handle removal of a category
  const handleRemoveCategory = (category) => {
    setCategories((prevCategories) => prevCategories.filter((item) => item !== category));
  };

  // Handle form submission to update the product
  const handleClick = async (e) => {
    e.preventDefault();
    try {
      // Send a PUT request to update the product
      await axios.put(`http://localhost:8800/products/${productID}`, shoe);
      // After the update, navigate to the homepage or another page
      navigate("/products");
    } catch (err) {
      console.log("Error updating shoe:", err);
    }
  };

  return (
    <div className="form">
      <h1>Update Item</h1>

      <div className='form-group'>
        <label htmlFor="productName">Product Name</label>
        <input
          type="text"
          placeholder={shoe.prod_name || "Name"}
          value={shoe.prod_name || ""}
          onChange={handleChange}
          name="prod_name"
        />
      </div>
      <div className='form-group'>
        <label htmlFor="description">Description</label>
        <input
          type="text"
          placeholder={shoe.prod_description || "Description"}
          value={shoe.prod_description || ""}
          onChange={handleChange}
          name="prod_description"
        />
      </div>
      <div className='form-group'>
        <label htmlFor="price">Price</label>
        <input
          type="number"
          placeholder={shoe.price || "Price"}
          value={shoe.price || ""}
          onChange={handleChange}
          name="price"
        />
      </div>
      <div className='form-group'>
        <label htmlFor="stock">Stock</label>
        <input
          type="number"
          placeholder={shoe.stock || "Stock"}
          value={shoe.stock || ""}
          onChange={handleChange}
          name="stock"
        />
      </div>
      <div className='form-group'>
        <label htmlFor="image">Image</label>
        <input
          type="text"
          placeholder={shoe.image || "Image URL"}
          value={shoe.image || ""}
          onChange={handleChange}
          name="image"
        />
      </div>
      <div className='form-group'>
        <label htmlFor="category">Category</label>
        <select 
          value={shoe.category || ""}
          onChange={handleChange}
          name="category"
        >
          <option value="">Select Category</option>
          {categories.map((category, index) => (
            <option key={index} value={category}>{category}</option>
          ))}
        </select>

        {/* Input field for custom category */}
        <input
          type="text"
          placeholder="Add a new category"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <button type="button" onClick={handleAddCategory}>Add Category</button>

        {/* Display the list of added categories with Remove buttons */}
        <div>
          <h4>Added Categories:</h4>
          <ul>
            {categories.map((category, index) => (
              <li key={index}>
                {category}{" "}
                <button type="button" onClick={() => handleRemoveCategory(category)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <button onClick={handleClick}>Update</button>
    </div>
  );
};

export default Update;
