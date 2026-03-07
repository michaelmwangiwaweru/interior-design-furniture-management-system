// WelcomeDashboard.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function WelcomeDashboard() {
    const navigate = useNavigate();

    // Decode JWT token to get email and roles
    const decodeToken = () => {
        const token = localStorage.getItem('token');
        if (!token) return null;

        try {
            const payloadBase64 = token.split('.')[1];
            // Fix padding issue (JWT sometimes removes =)
            const padded = payloadBase64 + '='.repeat((4 - payloadBase64.length % 4) % 4);
            const payload = JSON.parse(atob(padded));

            return {
                email: payload.sub || 'Unknown User',
                roles: payload.roles || []  // e.g., ["ROLE_CUSTOMER"] or ["ROLE_ADMIN"]
            };
        } catch (error) {
            console.error('Invalid or corrupted token:', error);
            return null;
        }
    };

    const user = decodeToken();

    // If no valid token → redirect to login
    useEffect(() => {
        if (!user) {
            localStorage.removeItem('token');
            navigate('/');
        }
    }, [user, navigate]);

    // While checking token
    if (!user) {
        return null;
    }

    // Determine role
    const isAdmin = user.roles.includes('ROLE_ADMIN');
    const roleName = isAdmin ? 'Admin' : 'User';
    const badgeClass = isAdmin ? 'bg-danger' : 'bg-success';

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="card shadow-lg border-0 p-5 text-center" style={{ maxWidth: '550px', width: '100%' }}>
                <h2 className="mb-4 fw-bold text-primary">Welcome to Dashboard</h2>

                <p className="fs-4 mb-3">
                    Hello, <strong>{user.email}</strong>!
                </p>

                <p className="fs-5 text-muted mb-4">
                    You are logged in as:
                </p>

                <span className={`badge ${badgeClass} fs-5 px-4 py-2 mb-5`}>
                    {roleName}
                </span>

                <p className="text-success fs-5 mb-5">
                    ✓ You are logged in successfully.
                </p>

                <button
                    onClick={handleLogout}
                    className="btn btn-outline-danger btn-lg px-5"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}

export default WelcomeDashboard;