package net.cesi.minipro.booksuggestionapp.repository;



import net.cesi.minipro.booksuggestionapp.models.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    Optional<Book> findByGoogleBookId(String googleBookId);
    boolean existsByGoogleBookId(String googleBookId);

    @Query("SELECT b FROM Book b WHERE b.categories LIKE %:category%")
    List<Book> findByCategory(@Param("category") String category);

    @Query("SELECT b FROM Book b WHERE b.authors LIKE %:author%")
    List<Book> findByAuthor(@Param("author") String author);
}