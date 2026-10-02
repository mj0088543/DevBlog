package com.blog.repository;

import com.blog.model.Follow;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FollowRepository extends JpaRepository<Follow, Long> {
    boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);
    Optional<Follow> findByFollowerIdAndFollowingId(Long followerId, Long followingId);
    long countByFollowingId(Long followingId);
    long countByFollowerId(Long followerId);
    List<Follow> findByFollowingIdOrderByCreatedAtDesc(Long followingId);
    List<Follow> findByFollowerIdOrderByCreatedAtDesc(Long followerId);
}
