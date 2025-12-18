import React, { useState } from 'react';
import '../../styles/BookCard.css';

const BookCard = ({ book }) => {
    const [showDetails, setShowDetails] = useState(false);

    const truncate = (text, maxLength) => {
        if (!text) return 'Description non disponible';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <>
            <div className="book-card" onClick={() => setShowDetails(true)}>
                <div className="book-cover">
                    {book.thumbnailUrl ? (
                        <img src={book.thumbnailUrl} alt={book.title} />
                    ) : (
                        <div className="no-cover">
                            <span>📚</span>
                            <p>Pas de couverture</p>
                        </div>
                    )}
                    {book.recommendationScore && (
                        <div className="score-badge">
                            ⭐ {Math.round(book.recommendationScore)}
                        </div>
                    )}
                </div>
                
                <div className="book-info">
                    <h3 className="book-title">{book.title}</h3>
                    
                    {book.authors && book.authors.length > 0 && (
                        <p className="book-authors">
                            ✍️ {book.authors.join(', ')}
                        </p>
                    )}
                    
                    {book.averageRating && (
                        <div className="rating">
                            {'⭐'.repeat(Math.round(book.averageRating))}
                            <span className="rating-value">
                                {book.averageRating.toFixed(1)}
                            </span>
                        </div>
                    )}
                    
                    {book.categories && book.categories.length > 0 && (
                        <div className="categories">
                            {book.categories.slice(0, 2).map((category, index) => (
                                <span key={index} className="category-tag">
                                    {category}
                                </span>
                            ))}
                        </div>
                    )}
                    
                    <p className="book-description">
                        {truncate(book.description, 120)}
                    </p>
                    
                    <button className="btn-details">
                        Voir les détails →
                    </button>
                </div>
            </div>

            {showDetails && (
                <div className="modal-overlay" onClick={() => setShowDetails(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowDetails(false)}>
                            ×
                        </button>
                        
                        <div className="modal-body">
                            <div className="modal-cover">
                                {book.thumbnailUrl ? (
                                    <img src={book.thumbnailUrl} alt={book.title} />
                                ) : (
                                    <div className="no-cover-large">
                                        <span>📚</span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="modal-info">
                                <h2>{book.title}</h2>
                                
                                {book.authors && book.authors.length > 0 && (
                                    <p className="modal-authors">
                                        <strong>Auteur(s):</strong> {book.authors.join(', ')}
                                    </p>
                                )}
                                
                                {book.averageRating && (
                                    <div className="modal-rating">
                                        <strong>Note:</strong> {'⭐'.repeat(Math.round(book.averageRating))} 
                                        {book.averageRating.toFixed(1)}/5
                                    </div>
                                )}
                                
                                {book.categories && book.categories.length > 0 && (
                                    <div className="modal-categories">
                                        <strong>Genres:</strong>
                                        <div className="categories">
                                            {book.categories.map((category, index) => (
                                                <span key={index} className="category-tag">
                                                    {category}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {book.publishedDate && (
                                    <p><strong>Publié:</strong> {book.publishedDate}</p>
                                )}
                                
                                {book.pageCount && (
                                    <p><strong>Pages:</strong> {book.pageCount}</p>
                                )}
                                
                                {book.language && (
                                    <p><strong>Langue:</strong> {book.language.toUpperCase()}</p>
                                )}
                                
                                <div className="modal-description">
                                    <strong>Description:</strong>
                                    <p>{book.description || 'Description non disponible'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BookCard;