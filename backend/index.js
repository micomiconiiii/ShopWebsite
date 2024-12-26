import express from "express";
import mysql from "mysql";
import bcrypt from "bcrypt"; // for password hashing
import jwt from "jsonwebtoken"; // for generating JWT
import cors from 'cors';
import session from 'express-session';
const app = express();
const SECRET_KEY = 'your_secret_key'; // secret for JWT



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
app.post("/register", async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        // Hash password before storing it in the database
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const query = "INSERT INTO users (name, email, password, created_at, role) VALUES (?)";
        const values = [name, email, hashedPassword, new Date(), role];

        db.query(query, [values], (err, data) => {
            if (err) {
                console.error("Error while registering the user:", err);
                return res.status(500).json({ error: "Error while registering the user" });
            }

            // Retrieve the auto-incremented userID
            const userID = data.insertId;

            // Send back the userID and role in the response
            return res.status(200).json({
                message: "User registered successfully",
                userID: userID,
                name: name,
                role: role
            });
        });

    } catch (error) {
        console.error("Error during password hashing:", error);
        return res.status(500).json({ error: "Error during password hashing" });
    }
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

app.get("/home/:userId", isAuthenticated, (req, res) => {
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

app.get("/user/:userId", isAuthenticated, (req, res) => {
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

        // Assuming you only need the first user from the results array
        console.log("User fetched successfully:", userResults[0]);
        res.status(200).json(userResults[0]);  // Sending the user data back
    });
});


app.post("/shoes", (req, res) => {
    const q = "INSERT INTO shoes (`prod_name`, `prod_description`, `image`, `price`) VALUES (?)";
    const values = [
        req.body.prod_name,
        req.body.prod_description,
        req.body.image,
        req.body.price
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
// Add item to cart
app.post('/cart/add', (req, res) => {
    const { userId, shoeId, quantity } = req.body;
    const sql = `INSERT INTO cart_items (user_id, shoe_id, quantity) VALUES (?, ?, ?)`;
    db.query(sql, [userId, shoeId, quantity], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Item added to cart' });
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
    const { userId, shoeId, quantity } = req.body;
    const sql = `UPDATE cart_items SET quantity = ? WHERE user_id = ? AND shoe_id = ?`;
    db.query(sql, [quantity, userId, shoeId], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
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
