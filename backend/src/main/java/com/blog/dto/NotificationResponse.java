package com.blog.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder
public class NotificationResponse {
    private Long id;
    private String type;
    private String actorUsername;
    private Long postId;
    private String postTitle;
    private boolean isRead;
    private LocalDateTime createdAt;
}
