package com.blog.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder
public class CommentResponse {
    private Long id;
    private String content;
    private Long postId;
    private Long authorId;
    private String authorUsername;
    private LocalDateTime createdAt;
}
