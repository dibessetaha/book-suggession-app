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
    const [notification, setNotification] = useState(null);
    
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
            showNotification('Error loading profile', 'error');
        }
    };

    const fetchRecommendations = async (userId) => {
        setLoading(true);
        try {
            const response = await api.get(`/books/recommendations/${userId}?limit=20`);
            setRecommendations(response.data.recommendations || response.data);
            
            if (response.data.recommendations?.length === 0) {
                showNotification('No recommendations found. Try updating your preferences!', 'info');
            }
        } catch (error) {
            console.error('Error fetching recommendations:', error);
            showNotification('Error loading recommendations', 'error');
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
            showNotification('Preferences updated successfully!', 'success');
        }
    };

    const handleAddToLibrary = async (book) => {
        try {
            await api.post(`/users/${user.userId}/library`, {
                googleBookId: book.googleBookId
            });
            
            showNotification(`"${book.title}" added to your library!`, 'success');
        } catch (error) {
            console.error('Error adding to library:', error);
            
            if (error.response?.status === 400 || error.response?.data?.message?.includes('already')) {
                showNotification('Book already in your library', 'info');
                throw new Error('Book already in your library');
            } else {
                showNotification('Error adding book to library', 'error');
                throw new Error('Error adding book to library');
            }
        }
    };

    const showNotification = (message, type = 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    if (!user) return null;

    return (
        <div className="home-page-pro">
            <Navbar user={user} onLogout={handleLogout} />

            {/* Notification Toast */}
            {notification && (
                <div className={`notification-toast ${notification.type}`}>
                    <div className="notification-content">
                        {notification.type === 'success' && (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                        )}
                        {notification.type === 'error' && (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                        )}
                        {notification.type === 'info' && (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                        )}
                        <span>{notification.message}</span>
                    </div>
                </div>
            )}

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
                                <span className="preview-label">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2"/>
                                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2"/>
                                    </svg>
                                    Genres
                                </span>
                                <div className="preview-tags">
                                    {userProfile.favoriteGenres && userProfile.favoriteGenres.length > 0 ? (
                                        userProfile.favoriteGenres.map(genre => (
                                            <span key={genre} className="preview-tag">{genre}</span>
                                        ))
                                    ) : (
                                        <span className="empty-tag">No genres selected</span>
                                    )}
                                </div>
                            </div>
                            
                            {userProfile.favoriteAuthors && userProfile.favoriteAuthors.length > 0 && (
                                <div className="preview-section">
                                    <span className="preview-label">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                                            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                                        </svg>
                                        Authors
                                    </span>
                                    <div className="preview-tags">
                                        {userProfile.favoriteAuthors.map(author => (
                                            <span key={author} className="preview-tag">{author}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Loading State */}
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner-pro"></div>
                            <p>Loading your personalized recommendations...</p>
                        </div>
                    ) : (
                        <>
                            {/* Results Header */}
                            <div className="results-header">
                                <h2>
                                    {recommendations.length > 0 ? (
                                        <>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ display: 'inline', marginRight: '8px' }}>
                                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2"/>
                                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2"/>
                                            </svg>
                                            {recommendations.length} {recommendations.length === 1 ? 'Book' : 'Books'} Found
                                        </>
                                    ) : (
                                        'No Books Found'
                                    )}
                                </h2>
                            </div>

                            {/* Books Grid */}
                            <div className="books-grid-pro">
                                {recommendations.length > 0 ? (
                                    recommendations.map((book) => (
                                        <BookCard 
                                            key={book.googleBookId} 
                                            book={book}
                                            onAddToLibrary={handleAddToLibrary}
                                        />
                                    ))
                                ) : (
                                    <div className="empty-state">
                                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2"/>
                                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2"/>
                                        </svg>
                                        <h3>No recommendations found</h3>
                                        <p>We couldn't find books matching your preferences. Try updating your preferences or adding more genres and authors.</p>
                                        <button 
                                            onClick={() => setShowPreferences(true)} 
                                            className="btn-primary-pro"
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                                                <path d="M12 1v6m0 6v6M23 12h-6m-6 0H1" stroke="currentColor" strokeWidth="2"/>
                                            </svg>
                                            Update Preferences
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </main>

            {/* Preferences Modal */}
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