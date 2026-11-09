import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const api = axios.create({
  baseURL: "http://localhost:9193",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

const TODO_STORAGE_KEY = "whitewise_admin_todos";

const emptyUserForm = {
  id: null,
  fullName: "",
  email: "",
  mobile: "",
  role: "USER",
};

const emptyAddUserForm = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  mobile: "",
  role: "USER",
};

const emptyTaskForm = {
  title: "",
  description: "",
  dueDate: "",
  priority: "Medium",
};

const readStoredTasks = () => {
  try {
    const stored = localStorage.getItem(TODO_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

function AdminDashboard() {
  const navigate = useNavigate();

  // =========================================================
  // EXISTING ADMIN DASHBOARD STATE
  // =========================================================

  const [users, setUsers] = useState([]);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [loginHistory, setLoginHistory] = useState({});

  const [form, setForm] = useState(emptyUserForm);
  const [addUserForm, setAddUserForm] = useState(emptyAddUserForm);

  const [reset, setReset] = useState({
    userId: null,
    newPassword: "",
  });

  const [error, setError] = useState("");
  const [showUsers, setShowUsers] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showLoginHistory, setShowLoginHistory] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showTodo, setShowTodo] = useState(false);

  // =========================================================
  // NEW TO-DO STATE
  // Tasks are stored in this browser's localStorage.
  // =========================================================

  const [tasks, setTasks] = useState(readStoredTasks);
  const [taskForm, setTaskForm] = useState(emptyTaskForm);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskSearch, setTaskSearch] = useState("");
  const [taskFilter, setTaskFilter] = useState("all");
  const [taskSort, setTaskSort] = useState("created");
  const [taskMessage, setTaskMessage] = useState("");

  // Persist tasks locally whenever they change.
  useEffect(() => {
    try {
      localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(tasks));
    } catch (err) {
      console.error("Could not save tasks:", err);
      setTaskMessage(
        "Tasks could not be saved. Check your browser storage settings."
      );
    }
  }, [tasks]);

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/loginpage", { replace: true });
  };

  // =========================================================
  // LOAD CURRENT ADMIN
  // =========================================================

  const loadCurrentAdmin = async () => {
    try {
      const res = await api.get("/admin/users/me");
      setCurrentAdmin(res.data);
    } catch (err) {
      console.error("Failed to load administrator:", err);
    }
  };

  // =========================================================
  // LOAD LOGIN HISTORY
  // =========================================================

  const loadLoginHistory = async () => {
    try {
      const res = await api.get("/admin/users/me/history");
      setLoginHistory(res.data || {});
    } catch (err) {
      console.error("Failed to load login history:", err);
    }
  };

  // =========================================================
  // LOAD USERS
  // =========================================================

  const loadUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(Array.isArray(res.data) ? res.data : []);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load users.");
    }
  };

  useEffect(() => {
    loadCurrentAdmin();
    loadLoginHistory();
  }, []);

  useEffect(() => {
    if (showUsers) {
      loadUsers();
    }
  }, [showUsers]);

  // =========================================================
  // UPDATE USER
  // =========================================================

  const updateUser = async () => {
    if (!form.id) {
      setError("Select a user from the table before updating.");
      return;
    }

    try {
      await api.put(`/admin/users/${form.id}`, form);

      setForm({ ...emptyUserForm });
      await loadUsers();
      setError("");
      alert("User updated successfully.");
    } catch (err) {
      console.error(err);
      setError("Update failed.");
    }
  };

  // =========================================================
  // DELETE USER
  // =========================================================

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      await api.delete(`/admin/users/${id}`);
      await loadUsers();
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to delete user.");
    }
  };

  // =========================================================
  // RESET USER PASSWORD
  // =========================================================

  const resetPassword = async () => {
    if (!reset.newPassword.trim()) {
      setError("Enter a new password.");
      return;
    }

    try {
      await api.put(`/admin/users/${reset.userId}/password`, {
        newPassword: reset.newPassword,
      });

      alert("Password reset successful.");

      setReset({
        userId: null,
        newPassword: "",
      });

      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to reset password.");
    }
  };

  // =========================================================
  // ADD USER
  // =========================================================

  const addUser = async () => {
    const {
      fullName,
      email,
      password,
      confirmPassword,
      mobile,
    } = addUserForm;

    if (
      !fullName.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword ||
      !mobile.trim()
    ) {
      setError("Please fill in all user fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await api.post("/auth/signup", addUserForm);

      alert("User added successfully.");

      setAddUserForm({ ...emptyAddUserForm });
      setShowAddUser(false);
      setError("");

      await loadUsers();
    } catch (err) {
      console.error(err);
      setError("Failed to add user.");
    }
  };

  // =========================================================
  // TO-DO HELPERS
  // =========================================================

  const openNewTaskForm = () => {
    setTaskForm({ ...emptyTaskForm });
    setEditingTaskId(null);
    setShowTaskForm(true);
    setTaskMessage("");
  };

  const closeTaskForm = () => {
    setTaskForm({ ...emptyTaskForm });
    setEditingTaskId(null);
    setShowTaskForm(false);
  };

  const saveTask = (e) => {
    e.preventDefault();

    const title = taskForm.title.trim();

    if (!title) {
      setTaskMessage("Please enter a task title.");
      return;
    }

    const now = new Date().toISOString();

    if (editingTaskId !== null) {
      setTasks((previousTasks) =>
        previousTasks.map((task) =>
          task.id === editingTaskId
            ? {
                ...task,
                title,
                description: taskForm.description.trim(),
                dueDate: taskForm.dueDate,
                priority: taskForm.priority,
                updatedAt: now,
              }
            : task
        )
      );

      setTaskMessage("Task updated successfully.");
    } else {
      const newTask = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        title,
        description: taskForm.description.trim(),
        dueDate: taskForm.dueDate,
        priority: taskForm.priority,
        completed: false,
        important: false,
        createdAt: now,
      };

      setTasks((previousTasks) => [newTask, ...previousTasks]);
      setTaskMessage("Task created successfully.");
    }

    closeTaskForm();
  };

  const editTask = (task) => {
    setEditingTaskId(task.id);

    setTaskForm({
      title: task.title || "",
      description: task.description || "",
      dueDate: task.dueDate || "",
      priority: task.priority || "Medium",
    });

    setShowTaskForm(true);
    setTaskMessage("");
  };

  const toggleTaskCompleted = (id) => {
    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  const toggleTaskImportant = (id) => {
    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === id
          ? { ...task, important: !task.important }
          : task
      )
    );
  };

  const deleteTask = (id) => {
    if (!window.confirm("Delete this task permanently?")) {
      return;
    }

    setTasks((previousTasks) =>
      previousTasks.filter((task) => task.id !== id)
    );

    setTaskMessage("Task deleted.");
  };

  const clearCompletedTasks = () => {
    const completedCount = tasks.filter((task) => task.completed).length;

    if (!completedCount) {
      setTaskMessage("There are no completed tasks to clear.");
      return;
    }

    if (
      !window.confirm(
        `Delete all ${completedCount} completed task(s)?`
      )
    ) {
      return;
    }

    setTasks((previousTasks) =>
      previousTasks.filter((task) => !task.completed)
    );

    setTaskMessage("Completed tasks cleared.");
  };

  // =========================================================
  // TO-DO CALCULATIONS AND FILTERING
  // =========================================================

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const importantTasks = tasks.filter(
    (task) => task.important && !task.completed
  ).length;

  const completionPercentage =
    totalTasks === 0
      ? 0
      : Math.round((completedTasks / totalTasks) * 100);

  const today = new Date();
  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  const filteredTasks = tasks
    .filter((task) => {
      const search = taskSearch.toLowerCase();

      const matchesSearch =
        (task.title || "").toLowerCase().includes(search) ||
        (task.description || "").toLowerCase().includes(search);

      if (!matchesSearch) return false;

      switch (taskFilter) {
        case "today":
          return task.dueDate === todayString && !task.completed;

        case "important":
          return task.important;

        case "completed":
          return task.completed;

        case "pending":
          return !task.completed;

        case "overdue":
          return (
            !task.completed &&
            task.dueDate &&
            task.dueDate < todayString
          );

        default:
          return true;
      }
    })
    .sort((a, b) => {
      if (taskSort === "dueDate") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }

      if (taskSort === "priority") {
        const priorityOrder = {
          High: 3,
          Medium: 2,
          Low: 1,
        };

        return (
          (priorityOrder[b.priority] || 0) -
          (priorityOrder[a.priority] || 0)
        );
      }

      if (taskSort === "title") {
        return a.title.localeCompare(b.title);
      }

      // Newest first.
      return (
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
      );
    });

  const formatTaskDate = (dateString) => {
    if (!dateString) return "No due date";

    const date = new Date(`${dateString}T00:00:00`);

    return date.toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // =========================================================
  // EXISTING MANAGEMENT LINKS
  // =========================================================

  const dashboardLinks = [
    {
      title: "Customer Services",
      description: "Manage customer service activities",
      path: "/customer-services",
      color: "primary",
      icon: "bi-headset",
    },
    {
      title: "Sales",
      description: "Access sales management",
      path: "/sales",
      color: "success",
      icon: "bi-graph-up-arrow",
    },
    {
      title: "Orders",
      description: "View and manage orders",
      path: "/orders",
      color: "warning",
      icon: "bi-bag-check",
    },
    {
      title: "Products",
      description: "Manage products",
      path: "/products",
      color: "info",
      icon: "bi-box-seam",
    },
    {
      title: "Catalog Products",
      description: "Browse and view catalog products",
      path: "/catalog",
      color: "warning",
      icon: "bi-shop",
    },
    {
      title: "Inventory",
      description: "Monitor available stock",
      path: "/inventory",
      color: "secondary",
      icon: "bi-clipboard-data",
    },
    {
      title: "Dashboard",
      description: "Open the main room dashboard",
      path: "/dashboard",
      color: "dark",
      icon: "bi-speedometer2",
    },
    {
      title: "User Activity History",
      description: "Monitor staff activities and login history",
      path: "/admin/activity-history",
      color: "primary",
      icon: "bi-clock-history",
    },
    {
      title: "Finished Products",
      description: "Manage finished products",
      path: "/finishedproduct",
      color: "danger",
      icon: "bi-boxes",
    },
  ];

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="admin-layout d-flex">
      {/* SIDEBAR */}

      <aside
        className={`sidebar bg-dark text-white ${
          sidebarCollapsed ? "collapsed" : ""
        }`}
      >
        <div className="sidebar-header d-flex align-items-center justify-content-between px-3 py-3">
          <div className="d-flex align-items-center gap-2">
            <span className="logo-badge">WHITEWISE</span>

            {!sidebarCollapsed && (
              <span className="fw-bold fs-5">ADMIN DASHBOARD</span>
            )}
          </div>
        </div>

        {currentAdmin && (
          <div className="sidebar-user px-3 py-3 border-bottom border-secondary">
            <div className="d-flex align-items-center gap-3">
              <img
                src={
                  currentAdmin.profilePictureBase64 ||
                  "https://via.placeholder.com/48"
                }
                alt="Profile"
                className="rounded-circle"
                style={{
                  width: 48,
                  height: 48,
                  objectFit: "cover",
                }}
              />

              {!sidebarCollapsed && (
                <div className="overflow-hidden">
                  <div className="fw-semibold text-truncate">
                    {currentAdmin.fullName}
                  </div>
                  <small className="text-white-50">Administrator</small>
                </div>
              )}
            </div>
          </div>
        )}

        <nav className="sidebar-nav flex-grow-1 py-3">
          <ul className="nav flex-column">
            <li className="nav-item">
              <span className="nav-section-title px-3 text-uppercase text-white-50 small">
                Pages
              </span>
            </li>

            <li className="nav-item">
              <a
                href="#!"
                className={`nav-link d-flex align-items-center gap-2 ${
                  !showTodo && !showUsers ? "active" : ""
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  setShowTodo(false);
                  setShowUsers(false);
                }}
              >
                <i className="bi bi-speedometer2" />
                {!sidebarCollapsed && <span>Dashboards</span>}
              </a>
            </li>

            <li className="nav-item">
              <a
                href="#!"
                className={`nav-link d-flex align-items-center gap-2 ${
                  showTodo ? "active" : ""
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  setShowTodo(true);
                  setShowUsers(false);
                  setTimeout(() => {
                    document
                      .getElementById("admin-todo-section")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }, 0);
                }}
              >
                <i className="bi bi-check2-square" />
                {!sidebarCollapsed && <span>My To-Do List</span>}
                {!sidebarCollapsed && pendingTasks > 0 && (
                  <span className="todo-notification-count sidebar-badge">
                    {pendingTasks > 99 ? "99+" : pendingTasks}
                  </span>
                )}
              </a>
            </li>

            <li className="nav-item">
              <a
                href="#!"
                className={`nav-link d-flex align-items-center gap-2 ${
                  showUsers ? "active" : ""
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  setShowUsers(!showUsers);
                  setShowTodo(false);
                }}
              >
                <i className="bi bi-people" />
                {!sidebarCollapsed && <span>Users Management</span>}
              </a>
            </li>

            <li className="nav-item">
              <a
                href="#!"
                className="nav-link d-flex align-items-center gap-2"
                onClick={(e) => {
                  e.preventDefault();
                  handleLogout();
                }}
              >
                <i className="bi bi-box-arrow-right" />
                {!sidebarCollapsed && <span>Logout</span>}
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      {/* MAIN CONTENT */}

      <div className="main-content flex-grow-1">
        {/* TOP NAVBAR */}

        <header className="top-navbar bg-white border-bottom px-4 py-2 d-flex align-items-center justify-content-between sticky-top">
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-link text-dark p-0"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              aria-label="Toggle sidebar"
            >
              <i className="bi bi-list fs-4" />
            </button>

            <div className="search-box d-none d-md-flex align-items-center bg-light rounded-pill px-3 py-1">
              <i className="bi bi-search text-muted me-2" />
              <input
                type="text"
                className="form-control border-0 bg-transparent shadow-none"
                placeholder="Search dashboard..."
                style={{ width: 200 }}
              />
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-light position-relative"
              onClick={() => {
                setShowTodo(true);
                setShowUsers(false);
                setTimeout(() => {
                  document
                    .getElementById("admin-todo-section")
                    ?.scrollIntoView({ behavior: "smooth" });
                }, 0);
              }}
              title="Open To-Do"
            >
              <i className="bi bi-check2-square" />
              {pendingTasks > 0 && (
                <span className="todo-notification-count">
                  {pendingTasks > 99 ? "99+" : pendingTasks}
                </span>
              )}
            </button>

            {currentAdmin && (
              <img
                src={
                  currentAdmin.profilePictureBase64 ||
                  "https://via.placeholder.com/36"
                }
                alt="Avatar"
                className="rounded-circle"
                style={{
                  width: 36,
                  height: 36,
                  objectFit: "cover",
                }}
              />
            )}
          </div>
        </header>

        <div className="content-area p-4">
          {/* DASHBOARD HEADING */}

          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <div>
              <h2 className="mb-1 fw-bold">Analytics Dashboard</h2>
              <p className="text-muted mb-0">
                Welcome back. Manage your operations and daily tasks.
              </p>
            </div>
          </div>

          {/* ADMIN PROFILE */}

          {currentAdmin && (
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <div className="d-flex flex-wrap align-items-start gap-4">
                  <div className="text-center">
                    <img
                      src={
                        currentAdmin.profilePictureBase64 ||
                        "https://via.placeholder.com/80"
                      }
                      alt="Profile"
                      className="rounded-circle mb-2"
                      style={{
                        width: 80,
                        height: 80,
                        objectFit: "cover",
                      }}
                    />

                    <input
                      type="file"
                      accept="image/*"
                      className="form-control form-control-sm"
                      style={{ maxWidth: 220 }}
                      onChange={async (e) => {
                        const file = e.target.files[0];

                        if (!file) return;

                        const formData = new FormData();
                        formData.append("file", file);

                        try {
                          await api.post(
                            "/admin/users/me/profile-picture",
                            formData
                          );

                          await loadCurrentAdmin();
                          alert("Profile picture updated!");
                        } catch (err) {
                          console.error(err);
                          alert("Failed to upload profile picture.");
                        }

                        e.target.value = "";
                      }}
                    />
                  </div>

                  <div className="flex-grow-1">
                    <h5 className="mb-1">
                      Logged in as:{" "}
                      <span className="text-primary">
                        {currentAdmin.fullName}
                      </span>
                    </h5>

                    <p className="text-muted mb-1">
                      {currentAdmin.email}
                    </p>

                    <p className="mb-2">
                      <strong>Total Logins:</strong>{" "}
                      {loginHistory.totalLogins || 0}
                    </p>

                    <button
                      className="btn btn-sm btn-outline-info"
                      onClick={() =>
                        setShowLoginHistory(!showLoginHistory)
                      }
                    >
                      {showLoginHistory
                        ? "Hide Login History"
                        : "Show Login History"}
                    </button>

                    {showLoginHistory && (
                      <ul className="mt-2 list-unstyled">
                        {(loginHistory.loginTimes || []).map((h, idx) => (
                          <li
                            key={idx}
                            className="text-muted small"
                          >
                            <i className="bi bi-clock me-1" />
                            {new Date(h).toLocaleString()}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* GENERAL ERROR */}

          {error && (
            <div
              className="alert alert-danger alert-dismissible fade show"
              role="alert"
            >
              {error}
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={() => setError("")}
              />
            </div>
          )}

          {/* ===================================================
              TO-DO COMPONENT (shown via sidebar)
          =================================================== */}

          {showTodo && (
            <section
              id="admin-todo-section"
              className="todo-dashboard mb-5"
            >
              <div className="todo-header">
                <div>
                  <div className="todo-eyebrow">
                    <i className="bi bi-check2-circle me-2" />
                    PERSONAL PRODUCTIVITY
                  </div>

                  <h3 className="todo-heading">My To-Do List</h3>

                  <p className="todo-subtitle">
                    Organize your priorities and keep your work moving.
                  </p>
                </div>

                <button
                  className="todo-add-button"
                  onClick={openNewTaskForm}
                >
                  <i className="bi bi-plus-lg me-2" />
                  New Task
                </button>
              </div>

              {/* TASK STATISTICS */}

              <div className="todo-stat-grid">
                <button
                  className={`todo-stat-card ${
                    taskFilter === "all" ? "selected" : ""
                  }`}
                  onClick={() => setTaskFilter("all")}
                >
                  <span className="todo-stat-icon">
                    <i className="bi bi-list-task" />
                  </span>
                  <span className="todo-stat-label">All Tasks</span>
                  <strong>{totalTasks}</strong>
                  <small>Every task</small>
                </button>

                <button
                  className={`todo-stat-card ${
                    taskFilter === "pending" ? "selected" : ""
                  }`}
                  onClick={() => setTaskFilter("pending")}
                >
                  <span className="todo-stat-icon pending-icon">
                    <i className="bi bi-hourglass-split" />
                  </span>
                  <span className="todo-stat-label">Pending</span>
                  <strong>{pendingTasks}</strong>
                  <small>Still to do</small>
                </button>

                <button
                  className={`todo-stat-card ${
                    taskFilter === "completed" ? "selected" : ""
                  }`}
                  onClick={() => setTaskFilter("completed")}
                >
                  <span className="todo-stat-icon completed-icon">
                    <i className="bi bi-check2-circle" />
                  </span>
                  <span className="todo-stat-label">Completed</span>
                  <strong>{completedTasks}</strong>
                  <small>Tasks finished</small>
                </button>

                <button
                  className={`todo-stat-card ${
                    taskFilter === "important" ? "selected" : ""
                  }`}
                  onClick={() => setTaskFilter("important")}
                >
                  <span className="todo-stat-icon important-icon">
                    <i className="bi bi-star" />
                  </span>
                  <span className="todo-stat-label">Important</span>
                  <strong>{importantTasks}</strong>
                  <small>Priority tasks</small>
                </button>
              </div>

              {/* PROGRESS */}

              <div className="todo-progress-card">
                <div className="d-flex justify-content-between align-items-center gap-2 mb-2">
                  <div>
                    <h6 className="mb-1 fw-bold">Your daily progress</h6>
                    <small className="text-muted">
                      Keep going, one task at a time.
                    </small>
                  </div>

                  <strong className="todo-progress-percent">
                    {completionPercentage}%
                  </strong>
                </div>

                <div
                  className="progress todo-progress"
                  role="progressbar"
                  aria-label="Task completion progress"
                  aria-valuenow={completionPercentage}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  <div
                    className="progress-bar"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>

              {/* TASK CREATION AND EDITING */}

              {showTaskForm && (
                <div className="todo-form-card">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h5 className="fw-bold mb-1">
                        {editingTaskId !== null
                          ? "Edit Task"
                          : "Create New Task"}
                      </h5>
                      <small className="text-muted">
                        Add details to keep your work organized.
                      </small>
                    </div>

                    <button
                      className="btn btn-light btn-sm"
                      onClick={closeTaskForm}
                      aria-label="Close task form"
                    >
                      <i className="bi bi-x-lg" />
                    </button>
                  </div>

                  <form onSubmit={saveTask}>
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label">Task title *</label>
                        <input
                          className="form-control"
                          placeholder="e.g. Review weekly sales report"
                          value={taskForm.title}
                          onChange={(e) =>
                            setTaskForm({
                              ...taskForm,
                              title: e.target.value,
                            })
                          }
                          maxLength={150}
                          required
                          autoFocus
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label">Description</label>
                        <textarea
                          className="form-control"
                          placeholder="What needs to be done?"
                          rows={3}
                          value={taskForm.description}
                          onChange={(e) =>
                            setTaskForm({
                              ...taskForm,
                              description: e.target.value,
                            })
                          }
                          maxLength={1000}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Due date</label>
                        <input
                          type="date"
                          className="form-control"
                          value={taskForm.dueDate}
                          onChange={(e) =>
                            setTaskForm({
                              ...taskForm,
                              dueDate: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Priority</label>
                        <select
                          className="form-select"
                          value={taskForm.priority}
                          onChange={(e) =>
                            setTaskForm({
                              ...taskForm,
                              priority: e.target.value,
                            })
                          }
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>
                      </div>

                      <div className="col-12 d-flex flex-wrap gap-2">
                        <button
                          type="submit"
                          className="todo-add-button"
                        >
                          <i className="bi bi-check2 me-2" />
                          {editingTaskId !== null
                            ? "Save Changes"
                            : "Create Task"}
                        </button>

                        <button
                          type="button"
                          className="btn btn-light"
                          onClick={closeTaskForm}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* SEARCH, FILTERS AND SORTING */}

              <div className="todo-toolbar">
                <div className="todo-search">
                  <i className="bi bi-search" />
                  <input
                    type="search"
                    placeholder="Search your tasks..."
                    value={taskSearch}
                    onChange={(e) => setTaskSearch(e.target.value)}
                    aria-label="Search tasks"
                  />
                  {taskSearch && (
                    <button
                      type="button"
                      onClick={() => setTaskSearch("")}
                      aria-label="Clear search"
                    >
                      <i className="bi bi-x-lg" />
                    </button>
                  )}
                </div>

                <div className="d-flex flex-wrap gap-2">
                  <select
                    className="form-select todo-select"
                    value={taskFilter}
                    onChange={(e) => setTaskFilter(e.target.value)}
                    aria-label="Filter tasks"
                  >
                    <option value="all">All Tasks</option>
                    <option value="today">Due Today</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="important">Important</option>
                    <option value="overdue">Overdue</option>
                  </select>

                  <select
                    className="form-select todo-select"
                    value={taskSort}
                    onChange={(e) => setTaskSort(e.target.value)}
                    aria-label="Sort tasks"
                  >
                    <option value="created">Newest First</option>
                    <option value="dueDate">Due Date</option>
                    <option value="priority">Priority</option>
                    <option value="title">Task Name</option>
                  </select>
                </div>
              </div>

              {taskMessage && (
                <div className="todo-message" role="status">
                  <span>{taskMessage}</span>
                  <button
                    onClick={() => setTaskMessage("")}
                    aria-label="Dismiss message"
                  >
                    <i className="bi bi-x-lg" />
                  </button>
                </div>
              )}

              {/* TASK LIST */}

              <div className="todo-list-heading">
                <div>
                  <h5 className="fw-bold mb-1">
                    {taskFilter === "all"
                      ? "All Tasks"
                      : taskFilter === "today"
                      ? "Today's Tasks"
                      : taskFilter === "important"
                      ? "Important Tasks"
                      : taskFilter === "completed"
                      ? "Completed Tasks"
                      : taskFilter === "overdue"
                      ? "Overdue Tasks"
                      : "Pending Tasks"}
                  </h5>
                  <small className="text-muted">
                    {filteredTasks.length} task
                    {filteredTasks.length !== 1 ? "s" : ""}
                  </small>
                </div>

                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={clearCompletedTasks}
                  disabled={completedTasks === 0}
                >
                  <i className="bi bi-trash3 me-1" />
                  Clear Completed
                </button>
              </div>

              <div className="todo-task-list">
                {filteredTasks.length === 0 ? (
                  <div className="todo-empty">
                    <div className="todo-empty-icon">
                      <i className="bi bi-clipboard-check" />
                    </div>

                    <h5>No tasks found</h5>

                    <p className="text-muted mb-3">
                      {tasks.length === 0
                        ? "Start by adding your first task."
                        : "Try another filter or search term."}
                    </p>

                    {tasks.length === 0 && (
                      <button
                        className="todo-add-button"
                        onClick={openNewTaskForm}
                      >
                        <i className="bi bi-plus-lg me-2" />
                        Add Your First Task
                      </button>
                    )}
                  </div>
                ) : (
                  filteredTasks.map((task) => {
                    const overdue =
                      !task.completed &&
                      task.dueDate &&
                      task.dueDate < todayString;

                    return (
                      <article
                        key={task.id}
                        className={`todo-task ${
                          task.completed ? "task-completed" : ""
                        }`}
                      >
                        <button
                          className={`todo-check ${
                            task.completed ? "checked" : ""
                          }`}
                          onClick={() => toggleTaskCompleted(task.id)}
                          aria-label={
                            task.completed
                              ? "Mark task as pending"
                              : "Mark task as completed"
                          }
                          title={
                            task.completed
                              ? "Mark as pending"
                              : "Mark as completed"
                          }
                        >
                          {task.completed && (
                            <i className="bi bi-check-lg" />
                          )}
                        </button>

                        <div className="todo-task-content">
                          <div className="d-flex align-items-center flex-wrap gap-2 mb-1">
                            <h6
                              className={`todo-task-title mb-0 ${
                                task.completed ? "text-decoration-line-through" : ""
                              }`}
                            >
                              {task.title}
                            </h6>

                            {task.important && (
                              <i
                                className="bi bi-star-fill todo-star-active"
                                title="Important task"
                              />
                            )}
                          </div>

                          {task.description && (
                            <p className="todo-task-description mb-2">
                              {task.description}
                            </p>
                          )}

                          <div className="todo-task-meta">
                            {task.dueDate && (
                              <span
                                className={
                                  overdue ? "todo-overdue" : ""
                                }
                              >
                                <i className="bi bi-calendar3 me-1" />
                                {overdue ? "Overdue: " : "Due: "}
                                {formatTaskDate(task.dueDate)}
                              </span>
                            )}

                            <span
                              className={`priority-badge priority-${(
                                task.priority || "Medium"
                              ).toLowerCase()}`}
                            >
                              {task.priority || "Medium"} Priority
                            </span>

                            <span
                              className={`todo-status ${
                                task.completed
                                  ? "status-completed"
                                  : "status-pending"
                              }`}
                            >
                              {task.completed ? "Completed" : "Pending"}
                            </span>
                          </div>
                        </div>

                        <div className="todo-task-actions">
                          <button
                            className={`todo-action ${
                              task.important ? "active" : ""
                            }`}
                            onClick={() => toggleTaskImportant(task.id)}
                            title={
                              task.important
                                ? "Remove importance"
                                : "Mark important"
                            }
                            aria-label="Toggle important"
                          >
                            <i
                              className={
                                task.important
                                  ? "bi bi-star-fill"
                                  : "bi bi-star"
                              }
                            />
                          </button>

                          <button
                            className="todo-action"
                            onClick={() => editTask(task)}
                            title="Edit task"
                            aria-label="Edit task"
                          >
                            <i className="bi bi-pencil-square" />
                          </button>

                          <button
                            className="todo-action delete-action"
                            onClick={() => deleteTask(task.id)}
                            title="Delete task"
                            aria-label="Delete task"
                          >
                            <i className="bi bi-trash3" />
                          </button>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>

              <div className="todo-footer">
                <span>
                  <i className="bi bi-shield-check me-2" />
                  Tasks are saved in this browser.
                </span>

                <span>
                  {completedTasks} of {totalTasks} completed
                </span>
              </div>
            </section>
          )}

          {/* EXISTING MANAGEMENT SECTIONS */}

          <section className="mb-5">
            <h4 className="mb-3 fw-semibold">Management Sections</h4>

            <div className="row g-3">
              {dashboardLinks.map((link) => (
                <div
                  className="col-12 col-sm-6 col-lg-3"
                  key={link.path}
                >
                  <div
                    className="card border-0 shadow-sm h-100 management-card"
                    style={{
                      cursor: "pointer",
                      transition: "transform 0.2s",
                    }}
                    onClick={() => navigate(link.path)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div className="card-body d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <h6 className="text-muted mb-1">
                            {link.title}
                          </h6>
                          <small className="text-muted">
                            {link.description}
                          </small>
                        </div>

                        <div
                          className={`rounded-circle d-flex align-items-center justify-content-center bg-${link.color} bg-opacity-10`}
                          style={{ width: 42, height: 42 }}
                        >
                          <i
                            className={`bi ${link.icon} text-${link.color}`}
                            style={{ fontSize: "1.25rem" }}
                          />
                        </div>
                      </div>

                      <div className="mt-auto">
                        <span
                          className={`badge bg-${link.color} bg-opacity-10 text-${link.color}`}
                        >
                          Open
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* EXISTING USERS MANAGEMENT */}

          <section className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="mb-0 fw-semibold">Users Management</h4>

              <button
                className="btn btn-dark rounded-pill"
                onClick={() => {
                  setShowUsers(!showUsers);
                  setShowTodo(false);
                }}
              >
                {showUsers ? "Hide Users" : "Show Users"}
              </button>
            </div>

            {showUsers && (
              <>
                <div className="mb-3">
                  <button
                    className="btn btn-success rounded-pill"
                    onClick={() => setShowAddUser(!showAddUser)}
                  >
                    {showAddUser ? "Hide Add User" : "+ Add User"}
                  </button>
                </div>

                {showAddUser && (
                  <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body">
                      <h5 className="card-title mb-3">Add New User</h5>

                      <div className="row g-3">
                        <div className="col-md-6">
                          <input
                            className="form-control"
                            placeholder="Full Name"
                            value={addUserForm.fullName}
                            onChange={(e) =>
                              setAddUserForm({
                                ...addUserForm,
                                fullName: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="col-md-6">
                          <input
                            type="email"
                            className="form-control"
                            placeholder="Email"
                            value={addUserForm.email}
                            onChange={(e) =>
                              setAddUserForm({
                                ...addUserForm,
                                email: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="col-md-6">
                          <input
                            type="password"
                            className="form-control"
                            placeholder="Password"
                            value={addUserForm.password}
                            onChange={(e) =>
                              setAddUserForm({
                                ...addUserForm,
                                password: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="col-md-6">
                          <input
                            type="password"
                            className="form-control"
                            placeholder="Confirm Password"
                            value={addUserForm.confirmPassword}
                            onChange={(e) =>
                              setAddUserForm({
                                ...addUserForm,
                                confirmPassword: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="col-md-6">
                          <input
                            className="form-control"
                            placeholder="Mobile"
                            value={addUserForm.mobile}
                            onChange={(e) =>
                              setAddUserForm({
                                ...addUserForm,
                                mobile: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="col-md-6">
                          <select
                            className="form-select"
                            value={addUserForm.role}
                            onChange={(e) =>
                              setAddUserForm({
                                ...addUserForm,
                                role: e.target.value,
                              })
                            }
                          >
                            <option value="USER">User</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        </div>

                        <div className="col-12">
                          <button
                            className="btn btn-primary rounded-pill"
                            onClick={addUser}
                          >
                            Add User
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* EDIT USER */}

                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body">
                    <h5 className="card-title mb-3">Edit User</h5>

                    <div className="row g-3">
                      <div className="col-md-6">
                        <input
                          className="form-control"
                          placeholder="Full Name"
                          value={form.fullName}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              fullName: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="col-md-6">
                        <input
                          type="email"
                          className="form-control"
                          placeholder="Email"
                          value={form.email}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              email: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="col-md-6">
                        <input
                          className="form-control"
                          placeholder="Mobile"
                          value={form.mobile}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              mobile: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="col-md-6">
                        <select
                          className="form-select"
                          value={form.role}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              role: e.target.value,
                            })
                          }
                        >
                          <option value="USER">User</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </div>

                      <div className="col-12 d-flex gap-2">
                        <button
                          className="btn btn-primary rounded-pill"
                          onClick={updateUser}
                          disabled={!form.id}
                        >
                          Update
                        </button>

                        <button
                          className="btn btn-outline-secondary rounded-pill"
                          onClick={() => setForm({ ...emptyUserForm })}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* USERS TABLE */}

                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th className="ps-4">ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Mobile</th>
                            <th>Role</th>
                            <th className="pe-4">Actions</th>
                          </tr>
                        </thead>

                        <tbody>
                          {users.map((u) => (
                            <tr key={u.id}>
                              <td className="ps-4">{u.id}</td>
                              <td>{u.fullName}</td>
                              <td>{u.email}</td>
                              <td>{u.mobile}</td>

                              <td>
                                <span
                                  className={`badge ${
                                    u.role === "ADMIN"
                                      ? "bg-danger"
                                      : "bg-secondary"
                                  }`}
                                >
                                  {u.role}
                                </span>
                              </td>

                              <td className="pe-4">
                                <div className="d-flex flex-wrap gap-1">
                                  <button
                                    className="btn btn-warning btn-sm"
                                    onClick={() =>
                                      setForm({
                                        id: u.id,
                                        fullName: u.fullName || "",
                                        email: u.email || "",
                                        mobile: u.mobile || "",
                                        role: u.role || "USER",
                                      })
                                    }
                                  >
                                    Edit
                                  </button>

                                  <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => deleteUser(u.id)}
                                  >
                                    Delete
                                  </button>

                                  <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() =>
                                      setReset({
                                        userId: u.id,
                                        newPassword: "",
                                      })
                                    }
                                  >
                                    Reset Password
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}

                          {users.length === 0 && (
                            <tr>
                              <td
                                colSpan="6"
                                className="text-center py-4 text-muted"
                              >
                                No users to display.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* RESET PASSWORD */}

                {reset.userId && (
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title mb-3">Reset Password</h5>

                      <div className="row g-3">
                        <div className="col-md-6">
                          <input
                            type="password"
                            className="form-control"
                            placeholder="New Password"
                            value={reset.newPassword}
                            onChange={(e) =>
                              setReset({
                                ...reset,
                                newPassword: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="col-12 d-flex gap-2">
                          <button
                            className="btn btn-danger rounded-pill"
                            onClick={resetPassword}
                            disabled={!reset.newPassword}
                          >
                            Confirm Reset
                          </button>

                          <button
                            className="btn btn-outline-secondary rounded-pill"
                            onClick={() =>
                              setReset({
                                userId: null,
                                newPassword: "",
                              })
                            }
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>

      {/* =====================================================
          COMPLETE STYLING
      ===================================================== */}

      <style>{`
        .admin-layout {
          min-height: 100vh;
          background: #f4f6fb;
        }

        .sidebar {
          width: 260px;
          min-height: 100vh;
          flex-shrink: 0;
          transition: width 0.25s ease;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
          background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%) !important;
        }

        .sidebar.collapsed {
          width: 72px;
        }

        .sidebar .logo-badge {
          background: #d7a632;
          color: #172044;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 5px 7px;
          border-radius: 4px;
          white-space: nowrap;
        }

        .sidebar-nav .nav-link {
          color: rgba(255, 255, 255, 0.7);
          padding: 0.7rem 1rem;
          border-radius: 0.5rem;
          margin: 0 0.5rem;
          transition: all 0.2s;
        }

        .sidebar-nav .nav-link:hover,
        .sidebar-nav .nav-link.active {
          background: rgba(215, 166, 50, 0.17);
          color: #fff;
        }

        .sidebar-nav .nav-section-title {
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
          display: block;
        }

        .sidebar-badge {
          position: static !important;
          margin-left: auto;
        }

        .main-content {
          min-width: 0;
          flex: 1;
        }

        .top-navbar {
          z-index: 1020;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .search-box input:focus {
          outline: none;
          box-shadow: none;
        }

        .management-card {
          border-radius: 12px;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .management-card:hover {
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08) !important;
        }

        .card {
          border-radius: 12px;
        }

        .table th {
          font-weight: 600;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          color: #64748b;
        }

        .todo-dashboard {
          --todo-navy: #252953;
          --todo-navy-dark: #1c2046;
          --todo-gold: #d9aa39;
          --todo-purple: #8275f5;
          color: #f5f5ff;
          padding: 25px;
          border-radius: 20px;
          background: var(--todo-navy);
          box-shadow: 0 12px 35px rgba(28, 32, 70, 0.15);
          overflow: hidden;
        }

        .todo-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 18px;
          margin-bottom: 24px;
        }

        .todo-eyebrow {
          color: #c6baff;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 1.4px;
          margin-bottom: 8px;
        }

        .todo-heading {
          color: #fff;
          font-size: 1.65rem;
          font-weight: 750;
          margin: 0 0 6px;
        }

        .todo-subtitle {
          color: #b3b8d7;
          font-size: 0.9rem;
          margin: 0;
        }

        .todo-add-button {
          border: 0;
          border-radius: 9px;
          padding: 11px 17px;
          background: var(--todo-gold);
          color: #28264b;
          font-weight: 700;
          font-size: 0.88rem;
          transition: all 0.2s;
        }

        .todo-add-button:hover {
          background: #edbd4c;
          transform: translateY(-1px);
        }

        .todo-stat-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 13px;
          margin-bottom: 17px;
        }

        .todo-stat-card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          min-width: 0;
          padding: 16px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.045);
          color: #fff;
          transition: all 0.2s;
        }

        .todo-stat-card:hover,
        .todo-stat-card.selected {
          border-color: var(--todo-gold);
          background: rgba(217, 170, 57, 0.1);
        }

        .todo-stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 9px;
          background: rgba(130, 117, 245, 0.18);
          color: #b6adff;
          font-size: 1.1rem;
          margin-bottom: 12px;
        }

        .todo-stat-icon.pending-icon {
          background: rgba(217, 170, 57, 0.14);
          color: #eac45f;
        }

        .todo-stat-icon.completed-icon {
          background: rgba(75, 211, 169, 0.13);
          color: #68ddbb;
        }

        .todo-stat-icon.important-icon {
          background: rgba(240, 110, 153, 0.13);
          color: #ff91b3;
        }

        .todo-stat-label {
          color: #b6bbd8;
          font-size: 0.78rem;
        }

        .todo-stat-card strong {
          font-size: 1.65rem;
          line-height: 1.5;
          font-weight: 750;
        }

        .todo-stat-card small {
          color: #9299c0;
          font-size: 0.72rem;
        }

        .todo-progress-card {
          background: rgba(255, 255, 255, 0.045);
          border: 1px solid rgba(255, 255, 255, 0.07);
          padding: 18px;
          border-radius: 12px;
          margin-bottom: 20px;
        }

        .todo-progress-card h6 {
          color: #fff;
        }

        .todo-progress-percent {
          color: var(--todo-gold);
          font-size: 1.3rem;
        }

        .todo-progress {
          height: 8px;
          background: #41466f;
          border-radius: 20px;
        }

        .todo-progress .progress-bar {
          background: linear-gradient(90deg, #d6a32e, #f2cb69);
          border-radius: 20px;
          transition: width 0.3s ease;
        }

        .todo-form-card {
          padding: 20px;
          margin-bottom: 20px;
          border-radius: 13px;
          border: 1px solid rgba(217, 170, 57, 0.3);
          background: var(--todo-navy-dark);
        }

        .todo-form-card h5 {
          color: #fff;
        }

        .todo-form-card .form-label {
          color: #dce0fa;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .todo-form-card .form-control,
        .todo-form-card .form-select {
          color: #f5f5ff;
          background-color: #292e59;
          border-color: #454b7c;
        }

        .todo-form-card .form-control::placeholder {
          color: #9097bc;
        }

        .todo-form-card .form-control:focus,
        .todo-form-card .form-select:focus {
          border-color: var(--todo-gold);
          box-shadow: 0 0 0 0.2rem rgba(217, 170, 57, 0.12);
        }

        .todo-form-card input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
        }

        .todo-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 24px;
        }

        .todo-search {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
          min-width: 200px;
          max-width: 430px;
          padding: 10px 13px;
          border: 1px solid #42476f;
          border-radius: 9px;
          background: #202449;
          color: #aab0d3;
        }

        .todo-search input {
          width: 100%;
          min-width: 0;
          border: 0;
          outline: 0;
          background: transparent;
          color: #fff;
          font-size: 0.85rem;
        }

        .todo-search input::placeholder {
          color: #9097bc;
        }

        .todo-search button {
          background: transparent;
          border: 0;
          color: #aab0d3;
        }

        .todo-select {
          width: auto;
          min-width: 130px;
          color: #e9eaff;
          background-color: #202449;
          border-color: #42476f;
          font-size: 0.82rem;
        }

        .todo-select:focus {
          border-color: var(--todo-gold);
          box-shadow: none;
        }

        .todo-select option {
          background: #252953;
          color: white;
        }

        .todo-list-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 14px;
        }

        .todo-list-heading h5 {
          color: #fff;
          font-size: 1rem;
        }

        .todo-list-heading small {
          color: #aab0d3 !important;
        }

        .todo-list-heading .btn {
          border-color: #51567d;
          color: #d1d5ef;
        }

        .todo-list-heading .btn:hover {
          color: #fff;
          background: #3a3f68;
        }

        .todo-list-heading .btn:disabled {
          opacity: 0.4;
        }

        .todo-task-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .todo-task {
          display: flex;
          align-items: flex-start;
          gap: 13px;
          padding: 17px;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 11px;
          background: rgba(255, 255, 255, 0.045);
          transition: border-color 0.2s, background 0.2s;
        }

        .todo-task:hover {
          border-color: rgba(217, 170, 57, 0.45);
          background: rgba(255, 255, 255, 0.065);
        }

        .todo-task.task-completed {
          opacity: 0.72;
        }

        .todo-check {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 23px;
          height: 23px;
          margin-top: 2px;
          border: 2px solid #777eac;
          border-radius: 50%;
          background: transparent;
          color: #252953;
          cursor: pointer;
        }

        .todo-check.checked {
          border-color: #69d6b1;
          background: #69d6b1;
        }

        .todo-task-content {
          flex: 1;
          min-width: 0;
        }

        .todo-task-title {
          color: #f6f6ff;
          font-size: 0.94rem;
          font-weight: 650;
          overflow-wrap: anywhere;
        }

        .todo-task-description {
          color: #aeb4d4;
          font-size: 0.82rem;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }

        .todo-task-meta {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 9px;
          color: #aab0d3;
          font-size: 0.73rem;
        }

        .todo-overdue {
          color: #ff9ca8;
          font-weight: 700;
        }

        .priority-badge,
        .todo-status {
          display: inline-flex;
          align-items: center;
          padding: 4px 8px;
          border-radius: 20px;
          font-size: 0.68rem;
          font-weight: 650;
        }

        .priority-high {
          background: rgba(248, 113, 113, 0.14);
          color: #ff9e9e;
        }

        .priority-medium {
          background: rgba(217, 170, 57, 0.15);
          color: #f0cb72;
        }

        .priority-low {
          background: rgba(130, 117, 245, 0.16);
          color: #b9b0ff;
        }

        .status-completed {
          background: rgba(75, 211, 169, 0.13);
          color: #76e2c1;
        }

        .status-pending {
          background: rgba(130, 117, 245, 0.14);
          color: #c0b8ff;
        }

        .todo-task-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }

        .todo-action {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 31px;
          height: 31px;
          border: 0;
          border-radius: 7px;
          background: transparent;
          color: #aab0d3;
          transition: all 0.2s;
        }

        .todo-action:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        .todo-action.active,
        .todo-star-active {
          color: #f0bd4b;
        }

        .todo-action.delete-action:hover {
          background: rgba(255, 90, 110, 0.13);
          color: #ff8f9d;
        }

        .todo-empty {
          padding: 42px 15px;
          text-align: center;
          border: 1px dashed #51567d;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.025);
        }

        .todo-empty-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          margin-bottom: 13px;
          border-radius: 16px;
          background: rgba(217, 170, 57, 0.12);
          color: var(--todo-gold);
          font-size: 1.8rem;
        }

        .todo-empty h5 {
          color: #fff;
        }

        .todo-empty p {
          color: #aab0d3 !important;
        }

        .todo-footer {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          padding-top: 18px;
          margin-top: 17px;
          border-top: 1px solid rgba(255, 255, 255, 0.09);
          color: #aab0d3;
          font-size: 0.76rem;
        }

        .todo-footer i {
          color: #74d9b8;
        }

        .todo-message {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin: -8px 0 17px;
          padding: 10px 13px;
          border-radius: 8px;
          background: rgba(217, 170, 57, 0.12);
          color: #f0d58e;
          font-size: 0.82rem;
        }

        .todo-message button {
          background: transparent;
          border: 0;
          color: inherit;
        }

        .todo-notification-count {
          position: absolute;
          top: -5px;
          right: -5px;
          display: flex;
          justify-content: center;
          align-items: center;
          min-width: 18px;
          height: 18px;
          padding: 0 4px;
          border-radius: 20px;
          background: #d9aa39;
          color: #252953;
          font-size: 0.65rem;
          font-weight: 800;
        }

        .todo-notification-count.sidebar-badge {
          position: static !important;
          margin-left: auto;
        }

        @media (max-width: 992px) {
          .todo-stat-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 768px) {
          .sidebar {
            position: fixed;
            z-index: 1040;
            transform: translateX(0);
          }

          .sidebar.collapsed {
            transform: translateX(-100%);
            width: 260px;
          }

          .todo-dashboard {
            padding: 17px;
            border-radius: 14px;
          }

          .todo-heading {
            font-size: 1.4rem;
          }

          .todo-toolbar {
            align-items: stretch;
          }

          .todo-search {
            max-width: none;
            flex-basis: 100%;
          }

          .todo-toolbar > .d-flex {
            width: 100%;
          }

          .todo-select {
            flex: 1;
            min-width: 0;
          }
        }

        @media (max-width: 480px) {
          .content-area {
            padding: 12px !important;
          }

          .todo-stat-grid {
            gap: 8px;
          }

          .todo-stat-card {
            padding: 12px;
          }

          .todo-task {
            gap: 9px;
            padding: 12px;
          }

          .todo-task-actions {
            flex-direction: column;
          }

          .todo-task-meta {
            gap: 7px;
          }

          .todo-header {
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}

export default AdminDashboard;