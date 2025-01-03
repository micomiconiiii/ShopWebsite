import express from "express";
import mysql from "mysql";
import bcrypt from "bcrypt"; // for password hashing
import jwt from "jsonwebtoken"; // for generating JWT
import cors from 'cors';
import session from 'express-session';
const app = express();



app.use(session({
    secret: 'your_secret_key', // Change this to a strong, unique secret
    resave: false,            // Avoid resaving session if it wasn't modified
    saveUninitialized: true, // Don't save uninitialized sessions
    cookie: {
        maxAge: 3600000, // 1 hour (in milliseconds)
        httpOnly: true,        // Prevents client-side scripts from accessing cookies
        secure: false          // Set to true if using HTTPS
    }
}));

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000', // Your frontend URL
    credentials: true,  // Allow cookies and credentials in requests
  }));

const db = mysql.createConnection({
    host: "localhost", 
    user: "root",
    password: "mico",
    database: "marketplace"
});

// Registration Route
app.post("/register", (req, res) => {
    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password || !role) {
        return res.status(400).json({ error: "All fields are required" });
    }

    // Hash the password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error("Error during password hashing:", err);
            return res.status(500).json({ error: "Error during password hashing" });
        }

        // Insert the new user into the database
        const query = "INSERT INTO users (name, email, password, created_at, role) VALUES (?)";
        const values = [name, email, hashedPassword, new Date(), role];

        db.query(query, [values], (err, result) => {
            if (err) {
                console.error("Error while registering the user:", err);
                return res.status(500).json({ error: "Error while registering the user" });
            }

            // Retrieve the auto-incremented userID
            const userID = result.insertId;

            // Generate a JWT token
            const token = jwt.sign(
                {
                    id: userID,
                    role: role,
                    name: name,
                },
                "your-secret-key", // Replace with your secret key
                { expiresIn: "1h" }
            );

            // Store user data in session if needed (optional)
            req.session.user = {
                id: userID,
                name: name,
                role: role,
            };

            // Return the token and user details to the client
            return res.status(200).json({
                message: "User registered successfully",
                userID: userID,
                userName: name,
                role: role,
                token,
            });
        });
    });
});



app.post("/login", (req, res) => {
    const { email, password } = req.body;

    const query = "SELECT * FROM users WHERE email = ?";
    db.query(query, [email], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (results.length === 0) return res.status(401).json({ error: "Invalid credentials" });

        const user = results[0];

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) return res.status(500).json({ error: "Password comparison failed" });
            if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

            // Generate a JWT token
            const token = jwt.sign(
                {
                    id: user.userID,
                    role: user.role,
                    name: user.name,
                },
                "your-secret-key", // password key
                { expiresIn: "1h" } // Token expiry time
            );

            // Store user data in session if needed (optional)
            req.session.user = {
                id: user.userID,
                name: user.name,
                role: user.role,
            };

            // Return the token and user details to the client
            
            res.json({
                message: "Login successful",
                role: user.role,
                name: user.name,
                userID: user.userID,
                token, // Send the token to the client
            });
        });
    });
});
app.put("/user/update-password/:userId", (req, res) => {
    const { userId } = req.params;
    const { newPassword } = req.body;

    // Hash the new password
    bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
        if (err) return res.status(500).json({ error: "Error hashing password" });

        // Update the password in the database
        const query = "UPDATE users SET password = ? WHERE userID = ?";
        db.query(query, [hashedPassword, userId], (err, results) => {
            if (err) return res.status(500).json({ error: "Database error" });

            if (results.affectedRows > 0) {
                return res.json({ success: true, message: "Password updated successfully" });
            } else {
                return res.status(400).json({ error: "Failed to update password" });
            }
        });
    });
});


app.post("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: "Failed to log out" });
        }
        res.clearCookie('connect.sid'); // Clear the session cookie
        res.json({ message: "Logged out successfully" });
    });
});


// product routes
app.get("/shoes", (req, res) => {
    const q = "SELECT * FROM shoes";
    db.query(q, (err, data) => {
        if (err) return res.json(err);
        return res.json(data);
    });
});
const isAuthenticated = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', ''); // Get the token from Authorization header

    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    try {
        const decoded = jwt.verify(token, 'your-secret-key'); // Verify the token with the secret key
        req.user = decoded; // Attach the decoded user data to the request object
        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        console.error("Token verification failed:", err); // Log token verification error
        return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
    }
};

app.get("/home", isAuthenticated, (req, res) => {
    const userId = req.params.userId;
    const userQuery = `SELECT * FROM users WHERE userID = ?`;

    db.query(userQuery, [userId], (err, userResults) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: "Failed to fetch user details", details: err });
        }
        if (userResults.length === 0) {
            console.warn(`User with ID ${userId} not found`);
            return res.status(404).json({ error: "User not found" });
        }

        console.log("User fetched successfully:", userResults[0]);
        res.status(200).json(userResults[0]);
    });
});

