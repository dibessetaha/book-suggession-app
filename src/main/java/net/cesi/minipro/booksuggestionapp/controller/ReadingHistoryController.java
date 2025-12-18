package net.cesi.minipro.booksuggestionapp.controller;

import net.cesi.minipro.booksuggestionapp.dto.ReadingHistoryDTO;
import net.cesi.minipro.booksuggestionapp.service.ReadingHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/{userId}/library")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:4200", "http://localhost:63342"})
public class ReadingHistoryController {

    private final ReadingHistoryService readingHistoryService;

    @Autowired
    public ReadingHistoryController(ReadingHistoryService readingHistoryService) {
        this.readingHistoryService = readingHistoryService;
    }

    @GetMapping
    public ResponseEntity<List<ReadingHistoryDTO>> getUserLibrary(@PathVariable Long userId) {
        List<ReadingHistoryDTO> library = readingHistoryService.getUserLibrary(userId);
        return ResponseEntity.ok(library);
    }

    @PostMapping
    public ResponseEntity<ReadingHistoryDTO> addToLibrary(
            @PathVariable Long userId,
            @RequestBody AddToLibraryRequest request) {

        ReadingHistoryDTO added = readingHistoryService.addToLibrary(
                userId,
                request.getGoogleBookId()
        );
        return ResponseEntity.ok(added);
    }

    @DeleteMapping("/{bookId}")
    public ResponseEntity<Void> removeFromLibrary(
            @PathVariable Long userId,
            @PathVariable Long bookId) {

        readingHistoryService.removeFromLibrary(userId, bookId);
        return ResponseEntity.ok().build();
    }

    // DTO pour la requête
    public static class AddToLibraryRequest {
        private String googleBookId;

        public String getGoogleBookId() {
            return googleBookId;
        }

        public void setGoogleBookId(String googleBookId) {
            this.googleBookId = googleBookId;
        }
    }
}