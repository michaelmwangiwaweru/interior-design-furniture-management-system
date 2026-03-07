import React, { useEffect, useState } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:9193",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [loginHistory, setLoginHistory] = useState({});
  const [form, setForm] = useState({
    id: null,
    fullName: "",
    email: "",
    mobile: "",
    role: "USER",
  });
  const [addUserForm, setAddUserForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobile: "",
    role: "USER",
  });
  const [reset, setReset] = useState({ userId: null, newPassword: "" });
  const [error, setError] = useState("");
  const [showUsers, setShowUsers] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showLoginHistory, setShowLoginHistory] = useState(false);

  const formStyle = { width: "40%", margin: "0 auto" };

  // Load current admin info
  const loadCurrentAdmin = async () => {
    try {
      const res = await api.get("/admin/users/me");
      setCurrentAdmin(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Load login history
  const loadLoginHistory = async () => {
    try {
      const res = await api.get("/admin/users/me/history");
      setLoginHistory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Load all users
  const loadUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch {
      setError("Failed to load users");
    }
  };

  useEffect(() => {
    loadCurrentAdmin();
    loadLoginHistory();
    if (showUsers) loadUsers();
  }, [showUsers]);

  // Update user
  const updateUser = async () => {
    try {
      await api.put(`/admin/users/${form.id}`, form);
      setForm({ id: null, fullName: "", email: "", mobile: "", role: "USER" });
      loadUsers();
    } catch {
      setError("Update failed");
    }
  };

  // Delete user
  const deleteUser = async (id) => {
    if (!window.confirm("Delete user?")) return;
    await api.delete(`/admin/users/${id}`);
    loadUsers();
  };

  // Reset password
  const resetPassword = async () => {
    await api.put(`/admin/users/${reset.userId}/password`, {
      newPassword: reset.newPassword,
    });
    alert("Password reset successful");
    setReset({ userId: null, newPassword: "" });
  };

  // Add new user
  const addUser = async () => {
    const { fullName, email, password, confirmPassword, mobile, role } = addUserForm;
    if (!fullName || !email || !password || !confirmPassword || !mobile) {
      setError("Please fill all fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      await api.post("/auth/signup", addUserForm);
      alert("User added successfully");
      setAddUserForm({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        mobile: "",
        role: "USER",
      });
      setShowAddUser(false);
      loadUsers();
    } catch {
      setError("Failed to add user");
    }
  };

  return (
    <div className="container mt-4">
      <h3>Admin Dashboard</h3>

      {/* CURRENT ADMIN INFO */}
      {currentAdmin && (
        <div className="alert alert-info d-flex align-items-start">
          <div style={{ marginRight: "20px", textAlign: "center", marginTop: "20px" }}>
            <img
              src={currentAdmin.profilePictureBase64 || "https://via.placeholder.com/80"}
              alt="Profile"
              style={{ width: "80px", height: "80px", borderRadius: "50%" }}
            />
         <input
  type="file"
  accept="image/*"
  onChange={async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file); // must be "file"

    try {
      await api.post("/admin/users/me/profile-picture", formData); 
      // do NOT set Content-Type manually, let Axios handle it
      loadCurrentAdmin(); 
      alert("Profile picture updated!");
    } catch (err) {
      console.error(err);
      alert("Failed to upload profile picture");
    }
  }}
  style={{ marginTop: "5px" }}
/>
          </div>

          <div>
            <strong>Logged in as:</strong> {currentAdmin.fullName} ({currentAdmin.email})<br />
            <strong>Total Logins:</strong> {loginHistory.totalLogins || 0}<br />
            <button
              className="btn btn-sm btn-info mt-2"
              onClick={() => setShowLoginHistory(!showLoginHistory)}
            >
              {showLoginHistory ? "Hide Login History" : "Show Login History"}
            </button>

            {showLoginHistory && (
              <ul className="mt-2">
                {(loginHistory.loginTimes || []).map((h, idx) => (
                  <li key={idx}>{new Date(h).toLocaleString()}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {/* USERS MANAGEMENT BUTTON */}
      <button
        className="btn btn-dark mb-3"
        onClick={() => setShowUsers(!showUsers)}
      >
        {showUsers ? "Hide Users Management" : "Users Management"}
      </button>

      {showUsers && (
        <>
          {/* ADD USER COLLAPSIBLE */}
          <button
            className="btn btn-success mb-3"
            onClick={() => setShowAddUser(!showAddUser)}
          >
            {showAddUser ? "Hide Add User" : "Add User"}
          </button>

          {showAddUser && (
            <div className="card p-3 mb-4" style={formStyle}>
              <h5>Add New User</h5>
              <input
                className="form-control mb-2"
                placeholder="Full Name"
                value={addUserForm.fullName}
                onChange={(e) =>
                  setAddUserForm({ ...addUserForm, fullName: e.target.value })
                }
              />
              <input
                className="form-control mb-2"
                placeholder="Email"
                value={addUserForm.email}
                onChange={(e) =>
                  setAddUserForm({ ...addUserForm, email: e.target.value })
                }
              />
              <input
                type="password"
                className="form-control mb-2"
                placeholder="Password"
                value={addUserForm.password}
                onChange={(e) =>
                  setAddUserForm({ ...addUserForm, password: e.target.value })
                }
              />
              <input
                type="password"
                className="form-control mb-2"
                placeholder="Confirm Password"
                value={addUserForm.confirmPassword}
                onChange={(e) =>
                  setAddUserForm({ ...addUserForm, confirmPassword: e.target.value })
                }
              />
              <input
                className="form-control mb-2"
                placeholder="Mobile"
                value={addUserForm.mobile}
                onChange={(e) =>
                  setAddUserForm({ ...addUserForm, mobile: e.target.value })
                }
              />
              <select
                className="form-select mb-2"
                value={addUserForm.role}
                onChange={(e) =>
                  setAddUserForm({ ...addUserForm, role: e.target.value })
                }
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
              <button className="btn btn-primary" onClick={addUser}>
                Add User
              </button>
            </div>
          )}

          {/* EDIT USER FORM */}
          <div className="card p-3 mb-4" style={formStyle}>
            <h5>Edit User</h5>
            <input
              className="form-control mb-2"
              placeholder="Full Name"
              value={form.fullName}
              onChange={(e) =>
                setForm({ ...form, fullName: e.target.value })
              }
            />
            <input
              className="form-control mb-2"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              className="form-control mb-2"
              placeholder="Mobile"
              value={form.mobile}
              onChange={(e) => setForm({ ...form, mobile: e.target.value })}
            />
            <select
              className="form-select mb-2"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>

            <div className="d-flex justify-content-between">
              <button className="btn btn-primary" onClick={updateUser}>
                Update
              </button>
              <button
                className="btn btn-secondary"
                onClick={() =>
                  setForm({ id: null, fullName: "", email: "", mobile: "", role: "USER" })
                }
              >
                Cancel
              </button>
            </div>
          </div>

          {/* USERS TABLE */}
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.fullName}</td>
                  <td>{u.email}</td>
                  <td>{u.mobile}</td>
                  <td>{u.role}</td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => setForm(u)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm me-2"
                      onClick={() => deleteUser(u.id)}
                    >
                      Delete
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() =>
                        setReset({ userId: u.id, newPassword: "" })
                      }
                    >
                      Reset Password
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* RESET PASSWORD FORM */}
          {reset.userId && (
            <div className="card p-3 mt-3" style={formStyle}>
              <h5>Reset Password</h5>
              <input
                type="password"
                className="form-control mb-2"
                placeholder="New Password"
                value={reset.newPassword}
                onChange={(e) =>
                  setReset({ ...reset, newPassword: e.target.value })
                }
              />
              <button className="btn btn-danger" onClick={resetPassword}>
                Confirm Reset
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminDashboard;
