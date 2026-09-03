const express = require("express");
const router = express.Router();

const { readData, writeData } = require("../utils/fileHandler");

const USERS_FILE = "users.json";

// GET all users
router.get("/", async (req, res) => {
    try {
        const users = await readData(USERS_FILE);

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch users"
        });
    }
});

// GET single user
router.get("/:id", async (req, res) => {
    try {
        const users = await readData(USERS_FILE);

        const id = Number(req.params.id);

        const user = users.find(user => user.id === id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch user"
        });
    }
});

// POST create user
router.post("/", async (req, res) => {
    try {
        const { name, email } = req.body;

        // Validation
        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Name is required"
            });
        }

        if (!email || !email.trim()) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }

        const users = await readData(USERS_FILE);

        // Check duplicate email
        const existingUser = users.find(
            user => user.email.toLowerCase() === email.toLowerCase()
        );

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already exists"
            });
        }

        const newId =
            users.length > 0
                ? Math.max(...users.map(user => user.id)) + 1
                : 1;

        const newUser = {
            id: newId,
            name: name.trim(),
            email: email.trim().toLowerCase()
        };

        users.push(newUser);

        await writeData(USERS_FILE, users);

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: newUser
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create user"
        });
    }
});

module.exports = router;
