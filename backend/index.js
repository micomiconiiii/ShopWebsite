import express from "express";
import mysql from "mysql";
import bcrypt from "bcrypt"; // for password hashing
import jwt from "jsonwebtoken"; // for generating JWT
import cors from 'cors';

const app = express();
const SECRET_KEY = 'your_secret_key'; // secret for JWT

app.use(express.json());
app.use(cors());

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
                return res.status(500).json({ error: "Error while registering the user" });
            }

            // Send role in the response
            return res.status(200).json({ 
                message: "User registered successfully", 
                role: role 
            });
        });

    } catch (error) {
        return res.status(500).json({ error: "Error during password hashing" });
    }
});

// Login Route
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    const query = "SELECT * FROM users WHERE email = ?";
    db.query(query, [email], (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length === 0) return res.status(401).json("Invalid credentials");

        const user = results[0];

        // Compare hashed password with the one in the database
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err || !isMatch) return res.status(401).json("Invalid credentials");

            // Create a JWT token including user role
            const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: "1h" });

            return res.json({ message: "Login successful", token, role: user.role });
        });
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
