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

        List<Preference> preferences = preferenceRepository.findByUserId(userId);

        if (preferences.isEmpty()) {
            log.warn("No preferences found for user {}, returning bestsellers", userId);
            return googleBooksService.searchBooks("bestseller", limit);
        }

        List<String> favoriteGenres = preferences.stream()
                .filter(p -> p.getPreferenceType() == PreferenceType.GENRE)
                .map(Preference::getPreferenceValue)
                .collect(Collectors.toList());

        List<String> favoriteAuthors = preferences.stream()
                .filter(p -> p.getPreferenceType() == PreferenceType.AUTHOR)
                .map(Preference::getPreferenceValue)
                .collect(Collectors.toList());

        log.info("Genres: {}, Authors: {}", favoriteGenres, favoriteAuthors);

        Set<BookDTO> candidateBooks = new LinkedHashSet<>();

        // Chercher plus de livres par genre (40 au lieu de 20)
        for (String genre : favoriteGenres) {
            log.info("Searching books for genre: {}", genre);
            List<BookDTO> books = googleBooksService.searchByGenre(genre, 40);
            log.info("Found {} books for genre: {}", books.size(), genre);
            candidateBooks.addAll(books);
        }

        for (String author : favoriteAuthors) {
            log.info("Searching books for author: {}", author);
            List<BookDTO> books = googleBooksService.searchByAuthor(author, 20);
            log.info("Found {} books for author: {}", books.size(), author);
            candidateBooks.addAll(books);
        }

        log.info("Total candidate books before scoring: {}", candidateBooks.size());

        List<BookDTO> scoredBooks = candidateBooks.stream()
                .peek(book -> {
                    double score = calculateRecommendationScore(book, favoriteGenres, favoriteAuthors);
                    book.setRecommendationScore(score);
                })
                .filter(book -> book.getRecommendationScore() > 0)
                .sorted(Comparator.comparingDouble(BookDTO::getRecommendationScore).reversed())
                .collect(Collectors.toList());

        log.info("Books after scoring: {}", scoredBooks.size());

        // Si pas assez de résultats, chercher des livres génériques
        if (scoredBooks.size() < limit && !favoriteGenres.isEmpty()) {
            log.info("Not enough results, adding generic books");
            String mainGenre = favoriteGenres.get(0);
            List<BookDTO> genericBooks = googleBooksService.searchBooks(mainGenre, limit);

            for (BookDTO book : genericBooks) {
                if (scoredBooks.size() >= limit) break;
                double score = calculateRecommendationScore(book, favoriteGenres, favoriteAuthors);
                if (score > 0) {
                    book.setRecommendationScore(score);
                    scoredBooks.add(book);
                }
            }
        }

        List<BookDTO> result = scoredBooks.stream()
                .limit(limit)
                .collect(Collectors.toList());

        log.info("Returning {} books", result.size());
        return result;
    }

    private double calculateRecommendationScore(
            BookDTO book,
            List<String> favoriteGenres,
            List<String> favoriteAuthors) {

        double score = 0.0;

        // Score par genres - COMPARAISON FLEXIBLE
        if (book.getCategories() != null && !book.getCategories().isEmpty()) {
            for (String bookCategory : book.getCategories()) {
                String normalizedBookCat = bookCategory.toLowerCase().trim();

                for (String favoriteGenre : favoriteGenres) {
                    String normalizedFavGenre = favoriteGenre.toLowerCase().trim();

                    // Match flexible: contient OU commence par
                    if (normalizedBookCat.contains(normalizedFavGenre) ||
                            normalizedFavGenre.contains(normalizedBookCat) ||
                            areSimilarGenres(normalizedBookCat, normalizedFavGenre)) {

                        score += 50;
                        log.debug("Genre match: '{}' ~ '{}'", bookCategory, favoriteGenre);
                        break;
                    }
                }
            }
        }

        // Score par auteurs
        if (book.getAuthors() != null && !book.getAuthors().isEmpty()) {
            for (String bookAuthor : book.getAuthors()) {
                for (String favoriteAuthor : favoriteAuthors) {
                    if (bookAuthor.toLowerCase().contains(favoriteAuthor.toLowerCase()) ||
                            favoriteAuthor.toLowerCase().contains(bookAuthor.toLowerCase())) {
                        score += 30;
                        log.debug("Author match: {} ~ {}", bookAuthor, favoriteAuthor);
                        break;
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

        // Si pas de catégories mais un titre pertinent
        if ((book.getCategories() == null || book.getCategories().isEmpty()) &&
                book.getTitle() != null) {

            String lowerTitle = book.getTitle().toLowerCase();
            for (String genre : favoriteGenres) {
                if (lowerTitle.contains(genre.toLowerCase())) {
                    score += 20; // Bonus partiel
                    break;
                }
            }
        }

        return score;
    }

    private boolean areSimilarGenres(String cat1, String cat2) {
        // Mapping de genres similaires
        Map<String, List<String>> similarGenres = Map.of(
                "self-help", Arrays.asList("personal development", "self improvement", "motivational"),
                "business", Arrays.asList("economics", "entrepreneurship", "management", "leadership"),
                "sci-fi", Arrays.asList("science fiction", "speculative fiction"),
                "mystery", Arrays.asList("detective", "crime", "suspense"),
                "thriller", Arrays.asList("suspense", "action")
        );

        for (Map.Entry<String, List<String>> entry : similarGenres.entrySet()) {
            if (cat1.contains(entry.getKey()) || entry.getValue().stream().anyMatch(cat1::contains)) {
                if (cat2.contains(entry.getKey()) || entry.getValue().stream().anyMatch(cat2::contains)) {
                    return true;
                }
            }
        }

        return false;
    }
}