app.post("/user/verify-password", (req, res) => {
    const { userId, password } = req.body;

    // Validate input
    if (!userId || !password) {
        return res.status(400).json({ error: "User ID and password are required" });
    }

    // Define the query to fetch the stored password for the given user ID
    const query = "SELECT password FROM users WHERE userID = ?";

    // Execute the query
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error("Database error during password verification:", err);
            return res.status(500).json({ error: "Database error" });
        }

        // Check if the user exists
        if (results.length === 0) {
            console.error(`User not found with userId: ${userId}`);
            return res.status(404).json({ error: "User not found" });
        }

        const storedPassword = results[0].password;
        
        // Compare the provided password with the stored password
        bcrypt.compare(password, storedPassword, (err, isMatch) => {
            if (err) {
                console.error("Error during bcrypt comparison:", err);
                return res.status(500).json({ error: "Password comparison failed" });
            }

            // If passwords don't match
            if (!isMatch) {
                console.error(`Password mismatch for userId: ${userId}`);
                return res.status(401).json({ error: "Invalid password" });
            }

            // If passwords match, return success
            console.log(`Password verified successfully for userId: ${userId}`);
            return res.status(200).json({ success: true });
        });
    });
});

app.get("/user/:userId", isAuthenticated, (req, res) => {
    const userId = req.params.userId;
    console.log("Received request to fetch user:", userId);

    const userQuery = `SELECT * FROM users WHERE userID = ?`;
    db.query(userQuery, [userId], (err, userResults) => {
        if (err) {
            console.error("Database Error:", err.message);
            return res.status(500).json({ error: "Failed to fetch user details" });
        }
        if (!userResults.length) {
            console.warn(`User with ID ${userId} not found`);
            return res.status(404).json({ error: `User with ID ${userId} not found` });
        }

        console.log("User fetched successfully:", userResults[0]);
        res.status(200).json(userResults[0]);
    });
});



app.post("/shoes", (req, res) => {
    const q = "INSERT INTO shoes (`prod_name`, `prod_description`, `image`, `price`, `stock`) VALUES (?)";
    const values = [
        req.body.prod_name,
        req.body.prod_description,
        req.body.image,
        req.body.price,
        req.body.stock
    ];

    db.query(q, [values], (err, data) => {
        if (err) return res.json(err);
        return res.json("Successfully executed");
    });
});

// Other CRUD routes (for DELETE, PUT, etc.) 

app.listen(8800, () => {
    console.log("Backend connected on port 8800");
});
// deletes the product based on the ID
app.delete("/shoes/:id", (req,res)=>{
    const shoeId = req.params.id;
    const q = "DELETE FROM shoes WHERE id = ?" // executes sql statements for deleting items
    db.query(q, [shoeId], (err, data)=>{
        if (err) return res.json(err)
        return res.json("Successfully executed")
    })
})

// updates the product based on the ID without requiring all fields to be populated
app.put("/shoes/:id", async (req, res) => {
    const shoeId = req.params.id;
    const { prod_name, prod_description, image, price, stock } = req.body;

    // Validate input data
    if (price && isNaN(price)) {
        return res.status(400).json({ error: "Price must be a valid number" });
    }

    if (stock && stock < 0) {
        return res.status(400).json({ error: "Stock cannot be negative" });
    }

    // Create the SET clause based on provided fields
    const updates = [];
    const values = [];

    if (prod_name) {
        updates.push("prod_name = ?");
        values.push(prod_name);
    }

    if (prod_description) {
        updates.push("prod_description = ?");
        values.push(prod_description);
    }

    if (image) {
        updates.push("image = ?");
        values.push(image);
    }

    if (price) {
        updates.push("price = ?");
        values.push(price);
    }

    if (stock !== undefined) {
        updates.push("stock = ?");
        values.push(stock);
    }

    // If no values to update, return an error
    if (updates.length === 0) {
        return res.status(400).json({ error: "No valid fields to update" });
    }

    // Add the shoe ID to the values array
    values.push(shoeId);

    // Construct the SQL query
    const query = `UPDATE shoes SET ${updates.join(", ")} WHERE id = ?`;

    // Execute the update query
    db.query(query, values, (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Error updating the shoe" });
        }

        return res.json({ message: "Shoe updated successfully" });
    });
});

