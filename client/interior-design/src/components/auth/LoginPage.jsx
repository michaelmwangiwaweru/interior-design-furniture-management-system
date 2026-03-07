import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MDBContainer, MDBInput } from 'mdb-react-ui-kit';

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      if (!username || !password) {
        setError('Please enter both email and password.');
        setLoading(false);
        return;
      }

      const response = await axios.post('http://localhost:9193/auth/signin', {
        username: username.trim(),
        password,
      });

      const { token } = response.data;
      if (!token) throw new Error('No token received from server');

      localStorage.setItem('token', token);

      // --- Decode JWT to extract role ---
      const payload = parseJwt(token);
      console.log('JWT payload:', payload);

      let role = '';
      if (payload?.roles?.length > 0) {
        role = payload.roles[0].authority;
      }

      const normalizedRole = role.toUpperCase().replace('ROLE_', '');
      console.log('Normalized role:', normalizedRole);

      localStorage.setItem('userRole', normalizedRole);

      // --- Redirect ---
      if (normalizedRole === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (normalizedRole === 'CUSTOMER' || normalizedRole === 'USER') {
        navigate('/user/dashboard');
      } else {
        alert('Your account role is not recognized. Contact admin.');
      }
    } catch (err) {
      console.error(err);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="border rounded-lg shadow p-5 bg-white" style={{ maxWidth: '500px', width: '100%' }}>
        <MDBContainer>
          <h2 className="mb-4 text-center fw-bold">Login</h2>

          {error && <div className="alert alert-danger text-center mb-4">{error}</div>}

          <MDBInput
            wrapperClass="mb-4"
            placeholder="Email Address"
            type="email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <MDBInput
            wrapperClass="mb-4"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            className="btn btn-primary w-100 mb-4"
            style={{ height: '50px' }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="text-center">
            <p>Not a member? <a href="/signup">Register here</a></p>
          </div>
        </MDBContainer>
      </div>
    </div>
  );
}

export default LoginPage;
