import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Navbar.css';

const Navbar = ({ user, onLogout }) => {
    const [activeTab, setActiveTab] = useState('recommendations');
    const navigate = useNavigate();

    const handleNavigation = (tab, path) => {
        setActiveTab(tab);
        navigate(path);
    };

    return (
        <nav className="professional-navbar">
            <div className="navbar-container">
                <div className="navbar-brand">
                    <div className="brand-logo">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2"/>
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                    </div>
                    <span className="brand-name">BookRecommend</span>
                </div>

                <div className="navbar-menu">
                    <button 
                        className={`nav-item ${activeTab === 'recommendations' ? 'active' : ''}`}
                        onClick={() => handleNavigation('recommendations', '/home')}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2"/>
                            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        Recommendations
                    </button>

                    <button 
                        className={`nav-item ${activeTab === 'library' ? 'active' : ''}`}
                        onClick={() => handleNavigation('library', '/library')}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2"/>
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        My Library
                    </button>

                    <button 
                        className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => handleNavigation('profile', '/profile')}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
                            <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        Profile
                    </button>
                </div>

                <div className="navbar-user">
                    <div className="user-info">
                        <div className="user-avatar">
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="user-name">{user.username}</span>
                    </div>
                    <button onClick={onLogout} className="logout-btn">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;