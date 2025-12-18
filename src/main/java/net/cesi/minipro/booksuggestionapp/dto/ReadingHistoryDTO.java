package net.cesi.minipro.booksuggestionapp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReadingHistoryDTO {
    private Long id;
    private Long userId;
    private Long bookId;
    private String googleBookId;
    private String title;
    private List<String> authors;
    private String thumbnailUrl;
    private LocalDateTime addedAt;


}