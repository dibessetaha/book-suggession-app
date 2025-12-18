package net.cesi.minipro.booksuggestionapp.controller;

import net.cesi.minipro.booksuggestionapp.dto.AuthResponse;
import net.cesi.minipro.booksuggestionapp.dto.LoginRequest;
import net.cesi.minipro.booksuggestionapp.dto.RegisterRequest;
import net.cesi.minipro.booksuggestionapp.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:4200", "http://localhost:63342"})
public class AuthController {

    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}
