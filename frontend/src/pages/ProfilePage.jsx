import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import api from '../services/api';
import Navbar from '../components/layout/Navbar';
import PreferencesModal from '../components/preferences/PreferencesModal';
import '../styles/ProfilePage.css';

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [showPreferences, setShowPreferences] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
            navigate('/login');
            return;
        }
        setUser(currentUser);
        fetchUserProfile(currentUser.userId);
    }, [navigate]);

    const fetchUserProfile = async (userId) => {
        setLoading(true);
        try {
            const response = await api.get(`/users/${userId}/profile`);
            setUserProfile(response.data);
        } catch (error) {
            console.error('Error fetching profile:', error);
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
        }
    };

    if (!user) return null;

    return (
        <div className="home-page-pro">
            <Navbar user={user} onLogout={handleLogout} />

            <main className="main-content">
                <div className="content-container">
                    <div className="page-header">
                        <div className="header-text">
                            <h1>Profile Settings</h1>
                            <p>Manage your account and preferences</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner-pro"></div>
                            <p>Loading profile...</p>
                        </div>
                    ) : userProfile && (
                        <div className="profile-content">
                            {/* Profile Info Card */}
                            <div className="profile-card">
                                <div className="profile-header">
                                    <div className="profile-avatar-large">
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="profile-info">
                                        <h2>{userProfile.username}</h2>
                                        <p>{userProfile.email}</p>
                                        <span className="profile-date">
                                            Member since {new Date(userProfile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Preferences Card */}
                            <div className="profile-card">
                                <div className="card-header">
                                    <h3>Reading Preferences</h3>
                                    <button 
                                        onClick={() => setShowPreferences(true)}
                                        className="btn-secondary-pro"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2"/>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2"/>
                                        </svg>
                                        Edit
                                    </button>
                                </div>

                                <div className="preferences-grid">
                                    <div className="pref-section">
                                        <label>Favorite Genres</label>
                                        <div className="tags-list">
                                            {userProfile.favoriteGenres.map(genre => (
                                                <span key={genre} className="tag-item">{genre}</span>
                                            ))}
                                        </div>
                                    </div>

                                    {userProfile.favoriteAuthors.length > 0 && (
                                        <div className="pref-section">
                                            <label>Favorite Authors</label>
                                            <div className="tags-list">
                                                {userProfile.favoriteAuthors.map(author => (
                                                    <span key={author} className="tag-item">{author}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Stats Card */}
                            <div className="profile-card">
                                <div className="card-header">
                                    <h3>Statistics</h3>
                                </div>
                                <div className="stats-grid">
                                    <div className="stat-item">
                                        <div className="stat-value">0</div>
                                        <div className="stat-label">Books Read</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-value">{userProfile.favoriteGenres.length}</div>
                                        <div className="stat-label">Genres</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-value">{userProfile.favoriteAuthors.length}</div>
                                        <div className="stat-label">Authors</div>
                                    </div>
                                </div>
                            </div>
                        </div>
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

export default ProfilePage;