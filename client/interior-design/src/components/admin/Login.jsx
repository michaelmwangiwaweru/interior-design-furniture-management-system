import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

/* ================= CONFIG ================= */

const API_BASE_URL = 'http://localhost:9193/api';

/* ============== AXIOS SETUP (NO STORAGE) ============== */

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  if (config.authToken) {
    config.headers.Authorization = `Bearer ${config.authToken}`;
  }
  return config;
});

/* ================= API ================= */

const api = {
  login: (username, password) =>
    apiClient.post('/auth/login', { username, password }),

  getUsers: (token) =>
    apiClient.get('/admin/users', { authToken: token }),

  deleteUser: (id, token) =>
    apiClient.delete(`/admin/users/${id}`, { authToken: token }),

  changePassword: (payload, token) =>
    apiClient.post('/users/change-password', payload, { authToken: token }),
};

/* ================= COMPONENTS ================= */

const LoginForm = ({ onLogin }) => {
  const [username, setU] = useState('');
  const [password, setP] = useState('');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.login(username, password);
      onLogin(res.data); // token stays in memory only
    } catch {
      setError('Invalid credentials');
    }
  };

  return (
    <form onSubmit={submit}>
      <h2>Login</h2>
      <input
        placeholder="Username"
        value={username}
        onChange={e => setU(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setP(e.target.value)}
      />
      <button>Login</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
};

const PasswordChange = ({ userId, token }) => {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (next !== confirm) {
      setMsg('Passwords do not match');
      return;
    }
    await api.changePassword(
      { userId, currentPassword: current, newPassword: next },
      token
    );
    setMsg('Password updated');
    setCurrent('');
    setNext('');
    setConfirm('');
  };

  return (
    <form onSubmit={submit}>
      <h3>Change Password</h3>
      <input type="password" placeholder="Current" value={current} onChange={e=>setCurrent(e.target.value)} />
      <input type="password" placeholder="New" value={next} onChange={e=>setNext(e.target.value)} />
      <input type="password" placeholder="Confirm" value={confirm} onChange={e=>setConfirm(e.target.value)} />
      <button>Update</button>
      {msg && <p>{msg}</p>}
    </form>
  );
};

const AdminDashboard = ({ user, token, onLogout }) => {
  const [users, setUsers] = useState([]);

  const loadUsers = useCallback(async () => {
    const res = await api.getUsers(token);
    setUsers(
      [...res.data].sort((a, b) => {
        if (a.role === b.role) return a.id - b.id;
        return a.role === 'ADMIN' ? -1 : 1;
      })
    );
  }, [token]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Logged in as {user.username}</p>
      <button onClick={onLogout}>Logout</button>

      <PasswordChange userId={user.id} token={token} />

      <h3>Users</h3>
      {users.map(u => (
        <div key={u.id}>
          {u.username} ({u.role})
          {u.id !== user.id && (
            <button onClick={() => api.deleteUser(u.id, token).then(loadUsers)}>
              Delete
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

const UserDashboard = ({ user, token, onLogout }) => (
  <div>
    <h1>User Dashboard</h1>
    <p>Welcome {user.username}</p>
    <PasswordChange userId={user.id} token={token} />
    <button onClick={onLogout}>Logout</button>
  </div>
);

/* ================= MAIN EXPORT ================= */

export default function Login() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const handleLogin = (data) => {
    setUser(data);
    setToken(data.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  if (!user) return <LoginForm onLogin={handleLogin} />;
  if (user.role === 'ADMIN') {
    return <AdminDashboard user={user} token={token} onLogout={logout} />;
  }
  return <UserDashboard user={user} token={token} onLogout={logout} />;
}
