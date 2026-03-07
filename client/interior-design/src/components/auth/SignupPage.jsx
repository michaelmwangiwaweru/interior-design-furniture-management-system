import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    MDBContainer,
    MDBInput,
} from 'mdb-react-ui-kit';

function SignupPage() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('USER'); // Changed default
    const [mobile, setMobileNumber] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSignup = async () => {
        setError('');
        setLoading(true);

        try {
            if (!fullName || !email || !password || !confirmPassword || !mobile) {
                setError('Please fill in all fields.');
                setLoading(false);
                return;
            }

            if (password !== confirmPassword) {
                setError('Passwords do not match.');
                setLoading(false);
                return;
            }

            const response = await axios.post('http://localhost:9193/auth/signup', {
                fullName,
                email,
                password,
                role,
                mobile
            });

            console.log('Signup successful:', response.data);

            alert('Account created successfully! You can now log in.');
            
            setFullName('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setMobileNumber('');
            setRole('USER'); // Reset to USER

            navigate('/');

        } catch (err) {
            console.error('Signup error:', err);

            let errorMessage = 'Signup failed. Please try again.';

            if (err.response) {
                const backendMsg = err.response.data;

                if (typeof backendMsg === 'string') {
                    if (backendMsg.includes('Email already in use')) {
                        errorMessage = 'This email is already registered. Please use a different email or log in.';
                    } else {
                        errorMessage = backendMsg;
                    }
                } else {
                    errorMessage = 'Server error. Please try again later.';
                }
            } else if (err.code === 'ERR_NETWORK') {
                errorMessage = 'Cannot connect to server. Make sure your Spring Boot backend is running on port 9193.';
            } else {
                errorMessage = err.message || errorMessage;
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="border rounded-lg shadow p-5 bg-white" style={{ maxWidth: '600px', width: '100%' }}>
                <MDBContainer>
                    <h2 className="mb-4 text-center fw-bold">Sign Up</h2>

                    {error && (
                        <div className="alert alert-danger text-center mb-4" role="alert">
                            {error}
                        </div>
                    )}

                    <MDBInput
                        wrapperClass="mb-3"
                        placeholder="Full Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                    />

                    <MDBInput
                        wrapperClass="mb-3"
                        placeholder="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <MDBInput
                        wrapperClass="mb-3"
                        placeholder="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <MDBInput
                        wrapperClass="mb-3"
                        placeholder="Confirm Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />

                    <MDBInput
                        wrapperClass="mb-3"
                        placeholder="Mobile Number"
                        value={mobile}
                        onChange={(e) => setMobileNumber(e.target.value)}
                    />

                    <div className="mb-4">
                        <label className="form-label">Role:</label>
                        <select
                            className="form-select"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="USER">User</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>

                    <button
                        className="btn btn-primary w-100 mb-4"
                        onClick={handleSignup}
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>

                    <div className="text-center">
                        <p>
                            Already have an account? <a href="/">Login here</a>
                        </p>
                    </div>
                </MDBContainer>
            </div>
        </div>
    );
}

export default SignupPage;
