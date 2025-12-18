import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import '../styles/Auth.css';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [genres, setGenres] = useState([]);
    const [currentGenre, setCurrentGenre] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();

    const genreOptions = [
        'Business', 'Self-Help', 'Science Fiction', 'Fantasy', 
        'Mystery', 'Thriller', 'Romance', 'Horror', 
        'Biography', 'History', 'Philosophy', 'Poetry'
    ];

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const addGenre = () => {
        if (currentGenre && !genres.includes(currentGenre)) {
            setGenres([...genres, currentGenre]);
            setCurrentGenre('');
        }
    };

    const removeGenre = (genre) => {
        setGenres(genres.filter(g => g !== genre));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (genres.length === 0) {
            setError('Please select at least one genre');
            return;
        }

        setLoading(true);

        try {
            await authService.register(
                formData.username,
                formData.email,
                formData.password,
                genres,
                []
            );
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
                <div className="auth-card-pro register-card-pro">
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
                        <h2>Create your account</h2>
                        <p>Get personalized book recommendations</p>
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
                            <label>Full name</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="John Doe"
                                required
                                autoFocus
                            />
                        </div>

                        <div className="form-group-pro">
                            <label>Email address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div className="form-row-pro">
                            <div className="form-group-pro">
                                <label>Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Min. 6 characters"
                                    required
                                />
                            </div>

                            <div className="form-group-pro">
                                <label>Confirm password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Re-enter password"
                                    required
                                />
                            </div>
                        </div>

                        <div className="preferences-section-pro">
                            <label className="section-label">Favorite genres *</label>
                            <div className="genre-selector">
                                <select 
                                    value={currentGenre}
                                    onChange={(e) => setCurrentGenre(e.target.value)}
                                    className="genre-select-pro"
                                >
                                    <option value="">Select a genre</option>
                                    {genreOptions.map(genre => (
                                        <option key={genre} value={genre}>{genre}</option>
                                    ))}
                                </select>
                                <button type="button" onClick={addGenre} className="btn-add-pro">
                                    Add
                                </button>
                            </div>
                            
                            {genres.length > 0 && (
                                <div className="selected-tags">
                                    {genres.map(genre => (
                                        <span key={genre} className="selected-tag">
                                            {genre}
                                            <button type="button" onClick={() => removeGenre(genre)}>×</button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button type="submit" className="btn-submit-pro" disabled={loading}>
                            {loading ? 'Creating account...' : 'Create account'}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="auth-footer-pro">
                        <p>
                            Already have an account? 
                            <Link to="/login">Sign in</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;