package net.cesi.minipro.booksuggestionapp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDTO {
    private Long id;
    private String username;
    private String email;
    private List<String> favoriteGenres;
    private List<String> favoriteAuthors;
    @CreationTimestamp
    private LocalDateTime createdAt;
}
