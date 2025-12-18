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
        'Fantasy', 'Science Fiction', 'Mystery', 'Thriller', 
        'Romance', 'Historical Fiction', 'Horror', 'Adventure',
        'Biography', 'Self-Help', 'Business', 'Philosophy', 
        'Poetry', 'Drama', 'Comedy', 'Action'
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
            setError('Veuillez sélectionner au moins un genre');
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
            setError('Erreur lors de la mise à jour des préférences');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="preferences-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>⚙️ Modifier mes préférences</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="preferences-form">
                    <div className="preferences-section">
                        <h3>📖 Genres préférés *</h3>
                        <div className="add-preference">
                            <select 
                                value={currentGenre}
                                onChange={(e) => setCurrentGenre(e.target.value)}
                            >
                                <option value="">Sélectionner un genre</option>
                                {genreOptions.map(genre => (
                                    <option key={genre} value={genre}>
                                        {genre}
                                    </option>
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
                                    <button type="button" onClick={() => removeGenre(genre)}>
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                        {genres.length === 0 && (
                            <p className="hint">Ajoutez au moins un genre</p>
                        )}
                    </div>

                    <div className="preferences-section">
                        <h3>✍️ Auteurs préférés</h3>
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
                                    <button type="button" onClick={() => removeAuthor(author)}>
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-cancel">
                            Annuler
                        </button>
                        <button type="submit" className="btn-save" disabled={loading}>
                            {loading ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PreferencesModal;