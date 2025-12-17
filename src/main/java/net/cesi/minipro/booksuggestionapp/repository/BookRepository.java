package net.cesi.minipro.booksuggestionapp.repository;

import net.cesi.minipro.booksuggestionapp.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
