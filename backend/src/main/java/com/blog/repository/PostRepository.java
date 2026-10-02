package com.blog.repository;

import com.blog.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostRepository extends JpaRepository<Post, Long> {
    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Page<Post> findByTitleContainingIgnoreCaseOrderByCreatedAtDesc(String title, Pageable pageable);
    Page<Post> findByAuthorIdOrderByCreatedAtDesc(Long authorId, Pageable pageable);

    /**
     * Returns posts in a shuffled order across the WHOLE table, not just one page.
     * MySQL's RAND(seed) is deterministic for a given seed, so paging through with
     * the same seed gives a stable shuffle (no duplicate or skipped posts), while a
     * new seed on each page load produces a fresh order.
     */
    @Query(
            value = "SELECT * FROM posts ORDER BY RAND(:seed)",
            countQuery = "SELECT count(*) FROM posts",
            nativeQuery = true
    )
    Page<Post> findAllShuffled(@Param("seed") long seed, Pageable pageable);
}