// Route to get a single shoe by id
app.get("/shoes/:id", (req, res) => {
    const shoeId = req.params.id;
    const query = "SELECT * FROM shoes WHERE id = ?";
    
    db.query(query, [shoeId], (err, data) => {
        if (err) return res.status(500).json({ error: "Error fetching shoe data" });
        if (data.length === 0) return res.status(404).json({ error: "Shoe not found" });
        
        return res.json(data[0]); // Return the first (and only) matching shoe
    });
});


// cart class
// Add item to cart or update existing item
app.post('/cart/add', (req, res) => {
    const { userId, shoeId, quantity, cost } = req.body;

    // Check if the user already has this shoe in their cart
    const checkSql = `SELECT * FROM cart_items WHERE user_id = ? AND shoe_id = ?`;
    db.query(checkSql, [userId, shoeId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.length > 0) {
            // If the shoe is already in the cart, update the quantity
            const newQuantity = result[0].quantity + quantity;
            const newCost = result[0].cost * newQuantity;
            const updateSql = `UPDATE cart_items SET quantity = ?, cost = ? WHERE user_id = ? AND shoe_id = ?`;
            db.query(updateSql, [newQuantity, newCost, userId, shoeId], (err, updateResult) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ message: 'Cart item updated' });
            console.log('New Quantity:', newQuantity);
            console.log('New Cost:', newCost);

            });

        } else {
            // If the shoe is not in the cart, insert it as a new item
            const insertSql = `INSERT INTO cart_items (user_id, shoe_id, quantity, cost) VALUES (?, ?, ?, ?)`;
            db.query(insertSql, [userId, shoeId, quantity, cost], (err, insertResult) => {
                if (err) return res.status(500).json({ error: err.message });
                res.status(201).json({ message: 'Item added to cart' });
            });
        }
    });
});

  
  // Get cart items for a user
  app.get('/cart/:userId', (req, res) => {
    const userId = req.params.userId;
    const sql = `SELECT * FROM cart_items JOIN shoes ON cart_items.shoe_id = shoes.id WHERE user_id = ?`;
    db.query(sql, [userId], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(200).json(results);
    });
  });
  
  // Update cart item
app.put('/cart/update', (req, res) => {
    const { userId, shoeId, quantity, cost } = req.body;

    // Ensure all required fields are available
    if (typeof quantity !== 'number' || typeof cost !== 'number') {
        return res.status(400).json({ error: 'Invalid quantity or cost' });
    }

    const updateSql = `UPDATE cart_items SET quantity = ?, cost = ? WHERE user_id = ? AND shoe_id = ?`;

    // Execute the update query with the correct values
    db.query(updateSql, [quantity, cost, userId, shoeId], (err, updateResult) => {
        if (err) return res.status(500).json({ error: err.message });

        // Check if any rows were affected (i.e., the update was successful)
        if (updateResult.affectedRows === 0) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        res.status(200).json({ message: 'Cart item updated' });
    });
});

  // Remove item from cart
  app.delete('/cart/remove', (req, res) => {
    const { userId, shoeId } = req.body;
    const sql = `DELETE FROM cart_items WHERE user_id = ? AND shoe_id = ?`;
    db.query(sql, [userId, shoeId], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(200).json({ message: 'Item removed from cart' });
    });
  });
  
