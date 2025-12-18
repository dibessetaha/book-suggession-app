package net.cesi.minipro.booksuggestionapp.repository;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import net.cesi.minipro.booksuggestionapp.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmail(String email);
    boolean existsByEmail(@NotBlank(message = "Email obligatoire") @Email(message = "Format email invalide") String email);
    boolean existsByUsername(@NotBlank(message = "Username obligatoire") @Size(min = 3, max = 50, message = "Username entre 3 et 50 caractères") String username);
}
