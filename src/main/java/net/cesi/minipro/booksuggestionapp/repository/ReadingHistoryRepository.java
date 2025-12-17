package net.cesi.minipro.booksuggestionapp.repository;

import net.cesi.minipro.booksuggestionapp.models.ReadingHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReadingHistoryRepository extends JpaRepository<ReadingHistory,Long> {
    List<ReadingHistory> findByUserId(Long userId);
}
