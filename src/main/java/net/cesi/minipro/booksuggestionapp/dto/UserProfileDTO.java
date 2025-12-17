package net.cesi.minipro.booksuggestionapp.dto;

import lombok.Data;

import java.util.List;

@Data
public class UserProfileDTO {
    private Long id;
    private String username;
    private String email;
    private List<String> favoriteGenres;
    private List<String> favoriteAuthors;
}
