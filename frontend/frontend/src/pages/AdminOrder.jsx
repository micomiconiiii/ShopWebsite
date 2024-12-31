import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const OrdersList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        axios.get('http://localhost:8800/orders/')
            .then(response => {
                console.log('Orders:', response.data); // Log full order data
                setOrders(response.data);
                setLoading(false);
            })
            .catch(error => {
                setError('Failed to fetch orders');
                setLoading(false);
            });
    }, []);

    const handleDelete = async (orderID) => {
        const confirmDelete = window.confirm("Are you sure you want to cancel this order?");
        if (confirmDelete) {
            try {
                await axios.delete(`http://localhost:8800/orders/remove/${orderID}`);
                setOrders(orders.filter(order => order.orderID !== orderID));
            } catch (error) {
                console.error('Error deleting order:', error);
            }
        }
    };

    const handleUpdate = async (orderID) => {
        const orderToUpdate = orders.find(order => order.orderID === orderID);
        setSelectedOrder(orderToUpdate);
        setIsUpdating(true);
    };

    const handleSaveUpdate = async (updatedOrder) => {
        try {
            const response = await axios.put(`http://localhost:8800/orders/update-item/${updatedOrder.orderID}`, updatedOrder);
    
            // If the order is marked as delivered, update stock
            if (updatedOrder.status === 'Delivered') {
                await handleStockUpdate(updatedOrder.items, updatedOrder.orderID);  // Call stock update function
            }
    
            setOrders(orders.map(order => (order.orderID === updatedOrder.orderID ? updatedOrder : order)));
            setIsUpdating(false);
            setSelectedOrder(null);
        } catch (error) {
            console.error('Error updating order:', error);
        }
    };
    
    const handleStockUpdate = async (items, orderID) => {
        try {
            // Ensure that items is an array
            if (typeof items === 'string') {
                items = JSON.parse(items); // Parse the string to an array
            }
    
            if (!Array.isArray(items)) {
                console.error('Expected items to be an array but got:', typeof items);
                return;
            }
    
            // Loop through each item in the items array
            for (let item of items) {
                // Check if productID is defined before proceeding
                if (item.productID !== undefined) {
                    console.log("Updating stock for productID:", item.productID);
    
                    // Deduct the quantity from the stock if the status is delivered
                    await axios.put(`http://localhost:8800/orders/update-stock/${item.productID}`, {
                        quantity: -item.quantity  // Deduct quantity
                    });
                } else {
                    console.warn("ProductID is missing for item:", item);
                }
            }
        } catch (error) {
            console.error('Error updating stock:', error);
            alert('An error occurred while updating stock.');
        }
    };
    
    

    if (loading) return <p>Loading orders...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            {orders.map((order) => {
                // Parse items from JSON column
                const items = Array.isArray(JSON.parse(order.items)) ? JSON.parse(order.items) : [];
                return (
                    <div key={order.orderID} className="order-card">
                        {/* Order Details */}
                        <div className="order-header">
                            <h2>Order ID: {order.orderID}</h2>
                            <p><strong>User ID:</strong> {order.userID}</p>
                            <p><strong>User Name:</strong> {order.name}</p>
                            <p><strong>Status:</strong> {order.status}</p>
                            <p><strong>Order Date:</strong> {new Date(order.orderDate).toLocaleString()}</p>
                            <p><strong>Shipping Address:</strong> {order.shippingAddress}</p>
                        </div>
                        <div className="order-items">
                            <h3>Items</h3>
                            <div className="items-list">
                                {items.map((item, index) => (
                                    <div key={index} className="item">
                                        <p><strong>Product Name:</strong> {item.productName}</p>
                                        <p><strong>Quantity:</strong> {item.quantity}</p>
                                        <p><strong>Price:</strong> ${item.price}</p>
                                        <p><strong>Total Cost:</strong> ${item.totalCost}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="order-actions">
                            <button
                                onClick={() => handleDelete(order.orderID)}
                                className="cancel-button"
                                disabled={order.status === 'Delivered'} // Disable button if status is "Delivered"
                            >
                                Cancel Order
                            </button>
                            <button onClick={() => handleUpdate(order.orderID)} className="update-button">
                                Update Order
                            </button>
                        </div>
                    </div>
                );
            })}

            {isUpdating && selectedOrder && (
                <div className="update-order-modal">
                    <h2>Update Order {selectedOrder.orderID}</h2>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const updatedOrder = {
                                ...selectedOrder,
                                status: e.target.status.value,
                                shippingAddress: e.target.shippingAddress.value,
                            };
                            handleSaveUpdate(updatedOrder);
                        }}
                    >
                        <div>
                            <label>Status:</label>
                            <select
                                name="status"
                                defaultValue={selectedOrder.status}
                                onChange={(e) => setSelectedOrder({ ...selectedOrder, status: e.target.value })}
                            >
                                <option value="Pending">Pending</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                                <option value="Refunded">Refunded</option>
                                <option value="To be rated">To be rated</option>
                            </select>
                        </div>
                        <div>
                            <label>Shipping Address:</label>
                            <input type="text" name="shippingAddress" defaultValue={selectedOrder.shippingAddress} />
                        </div>
                        <button type="submit">Save Changes</button>
                        <button type="button" onClick={() => setIsUpdating(false)}>
                            Cancel
                        </button>
                    </form>
                </div>
            )}

            <div>
                <button type="button">
                    <Link to="/Shoes">Back</Link>
                </button>
            </div>
        </div>
    );
};

export default OrdersList;
