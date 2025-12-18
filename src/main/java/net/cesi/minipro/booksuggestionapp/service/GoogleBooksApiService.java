package net.cesi.minipro.booksuggestionapp.service;

import net.cesi.minipro.booksuggestionapp.dto.BookDTO;
import net.cesi.minipro.booksuggestionapp.models.Book;
import net.cesi.minipro.booksuggestionapp.repository.BookRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class GoogleBooksApiService {

    private static final Logger log = LoggerFactory.getLogger(GoogleBooksApiService.class);

    @Value("${google.books.api.url}")
    private String apiBaseUrl;

    private final RestTemplate restTemplate;
    private final BookRepository bookRepository;

    public GoogleBooksApiService(BookRepository bookRepository) {
        this.restTemplate = new RestTemplate();
        this.bookRepository = bookRepository;
    }

    public List<BookDTO> searchBooks(String query, int maxResults) {
        try {
            // Limiter à 40 (max de Google Books par requête)
            int resultsToFetch = Math.min(maxResults, 40);

            String url = String.format("%s?q=%s&maxResults=%d&orderBy=relevance",
                    apiBaseUrl,
                    URLEncoder.encode(query, StandardCharsets.UTF_8),
                    resultsToFetch
            );

            log.info("Calling Google Books API: {}", url);

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response == null || !response.containsKey("items")) {
                log.warn("No items found for query: {}", query);
                return new ArrayList<>();
            }

            List<Map<String, Object>> items = (List<Map<String, Object>>) response.get("items");

            return items.stream()
                    .map(this::convertToBookDTO)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Error searching books: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    public List<BookDTO> searchByGenre(String genre, int maxResults) {
        // Recherche multiple avec différentes variantes
        Set<BookDTO> allBooks = new LinkedHashSet<>();

        // Stratégie 1: Subject exact
        allBooks.addAll(searchBooks("subject:" + genre, maxResults));

        // Stratégie 2: Dans le titre ou description (si pas assez de résultats)
        if (allBooks.size() < maxResults / 2) {
            allBooks.addAll(searchBooks(genre + " books", maxResults / 2));
        }

        // Stratégie 3: Termes similaires
        List<String> similarTerms = getSimilarGenres(genre);
        for (String term : similarTerms) {
            if (allBooks.size() >= maxResults) break;
            allBooks.addAll(searchBooks("subject:" + term, 10));
        }

        log.info("Found total {} books for genre: {}", allBooks.size(), genre);

        return new ArrayList<>(allBooks).stream()
                .limit(maxResults)
                .collect(Collectors.toList());
    }

    public List<BookDTO> searchByAuthor(String author, int maxResults) {
        // Recherche avec "inauthor" (meilleure que subject)
        return searchBooks("inauthor:" + author, maxResults);
    }

    private List<String> getSimilarGenres(String genre) {
        Map<String, List<String>> genreVariants = Map.ofEntries(
                Map.entry("Self-Help", Arrays.asList("Personal Development", "Self Improvement", "Motivational")),
                Map.entry("Business", Arrays.asList("Business & Economics", "Entrepreneurship", "Management", "Leadership")),
                Map.entry("Science Fiction", Arrays.asList("Sci-Fi", "Speculative Fiction", "Cyberpunk", "Space Opera")),
                Map.entry("Fantasy", Arrays.asList("Epic Fantasy", "Urban Fantasy", "Magic", "Wizards")),
                Map.entry("Mystery", Arrays.asList("Detective", "Crime", "Suspense", "Whodunit")),
                Map.entry("Thriller", Arrays.asList("Suspense", "Action", "Espionage", "Psychological Thriller")),
                Map.entry("Romance", Arrays.asList("Love Stories", "Contemporary Romance", "Romantic Comedy")),
                Map.entry("Horror", Arrays.asList("Scary", "Supernatural", "Gothic")),
                Map.entry("Biography", Arrays.asList("Memoir", "Autobiography", "Life Stories")),
                Map.entry("History", Arrays.asList("Historical", "World History", "Ancient History")),
                Map.entry("Philosophy", Arrays.asList("Ethics", "Logic", "Metaphysics", "Existentialism")),
                Map.entry("Poetry", Arrays.asList("Poems", "Verse", "Sonnets"))
        );

        return genreVariants.getOrDefault(genre, new ArrayList<>());
    }

    private BookDTO convertToBookDTO(Map<String, Object> item) {
        try {
            String googleBookId = (String) item.get("id");
            Map<String, Object> volumeInfo = (Map<String, Object>) item.get("volumeInfo");

            if (volumeInfo == null) return null;

            BookDTO dto = BookDTO.builder()
                    .googleBookId(googleBookId)
                    .title((String) volumeInfo.get("title"))
                    .authors((List<String>) volumeInfo.getOrDefault("authors", new ArrayList<>()))
                    .description((String) volumeInfo.get("description"))
                    .categories((List<String>) volumeInfo.getOrDefault("categories", new ArrayList<>()))
                    .publishedDate((String) volumeInfo.get("publishedDate"))
                    .pageCount((Integer) volumeInfo.get("pageCount"))
                    .language((String) volumeInfo.get("language"))
                    .build();

            // Thumbnail
            if (volumeInfo.containsKey("imageLinks")) {
                Map<String, String> imageLinks = (Map<String, String>) volumeInfo.get("imageLinks");
                dto.setThumbnailUrl(imageLinks.get("thumbnail"));
            }

            // Rating
            if (volumeInfo.containsKey("averageRating")) {
                Object rating = volumeInfo.get("averageRating");
                if (rating instanceof Integer) {
                    dto.setAverageRating(((Integer) rating).doubleValue());
                } else if (rating instanceof Double) {
                    dto.setAverageRating((Double) rating);
                }
            }

            // Cache le livre
            cacheBookIfNotExists(dto);

            return dto;

        } catch (Exception e) {
            log.error("Error converting book: {}", e.getMessage());
            return null;
        }
    }

    private void cacheBookIfNotExists(BookDTO dto) {
        try {
            if (!bookRepository.existsByGoogleBookId(dto.getGoogleBookId())) {
                Book book = Book.builder()
                        .googleBookId(dto.getGoogleBookId())
                        .title(dto.getTitle())
                        .authors(convertListToJson(dto.getAuthors()))
                        .description(dto.getDescription())
                        .categories(convertListToJson(dto.getCategories()))
                        .thumbnailUrl(dto.getThumbnailUrl())
                        .averageRating(dto.getAverageRating())
                        .publishedDate(dto.getPublishedDate())
                        .pageCount(dto.getPageCount())
                        .language(dto.getLanguage())
                        .build();

                bookRepository.save(book);
                log.debug("Cached book: {}", book.getTitle());
            }
        } catch (Exception e) {
            log.error("Error caching book: {}", e.getMessage());
        }
    }

    private String convertListToJson(List<String> list) {
        if (list == null || list.isEmpty()) return "[]";
        return "[\"" + String.join("\",\"", list) + "\"]";
    }
}