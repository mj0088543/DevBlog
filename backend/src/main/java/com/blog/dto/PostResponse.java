package com.blog.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder
public class PostResponse {
    private Long id;
    private String title;
    private String content;
    private String imageUrl;
    private Long authorId;
    private String authorUsername;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private long commentCount;
    private long likeCount;
    private boolean likedByMe;
}
