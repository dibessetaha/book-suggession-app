package net.cesi.minipro.booksuggestionapp.controller;


import lombok.extern.slf4j.Slf4j;
import net.cesi.minipro.booksuggestionapp.dto.UpdatePreferencesRequest;
import net.cesi.minipro.booksuggestionapp.dto.UserProfileDTO;
import net.cesi.minipro.booksuggestionapp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:3000"})
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{userId}/profile")
    public ResponseEntity<UserProfileDTO> getUserProfile(@PathVariable Long userId) {
//        log.info("Get profile for user: {}", userId);
        UserProfileDTO profile = userService.getUserProfile(userId);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/{userId}/preferences")
    public ResponseEntity<String> updatePreferences(
            @PathVariable Long userId,
            @RequestBody UpdatePreferencesRequest request) {

//        log.info("Update preferences for user: {}", userId);
        userService.updatePreferences(userId, request);
        return ResponseEntity.ok("Préférences mises à jour avec succès");
    }
}
