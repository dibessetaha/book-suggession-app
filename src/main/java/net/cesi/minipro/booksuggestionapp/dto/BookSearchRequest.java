package net.cesi.minipro.booksuggestionapp.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookSearchRequest {
    private String query;
    private String genre;
    private String author;
    private Integer maxResults = 20;
}