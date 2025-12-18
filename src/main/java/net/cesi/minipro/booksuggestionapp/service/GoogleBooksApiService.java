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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class GoogleBooksApiService {

    private static final Logger log = LoggerFactory.getLogger(GoogleBooksApiService.class);

    private String apiBaseUrl ="https://www.googleapis.com/books/v1/volumes";

    private final RestTemplate restTemplate;
    private final BookRepository bookRepository;

    public GoogleBooksApiService(BookRepository bookRepository) {
        this.restTemplate = new RestTemplate();
        this.bookRepository = bookRepository;
    }

    public List<BookDTO> searchBooks(String query, int maxResults) {
        try {
            String url = String.format("%s?q=%s&maxResults=%d",
                    apiBaseUrl,
                    URLEncoder.encode(query, StandardCharsets.UTF_8),
                    maxResults
            );

            log.info("Searching books with query: {}", query);

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response == null || !response.containsKey("items")) {
                return new ArrayList<>();
            }

            List<Map<String, Object>> items = (List<Map<String, Object>>) response.get("items");

            return items.stream()
                    .map(this::convertToBookDTO)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Error searching books: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    public List<BookDTO> searchByGenre(String genre, int maxResults) {
        return searchBooks("subject:" + genre, maxResults);
    }

    public List<BookDTO> searchByAuthor(String author, int maxResults) {
        return searchBooks("inauthor:" + author, maxResults);
    }

    private BookDTO convertToBookDTO(Map<String, Object> item) {
        String googleBookId = (String) item.get("id");
        Map<String, Object> volumeInfo = (Map<String, Object>) item.get("volumeInfo");

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