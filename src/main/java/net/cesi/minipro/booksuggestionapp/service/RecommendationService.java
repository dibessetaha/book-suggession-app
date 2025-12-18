package net.cesi.minipro.booksuggestionapp.service;

import net.cesi.minipro.booksuggestionapp.dto.BookDTO;
import net.cesi.minipro.booksuggestionapp.enums.PreferenceType;
import net.cesi.minipro.booksuggestionapp.models.Preference;
import net.cesi.minipro.booksuggestionapp.repository.PreferenceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    private static final Logger log = LoggerFactory.getLogger(RecommendationService.class);

    private final GoogleBooksApiService googleBooksService;
    private final PreferenceRepository preferenceRepository;

    @Autowired
    public RecommendationService(
            GoogleBooksApiService googleBooksService,
            PreferenceRepository preferenceRepository) {
        this.googleBooksService = googleBooksService;
        this.preferenceRepository = preferenceRepository;
    }

    public List<BookDTO> getRecommendations(Long userId, int limit) {
        log.info("Getting recommendations for user: {}", userId);

        // 1. Récupérer les préférences
        List<Preference> preferences = preferenceRepository.findByUserId(userId);

        if (preferences.isEmpty()) {
            log.warn("No preferences found for user {}, returning bestsellers", userId);
            return googleBooksService.searchBooks("bestseller", limit);
        }

        log.info("Found {} preferences for user {}", preferences.size(), userId);

        // 2. Séparer genres et auteurs
        List<String> favoriteGenres = preferences.stream()
                .filter(p -> p.getPreferenceType() == PreferenceType.GENRE)
                .map(Preference::getPreferenceValue)
                .collect(Collectors.toList());

        List<String> favoriteAuthors = preferences.stream()
                .filter(p -> p.getPreferenceType() == PreferenceType.AUTHOR)
                .map(Preference::getPreferenceValue)
                .collect(Collectors.toList());

        log.info("Genres: {}, Authors: {}", favoriteGenres, favoriteAuthors);

        // 3. Chercher des livres
        Set<BookDTO> candidateBooks = new HashSet<>();

        // Chercher par genre
        for (String genre : favoriteGenres) {
            log.info("Searching books for genre: {}", genre);
            List<BookDTO> books = googleBooksService.searchByGenre(genre, 20);
            log.info("Found {} books for genre: {}", books.size(), genre);
            candidateBooks.addAll(books);
        }

        // Chercher par auteur
        for (String author : favoriteAuthors) {
            log.info("Searching books for author: {}", author);
            List<BookDTO> books = googleBooksService.searchByAuthor(author, 20);
            log.info("Found {} books for author: {}", books.size(), author);
            candidateBooks.addAll(books);
        }

        log.info("Total candidate books: {}", candidateBooks.size());

        // 4. Calculer scores et trier
        return candidateBooks.stream()
                .peek(book -> {
                    double score = calculateRecommendationScore(book, favoriteGenres, favoriteAuthors);
                    book.setRecommendationScore(score);
                    log.debug("Book: {} - Score: {}", book.getTitle(), score);
                })
                .filter(book -> book.getRecommendationScore() > 0) // Seulement les livres avec score > 0
                .sorted(Comparator.comparingDouble(BookDTO::getRecommendationScore).reversed())
                .limit(limit)
                .collect(Collectors.toList());
    }

    private double calculateRecommendationScore(
            BookDTO book,
            List<String> favoriteGenres,
            List<String> favoriteAuthors) {

        double score = 0.0;

        // Score par genres (COMPARAISON AMÉLIORÉE)
        if (book.getCategories() != null && !book.getCategories().isEmpty()) {
            for (String bookCategory : book.getCategories()) {
                for (String favoriteGenre : favoriteGenres) {
                    // Comparaison insensible à la casse et partielle
                    if (bookCategory.toLowerCase().contains(favoriteGenre.toLowerCase()) ||
                            favoriteGenre.toLowerCase().contains(bookCategory.toLowerCase())) {
                        score += 50;
                        log.debug("Genre match: {} ~ {}", bookCategory, favoriteGenre);
                        break; // Éviter double comptage
                    }
                }
            }
        }

        // Score par auteurs (COMPARAISON AMÉLIORÉE)
        if (book.getAuthors() != null && !book.getAuthors().isEmpty()) {
            for (String bookAuthor : book.getAuthors()) {
                for (String favoriteAuthor : favoriteAuthors) {
                    // Comparaison insensible à la casse et partielle
                    if (bookAuthor.toLowerCase().contains(favoriteAuthor.toLowerCase()) ||
                            favoriteAuthor.toLowerCase().contains(bookAuthor.toLowerCase())) {
                        score += 30;
                        log.debug("Author match: {} ~ {}", bookAuthor, favoriteAuthor);
                        break; // Éviter double comptage
                    }
                }
            }
        }

        // Bonus note moyenne
        if (book.getAverageRating() != null) {
            score += book.getAverageRating() * 4;
        }

        // Bonus livres récents
        if (book.getPublishedDate() != null && book.getPublishedDate().length() >= 4) {
            try {
                int year = Integer.parseInt(book.getPublishedDate().substring(0, 4));
                if (year >= 2020) score += 10;
                else if (year >= 2015) score += 5;
            } catch (Exception e) {
                // Ignore
            }
        }

        return score;
    }
}