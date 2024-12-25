import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [userId, setUserId] = useState(localStorage.getItem('userID') || ''); // Correctly initialize userId

    useEffect(() => {
        if (userId) { // Only fetch cart items if userId exists
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
    }, [userId]); // Run the effect when userId changes

    // Calculate the total price of the cart
    const calculateTotal = (items) => {
        const totalAmount = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
        setTotal(totalAmount);
    };

    // Update quantity of a cart item
    const updateCartItem = async (shoeId, quantity) => {
        if (quantity <= 0) return; // Prevent removing by setting quantity to 0
        try {
            await axios.put('http://localhost:8800/cart/update', {
                userId,
                shoeId,
                quantity,
            });
            setCartItems((prevItems) =>
                prevItems.map((item) =>
                    item.shoe_id === shoeId ? { ...item, quantity } : item
                )
            );
            calculateTotal(cartItems);
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
            setCartItems((prevItems) => prevItems.filter((item) => item.shoe_id !== shoeId));
            calculateTotal(cartItems);
        } catch (error) {
            console.error('Error removing item from cart:', error);
        }
    };

    // Add item to cart
    const addItemToCart = async (shoeId, quantity) => {
        try {
            await axios.post('http://localhost:8800/cart/add', {
                userId,
                shoeId,
                quantity,
            });
            // After adding item, fetch updated cart items
            const response = await axios.get(`http://localhost:8800/cart/${userId}`);
            setCartItems(response.data);
            calculateTotal(response.data);
        } catch (error) {
            console.error('Error adding item to cart:', error);
        }
    };

    return (
        <div>
            <h1>Your Shopping Cart</h1>
            <table>
                <thead>
                    <tr>
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
                            <td>{item.prod_name}</td>
                            <td>${item.price}</td>
                            <td>
                                <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) =>
                                        updateCartItem(item.shoe_id, parseInt(e.target.value))
                                    }
                                />
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
            <div>
                <h3>Add Item to Cart</h3>
                <input
                    type="number"
                    placeholder="Shoe ID"
                    id="add-shoe-id"
                    required
                />
                <input
                    type="number"
                    placeholder="Quantity"
                    id="add-quantity"
                    required
                />
                <button
                    onClick={() => {
                        const shoeId = document.getElementById('add-shoe-id').value;
                        const quantity = document.getElementById('add-quantity').value;
                        addItemToCart(shoeId, quantity);
                    }}
                >
                    Add to Cart
                </button>
            </div>
        </div>
    );
};

export default Cart;
