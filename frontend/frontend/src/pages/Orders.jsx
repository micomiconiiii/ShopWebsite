import React, { useEffect, useState } from 'react';
import axios from 'axios';

const OrdersList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        // Fetch orders from the backend when the component mounts
        axios.get('http://localhost:8800/orders')
            .then((response) => {
                setOrders(response.data.orders);  // Set the orders state
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);  // Set error message in case of failure
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
                console.error('Error Deleting Order', error);
            }
        } else {
            console.log('Order deletion canceled');
        }
    };

    const handleUpdate = async (orderID) => {
        // Open the update form for the selected order
        const orderToUpdate = orders.find(order => order.orderID === orderID);
        setSelectedOrder(orderToUpdate);
        setIsUpdating(true);
    };

    const handleSaveUpdate = async (updatedOrder) => {
        try {
            console.log('Updated order:', updatedOrder);  // Log the updated order being sent to the backend
            const response = await axios.put(`http://localhost:8800/orders/update-item/${updatedOrder.orderID}`, updatedOrder);
            setOrders(orders.map(order => (order.orderID === updatedOrder.orderID ? updatedOrder : order)));
            setIsUpdating(false);
            setSelectedOrder(null);
        } catch (error) {
            console.error('Error Updating Order', error);
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
            {/* Your orders list */}
            {orders.map((order) => {
                const items = Array.isArray(JSON.parse(order.items)) ? JSON.parse(order.items) : [];
                return (
                    <div key={order.orderID} className="order-card">
                        {/* Order Details */}
                        <div className="order-header">
                            <h2>Order ID: {order.orderID}</h2>
                            <p><strong>Status:</strong> {order.status}</p>
                            <p><strong>Order Date:</strong> {new Date(order.orderDate).toLocaleString()}</p>
                            <p><strong>Shipping Address:</strong> {order.shippingAddress}</p>
                        </div>
    
                        {/* Item Details */}
                        <div className="order-items">
                            <h3>Items</h3>
                            <div className="items-list">
                                {Array.isArray(items) ? (
                                    items.map((item, index) => (
                                        <div key={index} className="item">
                                            <p><strong>Product Name:</strong> {item.productName}</p>
                                            <p><strong>Quantity:</strong> {item.quantity}</p>
                                            <p><strong>Price:</strong> ${item.price}</p>
                                            <p><strong>Total Cost:</strong> ${item.totalCost}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p>No items available.</p>
                                )}
                            </div>
                        </div>
    
                        {/* Cancel Order Button */}
                        <div className="order-actions">
                            <button onClick={() => handleDelete(order.orderID)} className="cancel-button">
                                Cancel Order
                            </button>
                            {/* Update Order Button */}
                            <button onClick={() => handleUpdate(order.orderID)} className="update-button">
                                Update Order
                            </button>
                        </div>
                    </div>
                );
            })}
    
            {/* Update Order Modal/Section */}
            {isUpdating && selectedOrder && (
                <div className="update-order-modal">
                    <h2>Update Order {selectedOrder.orderID}</h2>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const updatedOrder = {
                            ...selectedOrder,
                            status: e.target.status.value,
                            shippingAddress: e.target.shippingAddress.value,
                        };
                        handleSaveUpdate(updatedOrder);
                    }}>
                        <div>
                        <label>Status:</label>
                        <select name="status" defaultValue={selectedOrder.status}  onChange={(e) => setSelectedOrder({ ...selectedOrder, status: e.target.value })}
 >
                        <option value="Pending">Pending</option>
                        <option value="Received">Received</option>
                        <option value="Shipped">To Be Rated</option>
                        </select></div>
                        
                        <div>
                            <label>Shipping Address:</label>
                            <input type="text" name="shippingAddress" defaultValue={selectedOrder.shippingAddress} />
                        </div>
                        <button type="submit">Save Changes</button>
                        <button type="button" onClick={() => setIsUpdating(false)}>Cancel</button>
                    </form>
                </div>
            )}
        </div>
    );
}
export default OrdersList;
