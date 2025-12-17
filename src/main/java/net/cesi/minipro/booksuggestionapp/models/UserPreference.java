package net.cesi.minipro.booksuggestionapp.models;


import jakarta.persistence.*;
import lombok.*;
import net.cesi.minipro.booksuggestionapp.enums.PreferenceType;

@Entity
@Table(name = "user_preferences")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "preference_type", nullable = false)
    private PreferenceType preferenceType;

    @Column(name = "preference_value", nullable = false, length = 100)
    private String preferenceValue;


}

