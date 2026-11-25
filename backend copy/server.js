
const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("EVENTORA Backend is running successfully!");
});

// Test database connection
app.get("/api/test-db", async (req, res) => {
    try {
        await db.query("SELECT 1");
        res.json({
            success: true,
            message: "MySQL connected successfully!"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create database tables
app.get("/api/setup-database", async (req, res) => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS events (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(200) NOT NULL,
                category VARCHAR(100),
                event_date DATE NOT NULL,
                event_time TIME,
                venue VARCHAR(200),
                price DECIMAL(10,2) NOT NULL,
                total_seats INT NOT NULL,
                description TEXT,
                image LONGTEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS bookings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                event_id INT NOT NULL,
                ticket_block VARCHAR(50),
                quantity INT NOT NULL,
                total_amount DECIMAL(10,2) NOT NULL,
                booking_status VARCHAR(30) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS payments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                booking_id INT NOT NULL,
                payment_method VARCHAR(30) NOT NULL,
                transaction_id VARCHAR(150),
                amount DECIMAL(10,2) NOT NULL,
                payment_status VARCHAR(30) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        res.json({
            success: true,
            message: "EVENTORA database tables created successfully!"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`EVENTORA server running at http://localhost:${PORT}`);
});
