package com.blog.dto;

import lombok.*;

@Data @AllArgsConstructor @Builder
public class AuthResponse {
    private String token;
    private Long id;
    private String username;
    private String email;
    private String role;
}
