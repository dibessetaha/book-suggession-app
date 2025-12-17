package net.cesi.minipro.booksuggestionapp.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Username obligatoire")
    @Size(min = 3, max = 50, message = "Username entre 3 et 50 caractères")
    private String username;

    @NotBlank(message = "Email obligatoire")
    @Email(message = "Format email invalide")
    private String email;

    @NotBlank(message = "Mot de passe obligatoire")
    @Size(min = 6, message = "Mot de passe minimum 6 caractères")
    private String password;

    private List<String> favoriteGenres;
    private List<String> favoriteAuthors;
}
