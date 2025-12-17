package net.cesi.minipro.booksuggestionapp.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "Email obligatoire")
    private String email;

    @NotBlank(message = "Mot de passe obligatoire")
    private String password;
}