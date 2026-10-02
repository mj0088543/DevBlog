package com.blog.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder
public class UserProfileResponse {
    private Long id;
    private String username;
    private LocalDateTime joinedAt;
    private long followersCount;
    private long followingCount;
    private long postsCount;
    private boolean isFollowing;
    private boolean isSelf;
}
