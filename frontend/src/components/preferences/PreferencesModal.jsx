import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import '../../styles/PreferencesModal.css';

const PreferencesModal = ({ userId, currentProfile, onClose, onUpdate }) => {
    const [genres, setGenres] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [currentGenre, setCurrentGenre] = useState('');
    const [currentAuthor, setCurrentAuthor] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const genreOptions = [
        'Business', 'Self-Help', 'Science Fiction', 'Fantasy', 
        'Mystery', 'Thriller', 'Romance', 'Horror', 
        'Biography', 'History', 'Philosophy', 'Poetry',
        'Adventure', 'Drama', 'Comedy'
    ];

    useEffect(() => {
        if (currentProfile) {
            setGenres(currentProfile.favoriteGenres || []);
            setAuthors(currentProfile.favoriteAuthors || []);
        }
    }, [currentProfile]);

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

        if (genres.length === 0) {
            setError('Please select at least one genre');
            return;
        }

        setLoading(true);

        try {
            await api.put(`/users/${userId}/preferences`, {
                genres: genres,
                authors: authors
            });
            onUpdate();
        } catch (err) {
            setError('Error updating preferences');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay-pro" onClick={onClose}>
            <div className="modal-content-pro" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header-pro">
                    <div className="modal-title">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                            <path d="M12 1v6m0 6v6M23 12h-6m-6 0H1" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        <h2>Edit Preferences</h2>
                    </div>
                    <button className="modal-close-pro" onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="error-message-modal">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                            <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="modal-form-pro">
                    {/* Genres Section */}
                    <div className="form-section-pro">
                        <label className="section-label-pro">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2"/>
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            Favorite Genres *
                        </label>
                        
                        <div className="input-group-pro">
                            <select 
                                value={currentGenre}
                                onChange={(e) => setCurrentGenre(e.target.value)}
                                className="select-pro"
                            >
                                <option value="">Select a genre</option>
                                {genreOptions.map(genre => (
                                    <option key={genre} value={genre}>{genre}</option>
                                ))}
                            </select>
                            <button type="button" onClick={addGenre} className="btn-add-modal">
                                Add
                            </button>
                        </div>

                        {genres.length > 0 ? (
                            <div className="tags-container-pro">
                                {genres.map(genre => (
                                    <span key={genre} className="tag-pro">
                                        {genre}
                                        <button type="button" onClick={() => removeGenre(genre)}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2"/>
                                            </svg>
                                        </button>
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-hint">No genres selected yet</div>
                        )}
                    </div>

                    {/* Authors Section */}
                    <div className="form-section-pro">
                        <label className="section-label-pro">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            Favorite Authors
                        </label>
                        
                        <div className="input-group-pro">
                            <input
                                type="text"
                                value={currentAuthor}
                                onChange={(e) => setCurrentAuthor(e.target.value)}
                                placeholder="Enter author name"
                                className="input-pro"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addAuthor();
                                    }
                                }}
                            />
                            <button type="button" onClick={addAuthor} className="btn-add-modal">
                                Add
                            </button>
                        </div>

                        {authors.length > 0 ? (
                            <div className="tags-container-pro">
                                {authors.map(author => (
                                    <span key={author} className="tag-pro">
                                        {author}
                                        <button type="button" onClick={() => removeAuthor(author)}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2"/>
                                            </svg>
                                        </button>
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-hint">Optional - Add your favorite authors</div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="modal-actions-pro">
                        <button type="button" onClick={onClose} className="btn-cancel-modal">
                            Cancel
                        </button>
                        <button type="submit" className="btn-save-modal" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PreferencesModal;