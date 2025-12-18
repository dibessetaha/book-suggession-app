import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import api from '../services/api';
import BookCard from '../components/books/BookCard';
import PreferencesModal from '../components/preferences/PreferencesModal';
import '../styles/HomePage.css';

const HomePage = () => {
    const [user, setUser] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPreferences, setShowPreferences] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    
    const navigate = useNavigate();

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
            navigate('/login');
            return;
        }
        setUser(currentUser);
        fetchUserProfile(currentUser.userId);
        fetchRecommendations(currentUser.userId);
    }, [navigate]);

    const fetchUserProfile = async (userId) => {
        try {
            const response = await api.get(`/users/${userId}/profile`);
            setUserProfile(response.data);
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const fetchRecommendations = async (userId) => {
        setLoading(true);
        try {
            const response = await api.get(`/books/recommendations/${userId}?limit=20`);
            setRecommendations(response.data.recommendations);
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const handlePreferencesUpdate = () => {
        setShowPreferences(false);
        if (user) {
            fetchUserProfile(user.userId);
            fetchRecommendations(user.userId);
        }
    };

    if (!user) {
        return null;
    }

    return (
        <div className="home-page">
            <nav className="navbar">
                <div className="navbar-content">
                    <h1>📚 Book Suggestions</h1>
                    <div className="navbar-actions">
                        <span className="username">Bonjour, {user.username}!</span>
                        <button onClick={handleLogout} className="btn-logout">
                            Déconnexion
                        </button>
                    </div>
                </div>
            </nav>

            <div className="container">
                <div className="hero-section">
                    <h2>Vos recommandations personnalisées</h2>
                    <p>Découvrez des livres basés sur vos préférences</p>
                    
                    {userProfile && (
                        <div className="current-preferences">
                            <div className="pref-group">
                                <strong>📖 Genres:</strong>
                                <div className="tags">
                                    {userProfile.favoriteGenres.map(genre => (
                                        <span key={genre} className="tag">{genre}</span>
                                    ))}
                                </div>
                            </div>
                            {userProfile.favoriteAuthors.length > 0 && (
                                <div className="pref-group">
                                    <strong>✍️ Auteurs:</strong>
                                    <div className="tags">
                                        {userProfile.favoriteAuthors.map(author => (
                                            <span key={author} className="tag">{author}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="action-buttons">
                        <button 
                            onClick={() => setShowPreferences(true)}
                            className="btn-primary"
                        >
                            ⚙️ Modifier mes préférences
                        </button>
                        <button 
                            onClick={() => user && fetchRecommendations(user.userId)}
                            className="btn-secondary"
                            disabled={loading}
                        >
                            🔄 Actualiser
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="loading">
                        <div className="spinner"></div>
                        <p>Chargement de vos recommandations...</p>
                    </div>
                ) : (
                    <div className="books-section">
                        <h3>📚 {recommendations.length} livres recommandés pour vous</h3>
                        <div className="books-grid">
                            {recommendations.length > 0 ? (
                                recommendations.map((book) => (
                                    <BookCard key={book.googleBookId} book={book} />
                                ))
                            ) : (
                                <div className="no-recommendations">
                                    <h3>😔 Aucune recommandation trouvée</h3>
                                    <p>Essayez de modifier vos préférences pour obtenir des suggestions!</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {showPreferences && userProfile && user && (
                <PreferencesModal
                    userId={user.userId}
                    currentProfile={userProfile}
                    onClose={() => setShowPreferences(false)}
                    onUpdate={handlePreferencesUpdate}
                />
            )}
        </div>
    );
};

export default HomePage;