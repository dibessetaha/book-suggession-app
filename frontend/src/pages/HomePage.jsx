import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import api from '../services/api';
import Navbar from '../components/layout/Navbar';
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

    if (!user) return null;

    return (
        <div className="home-page-pro">
            <Navbar user={user} onLogout={handleLogout} />

            <main className="main-content">
                <div className="content-container">
                    {/* Header Section */}
                    <div className="page-header">
                        <div className="header-text">
                            <h1>Recommended for You</h1>
                            <p>Personalized book recommendations based on your preferences</p>
                        </div>
                        <div className="header-actions">
                            <button 
                                onClick={() => setShowPreferences(true)}
                                className="btn-secondary-pro"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M12 1v6m0 6v6M23 12h-6m-6 0H1" stroke="currentColor" strokeWidth="2"/>
                                </svg>
                                Preferences
                            </button>
                            <button 
                                onClick={() => user && fetchRecommendations(user.userId)}
                                className="btn-primary-pro"
                                disabled={loading}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" stroke="currentColor" strokeWidth="2"/>
                                </svg>
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* Preferences Preview */}
                    {userProfile && (
                        <div className="preferences-preview">
                            <div className="preview-section">
                                <span className="preview-label">Genres</span>
                                <div className="preview-tags">
                                    {userProfile.favoriteGenres.map(genre => (
                                        <span key={genre} className="preview-tag">{genre}</span>
                                    ))}
                                </div>
                            </div>
                            {userProfile.favoriteAuthors.length > 0 && (
                                <div className="preview-section">
                                    <span className="preview-label">Authors</span>
                                    <div className="preview-tags">
                                        {userProfile.favoriteAuthors.map(author => (
                                            <span key={author} className="preview-tag">{author}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Books Grid */}
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner-pro"></div>
                            <p>Loading recommendations...</p>
                        </div>
                    ) : (
                        <>
                            <div className="results-header">
                                <h2>{recommendations.length} Books Found</h2>
                            </div>
                            <div className="books-grid-pro">
                                {recommendations.length > 0 ? (
                                    recommendations.map((book) => (
                                        <BookCard key={book.googleBookId} book={book} />
                                    ))
                                ) : (
                                    <div className="empty-state">
                                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2"/>
                                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2"/>
                                        </svg>
                                        <h3>No recommendations found</h3>
                                        <p>Try updating your preferences to get personalized recommendations</p>
                                        <button onClick={() => setShowPreferences(true)} className="btn-primary-pro">
                                            Update Preferences
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </main>

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