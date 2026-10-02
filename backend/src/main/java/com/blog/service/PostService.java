package com.blog.service;

import com.blog.dto.PostRequest;
import com.blog.dto.PostResponse;
import com.blog.model.Like;
import com.blog.model.NotificationType;
import com.blog.model.Post;
import com.blog.model.Role;
import com.blog.model.User;
import com.blog.repository.LikeRepository;
import com.blog.repository.PostRepository;
import com.blog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final LikeRepository likeRepository;
    private final NotificationService notificationService;

    public Page<PostResponse> getAllPosts(Pageable pageable, String search, Long seed, String viewerUsername) {
        Page<Post> posts;
        if (search != null && !search.isBlank()) {
            // Search keeps a predictable order so results are easy to scan.
            posts = postRepository.findByTitleContainingIgnoreCaseOrderByCreatedAtDesc(search, pageable);
        } else if (seed != null) {
            posts = postRepository.findAllShuffled(seed, pageable);
        } else {
            posts = postRepository.findAllByOrderByCreatedAtDesc(pageable);
        }
        return posts.map(post -> toResponse(post, viewerUsername));
    }

    public PostResponse getPostById(Long id, String viewerUsername) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));
        return toResponse(post, viewerUsername);
    }

    public Page<PostResponse> getPostsByUsername(String username, Pageable pageable, String viewerUsername) {
        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return postRepository.findByAuthorIdOrderByCreatedAtDesc(author.getId(), pageable)
                .map(post -> toResponse(post, viewerUsername));
    }

    public PostResponse createPost(PostRequest request, String username) {
        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Post post = Post.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .imageUrl(request.getImageUrl())
                .author(author)
                .build();

        return toResponse(postRepository.save(post), username);
    }

    public PostResponse updatePost(Long id, PostRequest request, String username) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));

        User requester = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!post.getAuthor().getUsername().equals(username) && requester.getRole() != Role.ADMIN) {
            throw new SecurityException("You are not allowed to edit this post");
        }

        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setImageUrl(request.getImageUrl());

        return toResponse(postRepository.save(post), username);
    }

    public void deletePost(Long id, String username) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));

        User requester = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!post.getAuthor().getUsername().equals(username) && requester.getRole() != Role.ADMIN) {
            throw new SecurityException("You are not allowed to delete this post");
        }

        postRepository.delete(post);
    }

    public void likePost(Long postId, String username) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (likeRepository.existsByUserIdAndPostId(user.getId(), postId)) {
            return;
        }

        Like like = Like.builder().user(user).post(post).build();
        likeRepository.save(like);

        notificationService.notify(post.getAuthor(), user, NotificationType.LIKE, post);
    }

    public void unlikePost(Long postId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        likeRepository.findByUserIdAndPostId(user.getId(), postId)
                .ifPresent(likeRepository::delete);
    }

    private PostResponse toResponse(Post post, String viewerUsername) {
        boolean likedByMe = false;
        if (viewerUsername != null) {
            User viewer = userRepository.findByUsername(viewerUsername).orElse(null);
            if (viewer != null) {
                likedByMe = likeRepository.existsByUserIdAndPostId(viewer.getId(), post.getId());
            }
        }

        return PostResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .imageUrl(post.getImageUrl())
                .authorId(post.getAuthor().getId())
                .authorUsername(post.getAuthor().getUsername())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .commentCount(post.getComments().size())
                .likeCount(likeRepository.countByPostId(post.getId()))
                .likedByMe(likedByMe)
                .build();
    }
}
