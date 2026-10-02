package com.blog.service;

import com.blog.dto.UserProfileResponse;
import com.blog.dto.UserSummary;
import com.blog.model.Follow;
import com.blog.model.NotificationType;
import com.blog.model.User;
import com.blog.repository.FollowRepository;
import com.blog.repository.PostRepository;
import com.blog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final FollowRepository followRepository;
    private final PostRepository postRepository;
    private final NotificationService notificationService;

    public UserProfileResponse getProfile(String username, String currentUsername) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        long followersCount = followRepository.countByFollowingId(user.getId());
        long followingCount = followRepository.countByFollowerId(user.getId());
        long postsCount = postRepository.findByAuthorIdOrderByCreatedAtDesc(
                user.getId(), org.springframework.data.domain.Pageable.unpaged()).getTotalElements();

        boolean isSelf = currentUsername != null && currentUsername.equals(username);
        boolean isFollowing = false;
        if (currentUsername != null && !isSelf) {
            User current = userRepository.findByUsername(currentUsername).orElse(null);
            if (current != null) {
                isFollowing = followRepository.existsByFollowerIdAndFollowingId(current.getId(), user.getId());
            }
        }

        return UserProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .joinedAt(user.getCreatedAt())
                .followersCount(followersCount)
                .followingCount(followingCount)
                .postsCount(postsCount)
                .isFollowing(isFollowing)
                .isSelf(isSelf)
                .build();
    }

    public void follow(String targetUsername, String currentUsername) {
        if (targetUsername.equals(currentUsername)) {
            throw new IllegalArgumentException("You cannot follow yourself");
        }
        User target = userRepository.findByUsername(targetUsername)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        User current = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (followRepository.existsByFollowerIdAndFollowingId(current.getId(), target.getId())) {
            return;
        }

        Follow follow = Follow.builder()
                .follower(current)
                .following(target)
                .build();
        followRepository.save(follow);

        notificationService.notify(target, current, NotificationType.FOLLOW, null);
    }

    public void unfollow(String targetUsername, String currentUsername) {
        User target = userRepository.findByUsername(targetUsername)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        User current = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        followRepository.findByFollowerIdAndFollowingId(current.getId(), target.getId())
                .ifPresent(followRepository::delete);
    }

    public List<UserSummary> getFollowers(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return followRepository.findByFollowingIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(f -> toSummary(f.getFollower()))
                .collect(Collectors.toList());
    }

    public List<UserSummary> getFollowing(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return followRepository.findByFollowerIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(f -> toSummary(f.getFollowing()))
                .collect(Collectors.toList());
    }

    private UserSummary toSummary(User user) {
        return UserSummary.builder().id(user.getId()).username(user.getUsername()).build();
    }
}
