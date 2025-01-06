import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import '../cart.css'; // Assuming we add a separate CSS file

const Cart = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [selectedTotal, setSelectedTotal] = useState(0);
    const [userId] = useState(localStorage.getItem('userID') || '');
    const [selectedItems, setSelectedItems] = useState([]);
    const [shippingAddress, setShippingAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [debitCardInfo, setDebitCardInfo] = useState({ cardNumber: '', expiryDate: '', cvv: '' });
    const [eWalletInfo, setEWalletInfo] = useState({ walletId: '', pin: '' });

    // Use useEffect to fetch cart items
    useEffect(() => {
        if (userId) {
            const fetchCartItems = async () => {
                try {
                    const response = await axios.get(`http://localhost:8800/cart/${userId}`);
                    setCartItems(response.data);
                    calculateTotal(response.data);
                } catch (error) {
                    console.error('Error fetching cart items:', error);
                }
            };
            fetchCartItems();
        }
    }, [userId]);

    // Calculate total price of selected items
    useEffect(() => {
        const totalAmount = cartItems
            .filter((item) => selectedItems.includes(item.shoe_id))
            .reduce((acc, item) => acc + item.price * item.quantity, 0);
        setSelectedTotal(totalAmount);
    }, [selectedItems, cartItems]);

    // Recalculate the total of all cart items
    const calculateTotal = (items) => {
        const totalAmount = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
        setTotal(totalAmount);
    };

    const updateCartItem = async (productId, action) => {
        const currentItem = cartItems.find(item => item.shoe_id === productId);
        const response = await axios.get(`http://localhost:8800/products/${productId}`);
        const shoe = response.data;
        console.log("Product: ", shoe);
        if (!currentItem || !shoe) return;

        let newQuantity = currentItem.quantity;
        if (action === 'increment') {
            newQuantity += 1;
        } else if (action === 'decrement' && newQuantity > 1) {
            newQuantity -= 1;
        }

        const newCost = shoe.price * newQuantity;

        try {
            await axios.put('http://localhost:8800/cart/update', {
                userId,
                productId,
                quantity: newQuantity,
                cost: newCost
            });

            setCartItems((prevItems) => {
                const updatedItems = prevItems.map((item) =>
                    item.shoe_id === productId ? { ...item, quantity: newQuantity } : item
                );
                calculateTotal(updatedItems);
                return updatedItems;
            });
        } catch (error) {
            console.error('Error updating cart item:', error);
        }
    };

    const removeItemFromCart = async (productID) => {
        try {
            await axios.delete('http://localhost:8800/cart/remove', {
                data: { userId, productID },
            });
            setCartItems((prevItems) => {
                const updatedItems = prevItems.filter((item) => item.shoe_id !== productID);
                calculateTotal(updatedItems);
                return updatedItems;
            });
        } catch (error) {
            console.error('Error removing item from cart:', error);
        }
    };

    const handleCheckOut = async () => {
        const selectedItemsData = cartItems.filter(item => selectedItems.includes(item.shoe_id));

        for (let item of selectedItemsData) {
            const response = await axios.get(`http://localhost:8800/products/${item.shoe_id}`);
            const shoe = response.data;
            if (shoe.stock < item.quantity) {
                alert(`Insufficient stock for ${item.prod_name}. Only ${shoe.stock} items are available.`);
                return;
            }
        }

        if (selectedItemsData.length === 0) {
            alert('Please select at least one item to proceed with the checkout!');
            return;
        }

        if (!shippingAddress.trim()) {
            alert('Shipping address is required. Please provide a valid shipping address.');
            return;
        }

        const orderItems = selectedItemsData.map(item => ({
            productID: item.shoe_id,
            productName: item.prod_name,
            quantity: item.quantity,
            price: item.price,
            totalCost: item.quantity * item.price,
        }));

        const totalAmount = orderItems.reduce((acc, item) => acc + item.totalCost, 0);

        const orderData = {
            userID: userId,
            orderDate: new Date(),
            status: 'Pending',
            items: orderItems,
            totalAmount,
            shippingAddress,
            paymentMethod,
        };

        try {
            await axios.post('http://localhost:8800/orders', orderData);
            alert("Order placed successfully!");
            setCartItems([]);
            setTotal(0);
            setSelectedItems([]);
            navigate("/home");
        } catch (error) {
            console.error('Error during checkout:', error);
            alert('An error occurred during checkout. Please try again.');
        }
    };

    const handleCheckboxChange = (productID) => {
        setSelectedItems((prevSelected) => {
            if (prevSelected.includes(productID)) {
                return prevSelected.filter((id) => id !== productID);
            } else {
                return [...prevSelected, productID];
            }
        });
    };

    return (
        <div className="cart-container">
            <h1 className="cart-title">Your Shopping Cart</h1>
            <table className="cart-table">
                <thead>
                    <tr>
                        <th>Select</th>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {cartItems.map((item) => (
                        <tr key={item.shoe_id}>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={selectedItems.includes(item.shoe_id)}
                                    onChange={() => handleCheckboxChange(item.shoe_id)}
                                />
                            </td>
                            <td>{item.prod_name}</td>
                            <td>${item.price}</td>
                            <td>
                                <button onClick={() => updateCartItem(item.shoe_id, 'decrement')} disabled={item.quantity <= 1}>-</button>
                                <span>{item.quantity}</span>
                                <button onClick={() => updateCartItem(item.shoe_id, 'increment')}>+</button>
                            </td>
                            <td>${(item.price * item.quantity).toFixed(2)}</td>
                            <td>
                                <button onClick={() => removeItemFromCart(item.shoe_id)}>Remove</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="cart-summary">
                <h2>Total for Selected Items: ${selectedTotal.toFixed(2)}</h2>
                <h3>Total inside the Cart: ${total.toFixed(2)}</h3>
                
            </div>

            <div className="shipping-address">
                <label htmlFor="shippingAddress">Shipping Address:</label>
                <textarea
                    id="shippingAddress"
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Enter your shipping address"
                    rows="4"
                    cols="50"
                />
            </div>

            <div className="payment-method">
                <label>Select Payment Method:</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    <option value="">Select Payment Method</option>
                    <option value="cod">Cash on Delivery</option>
                    <option value="debitCard">Debit/Credit Card</option>
                    <option value="eWallet">E-Wallet</option>
                </select>
            </div>

            {paymentMethod === 'debitCard' && (
                <div className="payment-form">
                    <h3>Debit/Credit Card Details</h3>
                    <form>
                        <input
                            type="text"
                            value={debitCardInfo.cardNumber}
                            onChange={(e) => setDebitCardInfo({ ...debitCardInfo, cardNumber: e.target.value })}
                            placeholder="Card Number"
                            required
                        />
                        <input
                            type="text"
                            value={debitCardInfo.expiryDate}
                            onChange={(e) => setDebitCardInfo({ ...debitCardInfo, expiryDate: e.target.value })}
                            placeholder="Expiry Date"
                            required
                        />
                        <input
                            type="text"
                            value={debitCardInfo.cvv}
                            onChange={(e) => setDebitCardInfo({ ...debitCardInfo, cvv: e.target.value })}
                            placeholder="CVV"
                            required
                        />
                    </form>
                </div>
            )}

            {paymentMethod === 'eWallet' && (
                <div className="payment-form">
                    <h3>E-Wallet Details</h3>
                    <form>
                        <input
                            type="text"
                            value={eWalletInfo.walletId}
                            onChange={(e) => setEWalletInfo({ ...eWalletInfo, walletId: e.target.value })}
                            placeholder="Wallet ID"
                            required
                        />
                        <input
                            type="password"
                            value={eWalletInfo.pin}
                            onChange={(e) => setEWalletInfo({ ...eWalletInfo, pin: e.target.value })}
                            placeholder="PIN"
                            required
                        />
                    </form>
                </div>
            )}

            <div className="cart-actions">
                <button onClick={handleCheckOut} className="checkout-btn">Proceed to Checkout</button>
                <Link to="/home" className="back-to-home">Back to Home</Link>
            </div>
        </div>
    );
};

export default Cart;
