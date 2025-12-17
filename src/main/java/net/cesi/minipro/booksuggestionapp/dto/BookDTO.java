package net.cesi.minipro.booksuggestionapp.dto;

import lombok.Data;

import java.util.List;

@Data
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
    private Double recommendationScore; // Score de pertinence
}