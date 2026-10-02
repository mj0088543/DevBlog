package com.blog.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder
public class ErrorResponse {
    private int status;
    private String message;
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
