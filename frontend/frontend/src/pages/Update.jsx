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
  });

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

  const handleChange = (e) => {
    setShoe((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleClick = async (e) => {
    e.preventDefault();
    try {
      // Send a PUT request to update the product
      await axios.put(`http://localhost:8800/products/${productID}`, shoe);
      // After the update, navigate to the homepage or another page
      navigate("/products");
    } catch (err){
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
        placeholder={shoe.prod_name || "Name"} // Show the current name as placeholder
        value={shoe.prod_name || ""}
        onChange={handleChange}
        name="prod_name"
      />
      </div>
      <div className='form-group'>
      <label htmlFor="description">Description</label>
      <input
        type="text"
        placeholder={shoe.prod_description || "Description"} // Show the current description as placeholder
        value={shoe.prod_description || ""}
        onChange={handleChange}
        name="prod_description"
      />
      </div>
      <div className='form-group'>
      <label htmlFor="price">Price</label>
      <input
        type="number"
        placeholder={shoe.price || "Price"} // Show the current price as placeholder
        value={shoe.price || ""}
        onChange={handleChange}
        name="price"
      />
      </div>
      <div className='form-group'>
      <label htmlFor="stock">Stock</label>
      <input
        type="number"
        placeholder={shoe.stock || "Stock"} // Show the current stock as placeholder
        value={shoe.stock || ""}
        onChange={handleChange}
        name="stock"
      />
      </div>
      <div className='form-group'>
      <label htmlFor="image">Image</label>
      <input
        type="text"
        placeholder={shoe.image || "Image URL"} // Show the current image URL as placeholder
        value={shoe.image || ""}
        onChange={handleChange}
        name="image"
      />
      </div>

      <button onClick={handleClick}>Update</button>
    </div>
  );
};

export default Update;
