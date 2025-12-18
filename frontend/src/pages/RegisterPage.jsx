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
    const [authors, setAuthors] = useState([]);
    const [currentGenre, setCurrentGenre] = useState('');
    const [currentAuthor, setCurrentAuthor] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();

    const genreOptions = [
        'Fantasy', 'Science Fiction', 'Mystery', 'Thriller', 
        'Romance', 'Historical Fiction', 'Horror', 'Adventure',
        'Biography', 'Self-Help', 'Business', 'Philosophy', 'Poetry'
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

    const addAuthor = () => {
        if (currentAuthor.trim() && !authors.includes(currentAuthor.trim())) {
            setAuthors([...authors, currentAuthor.trim()]);
            setCurrentAuthor('');
        }
    };

    const removeAuthor = (author) => {
        setAuthors(authors.filter(a => a !== author));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        if (formData.password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        if (genres.length === 0) {
            setError('Veuillez sélectionner au moins un genre');
            return;
        }

        setLoading(true);

        try {
            await authService.register(
                formData.username,
                formData.email,
                formData.password,
                genres,
                authors
            );
            navigate('/home');
        } catch (err) {
            setError(err.toString());
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card register-card">
                <div className="auth-header">
                    <h1>📚 Book Suggestions</h1>
                    <h2>Inscription</h2>
                    <p>Créez votre compte et découvrez vos prochaines lectures</p>
                </div>
                
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Nom d'utilisateur</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="John Doe"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="votre@email.com"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Mot de passe</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Confirmer</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <div className="preferences-section">
                        <h3>📖 Vos genres préférés *</h3>
                        <div className="add-preference">
                            <select 
                                value={currentGenre}
                                onChange={(e) => setCurrentGenre(e.target.value)}
                                className="genre-select"
                            >
                                <option value="">Sélectionner un genre</option>
                                {genreOptions.map(genre => (
                                    <option key={genre} value={genre}>{genre}</option>
                                ))}
                            </select>
                            <button type="button" onClick={addGenre} className="btn-add">
                                Ajouter
                            </button>
                        </div>
                        <div className="tags">
                            {genres.map(genre => (
                                <span key={genre} className="tag">
                                    {genre}
                                    <button type="button" onClick={() => removeGenre(genre)}>×</button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="preferences-section">
                        <h3>✍️ Vos auteurs préférés (optionnel)</h3>
                        <div className="add-preference">
                            <input
                                type="text"
                                value={currentAuthor}
                                onChange={(e) => setCurrentAuthor(e.target.value)}
                                placeholder="Nom de l'auteur"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addAuthor();
                                    }
                                }}
                            />
                            <button type="button" onClick={addAuthor} className="btn-add">
                                Ajouter
                            </button>
                        </div>
                        <div className="tags">
                            {authors.map(author => (
                                <span key={author} className="tag">
                                    {author}
                                    <button type="button" onClick={() => removeAuthor(author)}>×</button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Création...' : 'Créer mon compte'}
                    </button>
                </form>

                <p className="auth-footer">
                    Déjà un compte? <Link to="/login">Se connecter</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;