import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import '../styles/Auth.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authService.login(email, password);
            navigate('/home');
        } catch (err) {
            setError(err.toString());
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page-pro">
            <div className="auth-container-pro">
                <div className="auth-card-pro">
                    {/* Logo */}
                    <div className="auth-logo">
                        <div className="logo-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2"/>
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                        </div>
                        <h1>BookRecommend</h1>
                    </div>

                    {/* Header */}
                    <div className="auth-header-pro">
                        <h2>Welcome back</h2>
                        <p>Sign in to your account to continue</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="error-message-pro">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="auth-form-pro">
                        <div className="form-group-pro">
                            <label>Email address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                autoFocus
                            />
                        </div>

                        <div className="form-group-pro">
                            <label>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        <button type="submit" className="btn-submit-pro" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="auth-footer-pro">
                        <p>
                            Don't have an account? 
                            <Link to="/register">Create account</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;