package com.blog.controller;

import com.blog.dto.PostRequest;
import com.blog.dto.PostResponse;
import com.blog.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    // These two endpoints are public (permitAll on GET), but Authentication is
    // still populated by the JWT filter when a valid token is sent, so a logged-in
    // viewer sees their own like status while an anonymous viewer just sees false.
    //
    // On a permitAll route, Spring Security's AnonymousAuthenticationFilter fills
    // in a placeholder Authentication (principal name "anonymousUser") whenever no
    // real login was established - it is NOT null, so a plain `auth != null` check
    // is not enough to detect "nobody is logged in". We must also exclude that
    // anonymous placeholder explicitly, or every visitor gets treated as a user
    // literally named "anonymousUser".
    private String viewerOf(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) return null;
        String name = auth.getName();
        if ("anonymousUser".equals(name)) return null;
        return name;
    }

    @GetMapping
    public ResponseEntity<Page<PostResponse>> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long seed,
            Authentication auth) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(postService.getAllPosts(pageable, search, seed, viewerOf(auth)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getPost(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(postService.getPostById(id, viewerOf(auth)));
    }

    @PostMapping
    public ResponseEntity<PostResponse> createPost(@Valid @RequestBody PostRequest request, Authentication auth) {
        return ResponseEntity.ok(postService.createPost(request, auth.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PostResponse> updatePost(@PathVariable Long id, @Valid @RequestBody PostRequest request, Authentication auth) {
        return ResponseEntity.ok(postService.updatePost(id, request, auth.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id, Authentication auth) {
        postService.deletePost(id, auth.getName());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<Void> likePost(@PathVariable Long id, Authentication auth) {
        postService.likePost(id, auth.getName());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/like")
    public ResponseEntity<Void> unlikePost(@PathVariable Long id, Authentication auth) {
        postService.unlikePost(id, auth.getName());
        return ResponseEntity.ok().build();
    }
}
