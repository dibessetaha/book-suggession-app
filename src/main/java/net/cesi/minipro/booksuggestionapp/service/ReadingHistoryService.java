package net.cesi.minipro.booksuggestionapp.service;

import net.cesi.minipro.booksuggestionapp.dto.ReadingHistoryDTO;
import net.cesi.minipro.booksuggestionapp.models.Book;
import net.cesi.minipro.booksuggestionapp.models.ReadingHistory;
import net.cesi.minipro.booksuggestionapp.models.User;
import net.cesi.minipro.booksuggestionapp.repository.BookRepository;
import net.cesi.minipro.booksuggestionapp.repository.ReadingHistoryRepository;
import net.cesi.minipro.booksuggestionapp.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReadingHistoryService {

    private static final Logger log = LoggerFactory.getLogger(ReadingHistoryService.class);

    private final ReadingHistoryRepository readingHistoryRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;

    @Autowired
    public ReadingHistoryService(
            ReadingHistoryRepository readingHistoryRepository,
            UserRepository userRepository,
            BookRepository bookRepository) {
        this.readingHistoryRepository = readingHistoryRepository;
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
    }

    public List<ReadingHistoryDTO> getUserLibrary(Long userId) {
        List<ReadingHistory> history = readingHistoryRepository.findByUserId(userId);

        return history.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReadingHistoryDTO addToLibrary(Long userId, String googleBookId) {
        // Vérifier si l'utilisateur existe
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Vérifier si le livre existe dans la DB
        Book book = bookRepository.findByGoogleBookId(googleBookId)
                .orElseThrow(() -> new RuntimeException("Book not found in database"));

        // Vérifier si déjà dans la bibliothèque
        if (readingHistoryRepository.existsByUserIdAndBookId(userId, book.getId())) {
            log.warn("Book already in library for user {}", userId);
            throw new RuntimeException("Book already in your library");
        }

        // Créer l'entrée
        ReadingHistory history = new ReadingHistory();
        history.setUser(user);
        history.setBook(book);
        history.setAddedAt(LocalDateTime.now());

        history = readingHistoryRepository.save(history);

        log.info("Added book {} to library for user {}", book.getTitle(), userId);

        return convertToDTO(history);
    }

    @Transactional
    public void removeFromLibrary(Long userId, Long bookId) {
        ReadingHistory history = readingHistoryRepository.findByUserIdAndBookId(userId, bookId)
                .orElseThrow(() -> new RuntimeException("Book not found in your library"));

        readingHistoryRepository.delete(history);
        log.info("Removed book from library for user {}", userId);
    }

    private ReadingHistoryDTO convertToDTO(ReadingHistory history) {
        ReadingHistoryDTO dto = new ReadingHistoryDTO();
        dto.setId(history.getId());
        dto.setUserId(history.getUser().getId());
        dto.setBookId(history.getBook().getId());
        dto.setGoogleBookId(history.getBook().getGoogleBookId());
        dto.setTitle(history.getBook().getTitle());
        dto.setAuthors(parseJsonArray(history.getBook().getAuthors()));
        dto.setThumbnailUrl(history.getBook().getThumbnailUrl());
        dto.setAddedAt(history.getAddedAt());
        return dto;
    }

    private List<String> parseJsonArray(String json) {
        if (json == null || json.equals("[]")) return List.of();
        return List.of(json.replace("[", "").replace("]", "").replace("\"", "").split(","));
    }
}