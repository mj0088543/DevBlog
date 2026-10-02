package com.blog.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder
public class UserDto {
    private Long id;
    private String username;
    private String email;
    private String role;
    private LocalDateTime createdAt;
}
