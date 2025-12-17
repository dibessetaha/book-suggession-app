package net.cesi.minipro.booksuggestionapp.repository;


import net.cesi.minipro.booksuggestionapp.enums.PreferenceType;
import net.cesi.minipro.booksuggestionapp.models.Preference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PreferenceRepository extends JpaRepository<Preference, Long> {
    List<Preference> findByUserId(Long userId);
    List<Preference> findByUserIdAndPreferenceType(Long userId, PreferenceType type);
    void deleteByUserId(Long userId);
}