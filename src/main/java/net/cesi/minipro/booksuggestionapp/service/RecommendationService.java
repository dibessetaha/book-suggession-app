package net.cesi.minipro.booksuggestionapp.service;

import lombok.extern.slf4j.Slf4j;
import net.cesi.minipro.booksuggestionapp.dto.BookDTO;
import net.cesi.minipro.booksuggestionapp.enums.PreferenceType;
import net.cesi.minipro.booksuggestionapp.models.Preference;
import net.cesi.minipro.booksuggestionapp.models.ReadingHistory;
import net.cesi.minipro.booksuggestionapp.repository.PreferenceRepository;
import net.cesi.minipro.booksuggestionapp.repository.ReadingHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Slf4j
public class RecommendationService {

    private final GoogleBooksApiService googleBooksService;
    private final PreferenceRepository preferenceRepository;
    private final ReadingHistoryRepository readingHistoryRepository;

    @Autowired
    public RecommendationService(
            GoogleBooksApiService googleBooksService,
            PreferenceRepository preferenceRepository,
            ReadingHistoryRepository readingHistoryRepository) {
        this.googleBooksService = googleBooksService;
        this.preferenceRepository = preferenceRepository;
        this.readingHistoryRepository = readingHistoryRepository;
    }

    public List<BookDTO> getRecommendations(Long userId, int limit) {
        // 1. Récupérer les préférences de l'utilisateur
        List<Preference> preferences = preferenceRepository.findByUserId(userId);

        if (preferences.isEmpty()) {
            // Si pas de préférences, retourner des livres populaires
            return googleBooksService.searchBooks("bestseller", limit);
        }

        // 2. Récupérer les livres déjà lus
        List<ReadingHistory> history = readingHistoryRepository.findByUserId(userId);
        Set<String> readBooksIds = history.stream()
                .map(h -> h.getBook().getGoogleBookId())
                .collect(Collectors.toSet());

        // 3. Chercher des livres basés sur les préférences
        List<BookDTO> candidateBooks = new ArrayList<>();

        // Par genre
        preferences.stream()
                .filter(p -> p.getPreferenceType() == PreferenceType.GENRE)
                .forEach(p -> {
                    List<BookDTO> books = googleBooksService.searchByGenre(
                            p.getPreferenceValue(), 20);
                    candidateBooks.addAll(books);
                });

        // Par auteur
        preferences.stream()
                .filter(p -> p.getPreferenceType() == PreferenceType.AUTHOR)
                .forEach(p -> {
                    List<BookDTO> books = googleBooksService.searchByAuthor(
                            p.getPreferenceValue(), 20);
                    candidateBooks.addAll(books);
                });

        // 4. Calculer le score et filtrer
        return candidateBooks.stream()
                .filter(book -> !readBooksIds.contains(book.getGoogleBookId()))
                .distinct()
                .map(book -> {
                    double score = calculateRecommendationScore(book, preferences, history);
                    book.setRecommendationScore(score);
                    return book;
                })
                .sorted(Comparator.comparingDouble(BookDTO::getRecommendationScore).reversed())
                .limit(limit)
                .collect(Collectors.toList());
    }

    private double calculateRecommendationScore(
            BookDTO book,
            List<Preference> preferences,
            List<ReadingHistory> history) {

        double score = 0.0;

        // Score basé sur les genres
        long genreMatches = preferences.stream()
                .filter(p -> p.getPreferenceType() == PreferenceType.GENRE)
                .filter(p -> book.getCategories() != null &&
                        book.getCategories().contains(p.getPreferenceValue()))
                .count();
        score += genreMatches * 50;

        // Score basé sur les auteurs
        long authorMatches = preferences.stream()
                .filter(p -> p.getPreferenceType() == PreferenceType.AUTHOR)
                .filter(p -> book.getAuthors() != null &&
                        book.getAuthors().stream()
                                .anyMatch(a -> a.contains(p.getPreferenceValue())))
                .count();
        score += authorMatches * 30;

        // Score basé sur la note moyenne
        if (book.getAverageRating() != null) {
            score += book.getAverageRating() * 4;
        }

        // Bonus pour les livres récents
        if (book.getPublishedDate() != null) {
            try {
                int year = Integer.parseInt(book.getPublishedDate().substring(0, 4));
                if (year >= 2020) score += 10;
            } catch (Exception e) {
                // Ignore parsing errors
            }
        }

        return score;
    }
}