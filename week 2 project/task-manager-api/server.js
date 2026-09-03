const express = require("express");
const path = require("path");

const usersRouter = require("./routes/users");
const tasksRouter = require("./routes/tasks");

const app = express();

const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// API routes
app.use("/api/users", usersRouter);
app.use("/api/tasks", tasksRouter);

// API home
app.get("/api", (req, res) => {
    res.json({
        success: true,
        message: "Task Manager API is running",
        endpoints: {
            users: "/api/users",
            tasks: "/api/tasks"
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err);

    res.status(500).json({
        success: false,
        message: "Internal server error"
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
