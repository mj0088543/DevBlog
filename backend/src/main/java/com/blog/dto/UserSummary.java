package com.blog.dto;

import lombok.*;

@Data @Builder
public class UserSummary {
    private Long id;
    private String username;
}
