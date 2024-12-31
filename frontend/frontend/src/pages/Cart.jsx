import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Cart = () => {
    const Navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [userId] = useState(localStorage.getItem('userID') || ''); // Correctly initialize userId
    const [selectedItems, setSelectedItems] = useState([]); // Track selected items for checkout
    const [shippingAddress, setShippingAddress] = useState(''); // State for shipping address

    // Payment state
    const [paymentMethod, setPaymentMethod] = useState(''); // Cash on delivery, Debit/Credit, or E-wallet
    const [debitCardInfo, setDebitCardInfo] = useState({ cardNumber: '', expiryDate: '', cvv: '' });
    const [eWalletInfo, setEWalletInfo] = useState({ walletId: '', pin: '' });

    useEffect(() => {
        if (userId) { // Only fetch cart items if userId exists
            const fetchCartItems = async () => {
                try {
                    const response = await axios.get(`http://localhost:8800/cart/${userId}`);
                    setCartItems(response.data);
                    calculateTotal(response.data); // Recalculate total when items are fetched
                } catch (error) {
                    console.error('Error fetching cart items:', error);
                }
            };
            fetchCartItems();
        }
    }, [userId]); // Run the effect when userId changes

    // Calculate the total price of the cart
    const calculateTotal = (items) => {
        const totalAmount = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
        setTotal(totalAmount);
    };

    // Update quantity of a cart item when the "+" or "-" button is clicked
    const updateCartItem = async (shoeId, action) => {
        const currentItem = cartItems.find(item => item.shoe_id === shoeId);
        const response = await axios.get(`http://localhost:8800/shoes/${shoeId}`);
        const shoe = response.data;

        if (!currentItem || !shoe) return;

        let newQuantity = currentItem.quantity;

        // Adjust quantity based on action
        if (action === 'increment') {
            newQuantity += 1;
        } else if (action === 'decrement' && newQuantity > 1) {
            newQuantity -= 1;
        }

        // Calculate the new cost for the item based on the updated quantity
        const newCost = shoe.price * newQuantity;

        try {
            // Send the updated quantity and cost to the backend
            await axios.put('http://localhost:8800/cart/update', {
                userId,
                shoeId,
                quantity: newQuantity,
                cost: newCost
            });

            // Update the local state with the new quantity
            setCartItems((prevItems) => {
                const updatedItems = prevItems.map((item) =>
                    item.shoe_id === shoeId ? { ...item, quantity: newQuantity } : item
                );

                // Recalculate the total with updated cart items
                calculateTotal(updatedItems); // Recalculate immediately after state update

                return updatedItems; // Return the updated items to update the state
            });

        } catch (error) {
            console.error('Error updating cart item:', error);
        }
    };

    // Remove item from cart
    const removeItemFromCart = async (shoeId) => {
        try {
            await axios.delete('http://localhost:8800/cart/remove', {
                data: { userId, shoeId },
            });
            setCartItems((prevItems) => {
                const updatedItems = prevItems.filter((item) => item.shoe_id !== shoeId);
                calculateTotal(updatedItems); // Recalculate total after removal
                return updatedItems; // Update the state with the updated cart
            });
        } catch (error) {
            console.error('Error removing item from cart:', error);
        }
    };

    // Handle checkout with only selected items
    const handleCheckOut = async () => {
        // Filter selected items from cart based on selectedItems state
        const selectedItemsData = cartItems.filter(item => selectedItems.includes(item.shoe_id));
    
        if (selectedItemsData.length === 0) {
            alert('Please select at least one item to proceed with the checkout!');
            return;
        }
        if (!shippingAddress || shippingAddress.trim() === "") {
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
            totalAmount: totalAmount,
            shippingAddress: shippingAddress, // Use the shipping address entered by the user
            paymentMethod: paymentMethod, // Include selected payment method
        };

        try {
            const response = await axios.post('http://localhost:8800/orders', orderData);
            console.log('Order Response:', response);
           
            // Clear the cart after successful checkout
            setCartItems([]);
            setTotal(0);
            setSelectedItems([]); // Clear selected items state
    
            alert("Order placed successfully!");
            Navigate("/home");
        } catch (error) {
            console.error('Error during checkout:', error);
            alert('An error occurred during checkout. Please try again.');
        }
    };

    // Handle checkbox change to toggle selection
    const handleCheckboxChange = (shoeId) => {
        setSelectedItems((prevSelected) => {
            if (prevSelected.includes(shoeId)) {
                return prevSelected.filter(id => id !== shoeId); // Deselect
            } else {
                return [...prevSelected, shoeId]; // Select
            }
        });
    };

    // Handle payment form submission
    const handleDebitCardSubmit = (e) => {
        e.preventDefault();
        alert("Debit Card Info submitted!");
        console.log(debitCardInfo);
        // Proceed with payment processing
    };

    const handleEWalletSubmit = (e) => {
        e.preventDefault();
        alert("E-Wallet Info submitted!");
        console.log(eWalletInfo);
        // Proceed with payment processing
    };

    return (
        <div>
            <h1>Your Shopping Cart</h1>
            <table>
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
                                    checked={selectedItems.includes(item.shoe_id)} // Check if item is selected
                                    onChange={() => handleCheckboxChange(item.shoe_id)} // Toggle selection
                                />
                            </td>
                            <td>{item.prod_name}</td>
                            <td>${item.price}</td>
                            <td>
                                <button
                                    onClick={() => updateCartItem(item.shoe_id, 'decrement')}
                                    disabled={item.quantity <= 1} // Disable the minus button when quantity is 1
                                >
                                    -
                                </button>
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
            <div>
                <h2>Total: ${total.toFixed(2)}</h2>
            </div>

            {/* Shipping address input */}
            <div>
                <label htmlFor="shippingAddress">Shipping Address:</label>
                <textarea
                    id="shippingAddress"
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)} // Update shipping address state
                    placeholder="Enter your shipping address"
                    rows="4"
                    cols="50"
                />
            </div>

            {/* Payment options */}
            <div>
                <label>Select Payment Method:</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    <option value="">Select Payment Method</option>
                    <option value="cod">Cash on Delivery</option>
                    <option value="debitCard">Debit/Credit Card</option>
                    <option value="eWallet">E-Wallet</option>
                </select>
            </div>

            {/* Debit Card form pop-up */}
            {paymentMethod === 'debitCard' && (
                <div className="payment-form">
                    <h3>Debit/Credit Card Details</h3>
                    <form onSubmit={handleDebitCardSubmit}>
                        <label>Card Number:</label>
                        <input
                            type="text"
                            value={debitCardInfo.cardNumber}
                            onChange={(e) => setDebitCardInfo({ ...debitCardInfo, cardNumber: e.target.value })}
                            required
                        />
                        <label>Expiry Date:</label>
                        <input
                            type="text"
                            value={debitCardInfo.expiryDate}
                            onChange={(e) => setDebitCardInfo({ ...debitCardInfo, expiryDate: e.target.value })}
                            required
                        />
                        <label>CVV:</label>
                        <input
                            type="text"
                            value={debitCardInfo.cvv}
                            onChange={(e) => setDebitCardInfo({ ...debitCardInfo, cvv: e.target.value })}
                            required
                        />
                        <button type="submit">Submit</button>
                    </form>
                </div>
            )}

            {/* E-Wallet form pop-up */}
            {paymentMethod === 'eWallet' && (
                <div className="payment-form">
                    <h3>E-Wallet Details</h3>
                    <form onSubmit={handleEWalletSubmit}>
                        <label>Wallet ID:</label>
                        <input
                            type="text"
                            value={eWalletInfo.walletId}
                            onChange={(e) => setEWalletInfo({ ...eWalletInfo, walletId: e.target.value })}
                            required
                        />
                        <label>Pin:</label>
                        <input
                            type="password"
                            value={eWalletInfo.pin}
                            onChange={(e) => setEWalletInfo({ ...eWalletInfo, pin: e.target.value })}
                            required
                        />
                        <button type="submit">Submit</button>
                    </form>
                </div>
            )}

            <div>
                <button><Link to="/home">Back to Home Page</Link></button>
            </div>
            <div>
                <button onClick={handleCheckOut}>Check Out</button>
            </div>
            <div>        
                <button type="button"><Link to ="/orders">View Order Status</Link></button>
            </div>
                                
        </div>
    );
};

export default Cart;
