package net.cesi.minipro.booksuggestionapp.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @Autowired
    private DataSource dataSource;

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("✅ Application is running!");
    }

    @GetMapping("/db")
    public ResponseEntity<String> testDatabase() {
        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();
            String info = String.format(
                    "✅ Connected to: %s\nVersion: %s",
                    metaData.getDatabaseProductName(),
                    metaData.getDatabaseProductVersion()
            );
            return ResponseEntity.ok(info);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body("❌ Connection failed: " + e.getMessage());
        }
    }
}