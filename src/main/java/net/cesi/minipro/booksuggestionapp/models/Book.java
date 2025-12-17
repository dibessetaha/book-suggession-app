package net.cesi.minipro.booksuggestionapp.models;


import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "books")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "google_book_id", unique = true, nullable = false, length = 50)
    private String googleBookId;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String authors; // JSON: ["Author1", "Author2"]

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String categories; // JSON: ["Fiction", "Fantasy"]

    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;

    @Column(name = "average_rating")
    private Double averageRating;

    @Column(name = "published_date", length = 20)
    private String publishedDate;

    @Column(name = "page_count")
    private Integer pageCount;

    @Column(length = 10)
    private String language;

    @CreationTimestamp
    @Column(name = "cached_at", updatable = false)
    private LocalDateTime cachedAt;
}
