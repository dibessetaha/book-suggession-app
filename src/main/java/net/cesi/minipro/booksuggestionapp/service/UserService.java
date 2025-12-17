package net.cesi.minipro.booksuggestionapp.service;


import lombok.extern.slf4j.Slf4j;
import net.cesi.minipro.booksuggestionapp.dto.UpdatePreferencesRequest;
import net.cesi.minipro.booksuggestionapp.enums.PreferenceType;
import net.cesi.minipro.booksuggestionapp.models.Preference;
import net.cesi.minipro.booksuggestionapp.models.User;
import net.cesi.minipro.booksuggestionapp.dto.UserProfileDTO;
import net.cesi.minipro.booksuggestionapp.repository.PreferenceRepository;
import net.cesi.minipro.booksuggestionapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PreferenceRepository preferenceRepository;

    @Autowired
    public UserService(UserRepository userRepository, PreferenceRepository preferenceRepository) {
        this.userRepository = userRepository;
        this.preferenceRepository = preferenceRepository;
    }

    public UserProfileDTO getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Preference> preferences = preferenceRepository.findByUserId(userId);

        List<String> genres = preferences.stream()
                .filter(p -> p.getPreferenceType() == PreferenceType.GENRE)
                .map(Preference::getPreferenceValue)
                .collect(Collectors.toList());

        List<String> authors = preferences.stream()
                .filter(p -> p.getPreferenceType() == PreferenceType.AUTHOR)
                .map(Preference::getPreferenceValue)
                .collect(Collectors.toList());

        return UserProfileDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .favoriteGenres(genres)
                .favoriteAuthors(authors)
                .createdAt(user.getCreatedAt())
                .build();
    }

    @Transactional
    public void updatePreferences(Long userId, UpdatePreferencesRequest request) {
        // Supprimer anciennes préférences
        preferenceRepository.deleteByUserId(userId);

        // Ajouter nouvelles préférences - Genres
        if (request.getGenres() != null) {
            request.getGenres().forEach(genre -> {
                Preference pref = Preference.builder()
                        .userId(userId)
                        .preferenceType(PreferenceType.GENRE)
                        .preferenceValue(genre)
                        .build();
                preferenceRepository.save(pref);
            });
        }

        // Ajouter nouvelles préférences - Auteurs
        if (request.getAuthors() != null) {
            request.getAuthors().forEach(author -> {
                Preference pref = Preference.builder()
                        .userId(userId)
                        .preferenceType(PreferenceType.AUTHOR)
                        .preferenceValue(author)
                        .build();
                preferenceRepository.save(pref);
            });
        }

        log.info("Updated preferences for user: {}", userId);
    }
}