package com.blog.service;

import com.blog.dto.NotificationResponse;
import com.blog.model.Notification;
import com.blog.model.NotificationType;
import com.blog.model.Post;
import com.blog.model.User;
import com.blog.repository.NotificationRepository;
import com.blog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    /**
     * Records a notification for `recipient` about something `actor` did.
     * No-ops if a user triggers an action on their own content (e.g. liking
     * your own post shouldn't notify you), so callers can call this
     * unconditionally without checking that themselves.
     */
    public void notify(User recipient, User actor, NotificationType type, Post post) {
        if (recipient.getId().equals(actor.getId())) {
            return;
        }
        Notification notification = Notification.builder()
                .recipient(recipient)
                .actor(actor)
                .type(type)
                .post(post)
                .build();
        notificationRepository.save(notification);
    }

    public List<NotificationResponse> getNotifications(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return notificationRepository.findTop50ByRecipientIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public long getUnreadCount(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return notificationRepository.countByRecipientIdAndIsReadFalse(user.getId());
    }

    @Transactional
    public void markAllRead(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        notificationRepository.markAllAsRead(user.getId());
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .type(n.getType().name())
                .actorUsername(n.getActor().getUsername())
                .postId(n.getPost() != null ? n.getPost().getId() : null)
                .postTitle(n.getPost() != null ? n.getPost().getTitle() : null)
                .isRead(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
