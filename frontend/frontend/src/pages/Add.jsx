import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddProduct = () => {
  const [product, setProduct] = useState({
    prod_name: "",
    prod_description: "",
    price: null,
    stock: null,
    category: "",
  });

  const [image, setImage] = useState(null); // To store the selected image file
  const navigate = useNavigate();

  // Handle input field changes
  const handleChange = (e) => {
    setProduct((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Handle file selection
  const handleFileChange = (e) => {
    setImage(e.target.files[0]); // Store the selected image file

  };

  // Handle form submission
  const handleAddProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    // Append product fields
    for (const key in product) {
      formData.append(key, product[key]);
    }
    for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
    // Append the image file
    if (image) {
      formData.append("image", image);
      console.log("File name:", image.name);
      console.log("File type:", image.type);
      console.log("File size:", image.size);
    }
    for (let pair of formData.entries()) {
        console.log(`${pair[0]}, ${pair[1]}`);
      }
      
    try {
    console.log("Form Data: ", image);
      // Post data to the backend
      await axios.post("http://localhost:8800/products/addimage", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Uploaded Successfully");
      navigate("/products"); // Redirect to the products page
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="form">
      <h1>Add Product</h1>
      <input type="text" placeholder="Name" onChange={handleChange} name="prod_name" />
      <input type="text" placeholder="Description" onChange={handleChange} name="prod_description" />
      <input type="number" placeholder="Price" onChange={handleChange} name="price" />
      <input type="number" placeholder="Stock" onChange={handleChange} name="stock" />
      <div>
        <select placeholder="Select Category" onChange={handleChange} name="category">
          <option value="">Select Category</option>
          <option value="Men">Men</option>
          <option value="Women">Women</option>
          <option value="Kids">Kids</option>
        </select>
      </div>
      <input type="file" onChange={handleFileChange} accept="image/*" />
      <button onClick={handleAddProduct}>Add Product</button>
    </div>
  );
};

export default AddProduct;
