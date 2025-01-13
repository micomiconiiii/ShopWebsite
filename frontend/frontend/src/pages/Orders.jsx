import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ReviewModal from './ReviewModal';
import '../orders.css';
const OrdersList = () => {
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [currentProductID, setCurrentProductID] = useState(null);
    const [productName, setProductName] = useState('');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const userId = localStorage.getItem('userID') || ''; // Get userID from localStorage

    useEffect(() => {
        // Fetch orders from the backend when the component mounts
        axios
            .get(`http://localhost:8800/orders/${userId}`)
            .then((response) => {
                setOrders(response.data.orders); // Set the orders state
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message); // Set error message in case of failure
                setLoading(false);
            });
    }, [userId]);

    const handleOpenReview = (productID, productName) => {
        setCurrentProductID(productID);
        setProductName(productName);
        setShowReviewModal(true);
        
    };

    const handleCloseReview = async (id) => {
        try {
            await axios.post(`http://localhost:8800/reviews/${id}`);
            alert('Review submitted successfully.');
        } catch (error) {
            console.error('Error placing review', error);
        }
        setShowReviewModal(false);
        setCurrentProductID(null);
    };

    const handleDelete = async (orderID) => {
        const confirmDelete = window.confirm('Are you sure you want to cancel this order?');
        if (confirmDelete) {
            try {
                await axios.delete(`http://localhost:8800/orders/remove/${orderID}`);
                setOrders(orders.filter((order) => order.orderID !== orderID));
            } catch (error) {
                console.error('Error deleting order', error);
            }
        }
    };

    const handleUpdate = async (orderID) => {
        const orderToUpdate = orders.find((order) => order.orderID === orderID);
        setSelectedOrder(orderToUpdate);
        setIsUpdating(true);
    };

    const handleSaveUpdate = async (updatedOrder) => {
        try {
            const response = await axios.put(
                `http://localhost:8800/orders/update-item/${updatedOrder.orderID}`,
                updatedOrder
            );
            setOrders(
                orders.map((order) =>
                    order.orderID === updatedOrder.orderID ? updatedOrder : order
                )
            );
            setIsUpdating(false);
            setSelectedOrder(null);
        } catch (error) {
            console.error('Error updating order', error);
        }
    };

    if (loading) {
        return <p>Loading orders...</p>;
    }

    if (error) {
        return <p>Error fetching orders: {error}</p>;
    }

    return (
<div>
<div>
<button className="back back-button">
    <Link to="/home">Back</Link>
</button>
</div>
<div className="orders-container">
  {orders.map((order) => {
    const items = Array.isArray(JSON.parse(order.items)) ? JSON.parse(order.items) : [];
    const totalCost = items.reduce((acc, item) => acc + item.totalCost, 0);
    return (
      <div key={order.orderID} className="order-card">
        <div className="order-header">
          <h2>Order ID: {order.orderID}</h2>
          <p>
            <strong>Status:</strong> {order.status}
          </p>
          <p>
            <strong>Order Date:</strong>{' '}
            {new Date(order.orderDate).toLocaleString()}
          </p>
          <p>
            <strong>Shipping Address:</strong> {order.shippingAddress}
          </p>
        </div>
        <div className="order-items">
          <h3>Items</h3>
          <div className="items-list">
            {items.length > 0 ? (
              items.map((item, index) => (
                <div key={index} className="item">
                  <p>
                    <strong>Product Name:</strong> {item.productName}
                  </p>
                  <p>
                    <strong>Quantity:</strong> {item.quantity}
                  </p>
                  <p>
                    <strong>Price:</strong> ${item.price}
                  </p>
                  <p>
                    <strong>Total Cost:</strong> ${item.totalCost}
                  </p>
                  <div className='button-centered'>

                  {order.status === 'Delivered' && (
                    <button
                      onClick={() => handleOpenReview(item.productID, item.productName)}
                      className='update-button'
                    >
                      Leave a Review
                    </button>
                
                  )}
                  </div>
                </div>
              ))
            ) : (
              <p>No items available.</p>
            )}
          </div>
        </div>
        <div className="padding">
          <h3>
            <strong>Total Cost:</strong> ${totalCost.toFixed(2)}
          </h3>
        </div>
        <div className="order-actions">
          <button
            onClick={() => handleDelete(order.orderID)}
            className={`btn btn-danger cancel-button ${order.status === 'Delivered' ? 'disabled' : ''}`}
            disabled={order.status === 'Delivered'}
          >
            Cancel Order
          </button>
          <button
            onClick={() => handleUpdate(order.orderID)}
            className="update-button"
            style={{backgroundColor: '#F29F05'}}
          >
            Update Order
          </button>
        </div>
      </div>
    );
  })}
</div>


{showReviewModal && (
        <div className="modal-backdrop">
          <ReviewModal
            show={showReviewModal}
            onClose={handleCloseReview}
            productID={currentProductID}
            productName={productName}
            userID={userId}
          />
        </div>
      )}
{isUpdating && selectedOrder && (
  <div className="modal-backdrop">
    <div className="update-order-modal">
      <h2>Update Order: {selectedOrder.orderID}</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const updatedOrder = {
            ...selectedOrder,
            status: e.target.status.value,
            shippingAddress: e.target.shippingAddress.value.trim(),
          };
          handleSaveUpdate(updatedOrder);
        }}
      >
        {/* Status Selector */}
        <div className="form-group">
          <label htmlFor="status-select">Status:</label>
          <select
            id="status-select"
            name="status"
            defaultValue={selectedOrder.status}
            onChange={(e) =>
              setSelectedOrder({
                ...selectedOrder,
                status: e.target.value,
              })
            }
            required
          >
            <option value="Pending">Pending</option>
            <option value="Delivered">Order Received</option>
            <option value="Shipped">To Be Rated</option>
          </select>
        </div>

        {/* Shipping Address Input */}
        <div className="form-group">
          <label htmlFor="shipping-address">Shipping Address:</label>
          <input
            id="shipping-address"
            type="text"
            name="shippingAddress"
            defaultValue={selectedOrder.shippingAddress}
            placeholder="Enter shipping address"
            required
          />
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          <button type="submit" className="btn btn-save">
            Save Changes
          </button>
          <button
            type="button"
            className="btn btn-cancel"
            onClick={() => setIsUpdating(false)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
)}


</div>
    );
};

export default OrdersList;
