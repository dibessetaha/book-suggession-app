package net.cesi.minipro.booksuggestionapp.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookDTO {
    private String googleBookId;
    private String title;
    private List<String> authors;
    private String description;
    private List<String> categories;
    private String thumbnailUrl;
    private Double averageRating;
    private String publishedDate;
    private Integer pageCount;
    private String language;
    private Double recommendationScore;
}