// Remove user
app.delete('/user/remove/:userID', (req, res) => {
    const userID = req.params.userID;

    const deleteCartItems = `DELETE FROM cart_items WHERE user_id = ?`;
    const deleteUser = `DELETE FROM users WHERE userID = ?`;

    db.query(deleteCartItems, [userID], (err) => {
        if (err) {
            console.error('Error deleting cart items:', err.message);
            return res.status(500).json({ error: 'Failed to delete cart items' });
        }

        db.query(deleteUser, [userID], (err, result) => {
            if (err) {
                console.error('Error deleting user:', err.message);
                return res.status(500).json({ error: 'Failed to delete user' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.status(200).json({ message: 'Account deleted successfully' });
        });
    });
});

// order

app.post("/orders", (req, res) => {
    const { userID, orderDate, status, items, totalAmount, shippingAddress } = req.body;

    // Ensure orderDate is a valid format (convert to ISO string if necessary)
    const formattedOrderDate = new Date(orderDate).toISOString().slice(0, 19).replace('T', ' ');

    const q = "INSERT INTO orders (userID, orderDate, status, items, totalAmount, shippingAddress) VALUES (?, ?, ?, ?, ?, ?)";
    const values = [
        userID,
        formattedOrderDate,  // Ensure it's a valid ISO string
        status,
        JSON.stringify(items),  // Store items as a JSON string
        totalAmount,
        shippingAddress,
    ];

    db.query(q, values, (err, data) => {
        if (err) {
            console.error('Error during order creation:', err);  // Log the actual error
            return res.status(500).json({ error: "Error creating order", details: err.message });
        }

        return res.status(200).json({ message: "Order created successfully", orderID: data.insertId });
    });
});

app.get("/orders", (req, res) => {
    const q = `
        SELECT orders.*, users.name 
        FROM orders
        JOIN users ON orders.userID = users.userID
    `; // Query to retrieve all orders and corresponding user names
    
    db.query(q, (err, data) => {
        if (err) return res.json(err);
        return res.json(data);
    });
});

app.get("/orders/:userId", (req, res) => {
    const userId = req.params.userId;
    const q = `SELECT * FROM orders WHERE userId = ?`; // Query to retrieve all orders from the database
    
    db.query(q, userId, (err, data) => {
        if (err) {
            console.error('Error retrieving orders:', err);
            return res.status(500).json({ error: "Error retrieving orders", details: err.message });
        }

        return res.status(200).json({ orders: data });
    });
});

app.delete("/orders/remove/:orderID", (req, res) =>{
    const orderID = req.params.orderID;
    const sql = "DELETE FROM orders WHERE orderID = ?";

    db.query(sql, orderID, (err)=>{
        if (err) return res.status(500).json({ orderID });
      res.status(200).json({ message: 'Item removed from cart' });
    });
});
app.put('/orders/update-item/:orderID', (req, res) => {
    const { orderID } = req.params;
    const { status, shippingAddress, items } = req.body;
   
    // Update the orders table
    db.query(
        'UPDATE orders SET status = ?, shippingAddress = ? WHERE orderID = ?',
        [status, shippingAddress, orderID],
        (err, results) => {
            if (err) {
                return res.status(500).send('Error updating order');
            }

            // If status is delivered, update the stock
            if (status === 'Delivered' && items) {
                try {
                    const parsedItems = Array.isArray(items) ? items : JSON.parse(items);

                    const updateStockPromises = parsedItems.map(item => {
                        console.log(`Updating stock for productID: ${item.productID} with quantity: ${item.quantity}`);
                        return new Promise((resolve, reject) => {
                            db.query(
                                'UPDATE shoes SET stock = stock - ? WHERE id = ?',
                                [item.quantity, item.productID],
                                (err) => {
                                    if (err) {
                                        console.error(`Error updating stock for productID ${item.productID}:`, err);
                                        reject(err);
                                    } else {
                                        resolve();
                                    }
                                }
                            );
                        });
                    });
                    
                    Promise.all(updateStockPromises)
                        .then(() => {
                            res.send('Order updated and stock adjusted successfully');
                        })
                        .catch(stockErr => {
                            console.error('Error updating stock:', stockErr);
                            res.status(500).send('Error updating stock');
                        });
                } catch (parseError) {
                    console.error('Error parsing items:', parseError);
                    res.status(500).send('Invalid items data');
                }
            } else {
                res.send('Order updated successfully');
            }
        }
    );
});



app.get('/showusers', (req, res) => {
    const q = "SELECT * FROM users";
    db.query(q, (err,data)=>{
        if(err) return res.json(err);
        return res.json(data);
    });

    
});

app.post('/reviews', async (req, res) => {
    const { productID, userID, rating, comment } = req.body;

    if (!productID || !userID || !rating) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const sql = `
            INSERT INTO reviews (productID, userID, rating, comment)
            VALUES (?, ?, ?, ?)
        `;
        const values = [productID, userID, rating, comment || null];

        db.query(sql, values, (err, result) => {
            if (err) {
                console.error('Error inserting review:', err);
                return res.status(500).json({ message: 'Database error' });
            }
            res.status(201).json({ message: 'Review added successfully', reviewID: result.insertId });
        });
    } catch (error) {
        console.error('Error in /reviews POST:', error);
        res.status(500).json({ message: 'Server error' });
    }
    });
    const getAverageRating = async (productID) => {
        return new Promise((resolve, reject) => {
        const query = `
            SELECT AVG(rating) AS averageRating
            FROM reviews
            WHERE productID = ?
        `;
    
        db.query(query, [productID], (err, results) => {
            if (err) {
            return reject(err);
            }
            // If there are no ratings for the product, return 0
            const averageRating = results[0].averageRating || 0;
            resolve(averageRating);
        });
        });
    };
    
    // Route to fetch average ratings for a product
    app.get('/reviews/average/:productID', async (req, res) => {
        const productID = parseInt(req.params.productID, 10);
    
        try {
        const averageRating = await getAverageRating(productID);
        console.log("average rating: " +averageRating);
        return res.json({ averageRating });
        } catch (err) {
        console.error('Error fetching average rating:', err);
        return res.status(500).json({ message: 'Server error' });
        }
    });


