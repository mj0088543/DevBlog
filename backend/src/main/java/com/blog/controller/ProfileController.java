package com.blog.controller;

import com.blog.dto.PostResponse;
import com.blog.dto.UserProfileResponse;
import com.blog.dto.UserSummary;
import com.blog.service.PostService;
import com.blog.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;
    private final PostService postService;

    // On a permitAll route, Spring Security's AnonymousAuthenticationFilter fills
    // in a placeholder Authentication (principal name "anonymousUser") whenever no
    // real login was established - it is NOT null, so a plain `auth != null` check
    // is not enough to detect "nobody is logged in". We must also exclude that
    // anonymous placeholder explicitly, or every visitor gets treated as a user
    // literally named "anonymousUser", which silently breaks "is this my own
    // profile" and "am I following them" checks for every logged-in viewer too.
    private String viewerOf(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) return null;
        String name = auth.getName();
        if ("anonymousUser".equals(name)) return null;
        return name;
    }

    @GetMapping("/{username}")
    public ResponseEntity<UserProfileResponse> getProfile(@PathVariable String username, Authentication auth) {
        return ResponseEntity.ok(profileService.getProfile(username, viewerOf(auth)));
    }

    @GetMapping("/{username}/posts")
    public ResponseEntity<Page<PostResponse>> getUserPosts(
            @PathVariable String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size,
            Authentication auth) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(postService.getPostsByUsername(username, pageable, viewerOf(auth)));
    }

    @GetMapping("/{username}/followers")
    public ResponseEntity<List<UserSummary>> getFollowers(@PathVariable String username) {
        return ResponseEntity.ok(profileService.getFollowers(username));
    }

    @GetMapping("/{username}/following")
    public ResponseEntity<List<UserSummary>> getFollowing(@PathVariable String username) {
        return ResponseEntity.ok(profileService.getFollowing(username));
    }

    @PostMapping("/{username}/follow")
    public ResponseEntity<Void> follow(@PathVariable String username, Authentication auth) {
        profileService.follow(username, auth.getName());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{username}/follow")
    public ResponseEntity<Void> unfollow(@PathVariable String username, Authentication auth) {
        profileService.unfollow(username, auth.getName());
        return ResponseEntity.ok().build();
    }
}
