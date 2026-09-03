const express = require("express");
const router = express.Router();

const { readData, writeData } = require("../utils/fileHandler");

const TASKS_FILE = "tasks.json";
const USERS_FILE = "users.json";

const VALID_PRIORITIES = ["low", "medium", "high"];

const VALID_STATUSES = [
    "pending",
    "in-progress",
    "completed"
];

// GET all tasks
// Supports:
// /api/tasks
// /api/tasks?status=pending
// /api/tasks?priority=high
// /api/tasks?userId=1
router.get("/", async (req, res) => {
    try {
        let tasks = await readData(TASKS_FILE);

        const { status, priority, userId } = req.query;

        // Filter by status
        if (status) {
            if (!VALID_STATUSES.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid status. Use: ${VALID_STATUSES.join(", ")}`
                });
            }

            tasks = tasks.filter(task => task.status === status);
        }

        // Filter by priority
        if (priority) {
            if (!VALID_PRIORITIES.includes(priority)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid priority. Use: ${VALID_PRIORITIES.join(", ")}`
                });
            }

            tasks = tasks.filter(task => task.priority === priority);
        }

        // Filter by user
        if (userId) {
            const numericUserId = Number(userId);

            if (Number.isNaN(numericUserId)) {
                return res.status(400).json({
                    success: false,
                    message: "userId must be a number"
                });
            }

            tasks = tasks.filter(
                task => task.assignedTo === numericUserId
            );
        }

        res.status(200).json({
            success: true,
            count: tasks.length,
            data: tasks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch tasks"
        });
    }
});

// GET single task
router.get("/:id", async (req, res) => {
    try {
        const tasks = await readData(TASKS_FILE);

        const id = Number(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Task ID must be a number"
            });
        }

        const task = tasks.find(task => task.id === id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        res.status(200).json({
            success: true,
            data: task
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch task"
        });
    }
});

// POST create task
router.post("/", async (req, res) => {
    try {
        const {
            title,
            description,
            priority,
            assignedTo,
            dueDate
        } = req.body;

        // Basic validation
        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Title is required"
            });
        }

        if (!priority) {
            return res.status(400).json({
                success: false,
                message: "Priority is required"
            });
        }

        if (!VALID_PRIORITIES.includes(priority)) {
            return res.status(400).json({
                success: false,
                message: `Priority must be: ${VALID_PRIORITIES.join(", ")}`
            });
        }

        if (assignedTo === undefined || assignedTo === null) {
            return res.status(400).json({
                success: false,
                message: "assignedTo is required"
            });
        }

        const numericAssignedTo = Number(assignedTo);

        if (Number.isNaN(numericAssignedTo)) {
            return res.status(400).json({
                success: false,
                message: "assignedTo must be a number"
            });
        }

        // Check user exists
        const users = await readData(USERS_FILE);

        const user = users.find(
            user => user.id === numericAssignedTo
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Assigned user does not exist"
            });
        }

        // Validate date
        if (dueDate) {
            const date = new Date(dueDate);

            if (Number.isNaN(date.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid due date"
                });
            }
        }

        const tasks = await readData(TASKS_FILE);

        const newId =
            tasks.length > 0
                ? Math.max(...tasks.map(task => task.id)) + 1
                : 1;

        const newTask = {
            id: newId,
            title: title.trim(),
            description: description
                ? description.trim()
                : "",
            priority,
            status: "pending",
            assignedTo: numericAssignedTo,
            dueDate: dueDate || null,
            createdAt: new Date().toISOString()
        };

        tasks.push(newTask);

        await writeData(TASKS_FILE, tasks);

        res.status(201).json({
            success: true,
            message: "Task created successfully",
            data: newTask
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create task"
        });
    }
});

// PUT update task
router.put("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Task ID must be a number"
            });
        }

        const tasks = await readData(TASKS_FILE);

        const taskIndex = tasks.findIndex(
            task => task.id === id
        );

        if (taskIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        const {
            title,
            description,
            priority,
            status,
            assignedTo,
            dueDate
        } = req.body;

        // Validate title
        if (title !== undefined) {
            if (!title.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Title cannot be empty"
                });
            }

            tasks[taskIndex].title = title.trim();
        }

        // Validate description
        if (description !== undefined) {
            tasks[taskIndex].description =
                description.trim();
        }

        // Validate priority
        if (priority !== undefined) {
            if (!VALID_PRIORITIES.includes(priority)) {
                return res.status(400).json({
                    success: false,
                    message: `Priority must be: ${VALID_PRIORITIES.join(", ")}`
                });
            }

            tasks[taskIndex].priority = priority;
        }

        // Validate status
        if (status !== undefined) {
            if (!VALID_STATUSES.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: `Status must be: ${VALID_STATUSES.join(", ")}`
                });
            }

            tasks[taskIndex].status = status;
        }

        // Validate assigned user
        if (assignedTo !== undefined) {
            const numericAssignedTo = Number(assignedTo);

            if (Number.isNaN(numericAssignedTo)) {
                return res.status(400).json({
                    success: false,
                    message: "assignedTo must be a number"
                });
            }

            const users = await readData(USERS_FILE);

            const user = users.find(
                user => user.id === numericAssignedTo
            );

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "Assigned user does not exist"
                });
            }

            tasks[taskIndex].assignedTo =
                numericAssignedTo;
        }

        // Validate due date
        if (dueDate !== undefined) {
            if (dueDate !== null) {
                const date = new Date(dueDate);

                if (Number.isNaN(date.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid due date"
                    });
                }
            }

            tasks[taskIndex].dueDate = dueDate;
        }

        await writeData(TASKS_FILE, tasks);

        res.status(200).json({
            success: true,
            message: "Task updated successfully",
            data: tasks[taskIndex]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update task"
        });
    }
});

// DELETE task
router.delete("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Task ID must be a number"
            });
        }

        const tasks = await readData(TASKS_FILE);

        const taskIndex = tasks.findIndex(
            task => task.id === id
        );

        if (taskIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        const deletedTask = tasks[taskIndex];

        tasks.splice(taskIndex, 1);

        await writeData(TASKS_FILE, tasks);

        res.status(200).json({
            success: true,
            message: "Task deleted successfully",
            data: deletedTask
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete task"
        });
    }
});

module.exports = router;
