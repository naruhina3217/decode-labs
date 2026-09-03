const taskForm = document.getElementById("taskForm");

const tasksContainer =
    document.getElementById("tasksContainer");

const assignedTo =
    document.getElementById("assignedTo");

const message =
    document.getElementById("message");


// Load users
async function loadUsers() {

    try {

        const response = await fetch("/api/users");

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message);
        }

        assignedTo.innerHTML = "";

        result.data.forEach(user => {

            const option =
                document.createElement("option");

            option.value = user.id;

            option.textContent =
                `${user.name} (${user.email})`;

            assignedTo.appendChild(option);

        });

    } catch (error) {

        console.error(error);

    }
}


// Load tasks
async function loadTasks() {

    try {

        const status =
            document.getElementById("statusFilter").value;

        const priority =
            document.getElementById("priorityFilter").value;

        let url = "/api/tasks";

        const params = new URLSearchParams();

        if (status) {
            params.append("status", status);
        }

        if (priority) {
            params.append("priority", priority);
        }

        if (params.toString()) {
            url += "?" + params.toString();
        }

        const response = await fetch(url);

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message);
        }

        displayTasks(result.data);

    } catch (error) {

        tasksContainer.innerHTML = `
            <p class="error">
                ${error.message}
            </p>
        `;

    }
}


// Display tasks
function displayTasks(tasks) {

    if (tasks.length === 0) {

        tasksContainer.innerHTML = `
            <p>No tasks found.</p>
        `;

        return;
    }

    tasksContainer.innerHTML = "";

    tasks.forEach(task => {

        const taskElement =
            document.createElement("div");

        taskElement.className = "task";

        taskElement.innerHTML = `

            <h3>${escapeHTML(task.title)}</h3>

            <p>
                ${escapeHTML(task.description || "No description")}
            </p>

            <p>
                <strong>Due:</strong>
                ${task.dueDate || "No due date"}
            </p>

            <div class="badges">

                <span class="badge priority-${task.priority}">
                    ${task.priority.toUpperCase()}
                </span>

                <span class="badge status-${task.status}">
                    ${task.status}
                </span>

            </div>

            <div class="task-actions">

                <button
                    onclick="completeTask(${task.id})"
                >
                    Mark Complete
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteTask(${task.id})"
                >
                    Delete
                </button>

            </div>
        `;

        tasksContainer.appendChild(taskElement);

    });
}


// Create task
taskForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const taskData = {

        title:
            document.getElementById("title").value,

        description:
            document.getElementById("description").value,

        priority:
            document.getElementById("priority").value,

        assignedTo:
            Number(
                document.getElementById("assignedTo").value
            ),

        dueDate:
            document.getElementById("dueDate").value || null

    };

    try {

        const response = await fetch("/api/tasks", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(taskData)

        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        message.textContent =
            "Task created successfully!";

        message.className = "success";

        taskForm.reset();

        loadTasks();

    } catch (error) {

        message.textContent = error.message;

        message.className = "error";

    }

});


// Mark task as completed
async function completeTask(id) {

    try {

        const response = await fetch(
            `/api/tasks/${id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    status: "completed"
                })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        loadTasks();

    } catch (error) {

        alert(error.message);

    }
}


// Delete task
async function deleteTask(id) {

    const confirmed =
        confirm("Are you sure you want to delete this task?");

    if (!confirmed) {
        return;
    }

    try {

        const response =
            await fetch(`/api/tasks/${id}`, {
                method: "DELETE"
            });

        const result =
            await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        loadTasks();

    } catch (error) {

        alert(error.message);

    }
}


// Basic HTML escaping
function escapeHTML(value) {

    const div = document.createElement("div");

    div.textContent = value;

    return div.innerHTML;
}


// Initial loading
loadUsers();
loadTasks();
