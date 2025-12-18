import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import Navbar from '../components/layout/Navbar';
import '../styles/HomePage.css';

const LibraryPage = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
            navigate('/login');
            return;
        }
        setUser(currentUser);
    }, [navigate]);

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <div className="home-page-pro">
            <Navbar user={user} onLogout={handleLogout} />

            <main className="main-content">
                <div className="content-container">
                    <div className="page-header">
                        <div className="header-text">
                            <h1>My Library</h1>
                            <p>Books you've read and saved</p>
                        </div>
                    </div>

                    <div className="empty-state" style={{ background: 'white', borderRadius: '12px', padding: '80px 20px', border: '1px solid #e2e8f0' }}>
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 24px', color: '#cbd5e1' }}>
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2"/>
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        <h3>Your library is empty</h3>
                        <p>Start adding books to build your personal collection</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LibraryPage;