import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css"; // Add Bootstrap CSS for styling
import "../update.css";

const Update = () => {
  const [shoe, setShoe] = useState({
    prod_name: "",
    prod_description: "",
    price: "",
    stock: "",
    image: "",
    category: "",
  });
  const [categories, setCategories] = useState(["Men", "Women", "Kids"]);
  const [newCategory, setNewCategory] = useState("");
  const [image, setImage] = useState(null);

  const [showTagModal, setShowTagModal] = useState(false);
  const [tagsInput, setTagsInput] = useState([]); // Tags selected for the product
  const [existingTags, setExistingTags] = useState([]); // Tags fetched from the database
  const [newTag, setNewTag] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const productID = location.pathname.split("/")[2];

  useEffect(() => {
    // Fetch product and tags data
    const fetchData = async () => {
      try {
        const [productResponse, tagsResponse] = await Promise.all([
          axios.get(`http://localhost:8800/products/${productID}`),
          axios.get("http://localhost:8800/tags"),
        ]);
        setShoe(productResponse.data);
        setTagsInput(productResponse.data.tags || []); // Assuming product tags are included
        setExistingTags(tagsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [productID]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Ensure stock value is not negative
    if (name === "stock" && value < 0) {
      alert("Stock cannot be negative!");
      return;
    }
  
    setShoe((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories((prev) => [...prev, newCategory.trim()]);
      setNewCategory("");
    }
  };


  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    for (const key in shoe) {
      formData.append(key, shoe[key]);
    }
    if (image) formData.append("image", image);

    try {
      await axios.put(`http://localhost:8800/products/${productID}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Product updated successfully!");
      navigate("/products");
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  return (
    <div className='body-update'>
    <div className="container-update mt-5">
      <h1 className="mb-4">Update Item</h1>

      {/* Product Form */}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-update-label">Product Name</label>
          <input
            type="text"
            className="form-control"
            name="prod_name"
            value={shoe.prod_name || ""}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-update-label">Description</label>
          <input
            type="text"
            className="form-control"
            name="prod_description"
            value={shoe.prod_description || ""}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Price</label>
          <input
            type="number"
            className="form-control"
            name="price"
            value={shoe.price || ""}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Stock</label>
          <input
            type="number"
            className="form-control"
            name="stock"
            value={shoe.stock || ""}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Image</label>
          <input
            type="file"
            className="form-control"
            onChange={handleFileChange}
            accept="image/*"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Category</label>
          <select
            className="form-select"
            name="category"
            value={shoe.category || ""}
            onChange={handleChange}
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <div className="mt-2">
            <input
              type="text"
              className="form-control"
              value={newCategory}
              placeholder="Add new category"
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-warning text-white mt-2"
              onClick={handleAddCategory}
            >
              Add Category
            </button>
          </div>
        </div>

        <div className="mb-3">
          <button className='btn btn-warning text-white' type="submit">
            Update
          </button>
        </div>
      </form>
      </div>
    </div>
  );
};

export default Update;
