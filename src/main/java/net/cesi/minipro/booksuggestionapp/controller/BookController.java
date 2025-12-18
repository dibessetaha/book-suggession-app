package net.cesi.minipro.booksuggestionapp.controller;


import lombok.extern.slf4j.Slf4j;
import net.cesi.minipro.booksuggestionapp.dto.BookDTO;
import net.cesi.minipro.booksuggestionapp.dto.RecommendationResponse;
import net.cesi.minipro.booksuggestionapp.service.GoogleBooksApiService;
import net.cesi.minipro.booksuggestionapp.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:3000"})
@Slf4j
public class BookController {

    private final GoogleBooksApiService googleBooksService;
    private final RecommendationService recommendationService;

    @Autowired
    public BookController(GoogleBooksApiService googleBooksService,
                          RecommendationService recommendationService) {
        this.googleBooksService = googleBooksService;
        this.recommendationService = recommendationService;
    }

    @GetMapping("/search")
    public ResponseEntity<List<BookDTO>> searchBooks(
            @RequestParam String query,
            @RequestParam(defaultValue = "20") int maxResults) {

        log.info("Search request: query={}, maxResults={}", query, maxResults);
        List<BookDTO> books = googleBooksService.searchBooks(query, maxResults);
        return ResponseEntity.ok(books);
    }

    @GetMapping("/search/genre/{genre}")
    public ResponseEntity<List<BookDTO>> searchByGenre(
            @PathVariable String genre,
            @RequestParam(defaultValue = "20") int maxResults) {

        log.info("Search by genre: {}", genre);
        List<BookDTO> books = googleBooksService.searchByGenre(genre, maxResults);
        return ResponseEntity.ok(books);
    }

    @GetMapping("/search/author/{author}")
    public ResponseEntity<List<BookDTO>> searchByAuthor(
            @PathVariable String author,
            @RequestParam(defaultValue = "20") int maxResults) {

        log.info("Search by author: {}", author);
        List<BookDTO> books = googleBooksService.searchByAuthor(author, maxResults);
        return ResponseEntity.ok(books);
    }

    @GetMapping("/recommendations/{userId}")
    public ResponseEntity<RecommendationResponse> getRecommendations(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "20") int limit) {

        log.info("Get recommendations for user: {}", userId);
        List<BookDTO> recommendations = recommendationService.getRecommendations(userId, limit);

        RecommendationResponse response = RecommendationResponse.builder()
                .recommendations(recommendations)
                .totalResults(recommendations.size())
                .message(recommendations.isEmpty() ?
                        "Aucune recommandation trouvée" :
                        "Recommandations générées avec succès")
                .build();

        return ResponseEntity.ok(response);
    }
}