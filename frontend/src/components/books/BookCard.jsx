import React, { useState } from 'react';
import '../../styles/BookCard.css';

const BookCard = ({ book, onAddToLibrary }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [added, setAdded] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleAddToLibrary = async (e) => {
        e.stopPropagation();
        
        if (loading || added) return;
        
        setLoading(true);
        
        try {
            if (onAddToLibrary) {
                await onAddToLibrary(book);
            }
            setAdded(true);
            setTimeout(() => setAdded(false), 3000);
        } catch (error) {
            console.error('Error adding to library:', error);
        } finally {
            setLoading(false);
        }
    };

    const truncate = (text, maxLength) => {
        if (!text) return 'No description available';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <>
            {/* Card principale */}
            <div className="book-card-pro" onClick={() => setShowDetails(true)}>
                <div className="book-cover-pro">
                    {book.thumbnailUrl ? (
                        <img src={book.thumbnailUrl} alt={book.title} />
                    ) : (
                        <div className="no-cover-pro">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2"/>
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                        </div>
                    )}
                    
                    {book.recommendationScore && (
                        <div className="score-badge-pro">
                            ⭐ {Math.round(book.recommendationScore)}
                        </div>
                    )}
                    
                    <button 
                        className={`add-to-library-btn ${added ? 'added' : ''} ${loading ? 'loading' : ''}`}
                        onClick={handleAddToLibrary}
                        disabled={loading || added}
                        title={added ? 'Added to library' : 'Add to library'}
                    >
                        {loading ? (
                            <svg className="spinner-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="40"/>
                            </svg>
                        ) : added ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                        )}
                    </button>
                </div>
                
                <div className="book-info-pro">
                    <h3 className="book-title-pro">{book.title}</h3>
                    
                    {book.authors && book.authors.length > 0 && (
                        <p className="book-authors-pro">
                            {book.authors.slice(0, 2).join(', ')}
                            {book.authors.length > 2 && ` +${book.authors.length - 2}`}
                        </p>
                    )}
                    
                    {book.averageRating && (
                        <div className="rating-pro">
                            {'⭐'.repeat(Math.round(book.averageRating))}
                            <span>{book.averageRating.toFixed(1)}</span>
                        </div>
                    )}
                    
                    {book.categories && book.categories.length > 0 && (
                        <div className="categories-pro">
                            {book.categories.slice(0, 2).map((category, index) => (
                                <span key={index} className="category-tag-pro">
                                    {category}
                                </span>
                            ))}
                            {book.categories.length > 2 && (
                                <span className="category-tag-pro">
                                    +{book.categories.length - 2}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal détails */}
            {showDetails && (
                <div className="modal-overlay-pro" onClick={() => setShowDetails(false)}>
                    <div className="book-details-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-pro" onClick={() => setShowDetails(false)}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                        </button>
                        
                        <div className="book-details-content">
                            <div className="details-cover">
                                {book.thumbnailUrl ? (
                                    <img src={book.thumbnailUrl} alt={book.title} />
                                ) : (
                                    <div className="no-cover-large-pro">
                                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2"/>
                                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2"/>
                                        </svg>
                                    </div>
                                )}
                                
                                <button 
                                    className={`add-library-large ${added ? 'added' : ''}`}
                                    onClick={handleAddToLibrary}
                                    disabled={loading || added}
                                >
                                    {loading ? 'Adding...' : added ? 'Added ✓' : 'Add to Library'}
                                </button>
                            </div>
                            
                            <div className="details-info">
                                <h2>{book.title}</h2>
                                
                                {book.authors && book.authors.length > 0 && (
                                    <p className="detail-item">
                                        <strong>Author(s):</strong> {book.authors.join(', ')}
                                    </p>
                                )}
                                
                                {book.averageRating && (
                                    <div className="detail-item">
                                        <strong>Rating:</strong>
                                        <span className="detail-rating">
                                            {' '}{book.averageRating.toFixed(1)}/5 {'⭐'.repeat(Math.round(book.averageRating))}
                                        </span>
                                    </div>
                                )}
                                
                                {book.categories && book.categories.length > 0 && (
                                    <div className="detail-item">
                                        <strong>Genres:</strong>
                                        <div className="categories-pro" style={{ marginTop: '8px' }}>
                                            {book.categories.map((category, index) => (
                                                <span key={index} className="category-tag-pro">
                                                    {category}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                <div className="details-grid">
                                    {book.publishedDate && (
                                        <div className="detail-item">
                                            <strong>Published:</strong>
                                            <span>{book.publishedDate}</span>
                                        </div>
                                    )}
                                    
                                    {book.pageCount && (
                                        <div className="detail-item">
                                            <strong>Pages:</strong>
                                            <span>{book.pageCount}</span>
                                        </div>
                                    )}
                                    
                                    {book.language && (
                                        <div className="detail-item">
                                            <strong>Language:</strong>
                                            <span>{book.language.toUpperCase()}</span>
                                        </div>
                                    )}
                                </div>
                                
                                {book.description && (
                                    <div className="detail-description">
                                        <strong>Description</strong>
                                        <p>{book.description}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BookCard;