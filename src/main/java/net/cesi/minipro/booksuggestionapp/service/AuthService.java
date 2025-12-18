package net.cesi.minipro.booksuggestionapp.service;


import net.cesi.minipro.booksuggestionapp.dto.AuthResponse;
import net.cesi.minipro.booksuggestionapp.dto.LoginRequest;
import net.cesi.minipro.booksuggestionapp.dto.RegisterRequest;
import net.cesi.minipro.booksuggestionapp.enums.PreferenceType;
import net.cesi.minipro.booksuggestionapp.models.Preference;
import net.cesi.minipro.booksuggestionapp.models.User;
import net.cesi.minipro.booksuggestionapp.repository.PreferenceRepository;
import net.cesi.minipro.booksuggestionapp.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PreferenceRepository preferenceRepository;

    @Autowired
    public AuthService(UserRepository userRepository, PreferenceRepository preferenceRepository) {
        this.userRepository = userRepository;
        this.preferenceRepository = preferenceRepository;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Vérifier si l'email existe déjà
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email déjà utilisé");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username déjà utilisé");
        }

        // Créer l'utilisateur (sans hasher le password pour l'instant)
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword()); // En clair pour simplifier

        user = userRepository.save(user);

        // Sauvegarder les préférences
        Long userId = user.getId();

        if (request.getFavoriteGenres() != null) {
            for (String genre : request.getFavoriteGenres()) {
                Preference pref = new Preference();
                pref.setUserId(userId);
                pref.setPreferenceType(PreferenceType.GENRE);
                pref.setPreferenceValue(genre);
                preferenceRepository.save(pref);
            }
        }

        if (request.getFavoriteAuthors() != null) {
            for (String author : request.getFavoriteAuthors()) {
                Preference pref = new Preference();
                pref.setUserId(userId);
                pref.setPreferenceType(PreferenceType.AUTHOR);
                pref.setPreferenceValue(author);
                preferenceRepository.save(pref);
            }
        }

        log.info("User registered: {}", user.getEmail());

        return AuthResponse.builder()
                .token("simple-token-" + userId) // Token simple
                .username(user.getUsername())
                .email(user.getEmail())
                .userId(userId)
                .message("Inscription réussie")
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        // Chercher l'utilisateur par email
        User user = userRepository.findByEmail(request.getEmail());

        // Vérifier le mot de passe (en clair pour simplifier)
        if (!user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Email ou mot de passe incorrect");
        }

        log.info("User logged in: {}", user.getEmail());

        return AuthResponse.builder()
                .token("simple-token-" + user.getId()) // Token simple
                .username(user.getUsername())
                .email(user.getEmail())
                .userId(user.getId())
                .message("Connexion réussie")
                .build();
    }
}
