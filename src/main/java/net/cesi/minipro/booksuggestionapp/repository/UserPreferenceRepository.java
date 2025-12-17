package net.cesi.minipro.booksuggestionapp.repository;

import net.cesi.minipro.booksuggestionapp.models.User;
import net.cesi.minipro.booksuggestionapp.models.UserPreference;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserPreferenceRepository extends JpaRepository<UserPreference, Long> {
}
