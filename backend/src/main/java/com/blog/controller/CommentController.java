package com.blog.controller;

import com.blog.dto.CommentRequest;
import com.blog.dto.CommentResponse;
import com.blog.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable Long postId) {
        return ResponseEntity.ok(commentService.getCommentsForPost(postId));
    }

    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<CommentResponse> addComment(@PathVariable Long postId,
                                                        @Valid @RequestBody CommentRequest request,
                                                        Authentication auth) {
        return ResponseEntity.ok(commentService.addComment(postId, request, auth.getName()));
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id, Authentication auth) {
        commentService.deleteComment(id, auth.getName());
        return ResponseEntity.noContent().build();
    }
}
