package com.lms.backend.controller;

import com.lms.backend.dto.NotificationDTO;
import com.lms.backend.entity.Notification;
import com.lms.backend.repository.NotificationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@Transactional
public class NotificationController {

    private final NotificationRepository notificationRepository;

    public NotificationController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getMyNotifications(Authentication authentication) {
        String username = authentication.getName();
        List<NotificationDTO> list = notificationRepository.findByRecipientUsernameOrderByCreatedAtDesc(username)
                .stream()
                .map(NotificationDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(Authentication authentication) {
        String username = authentication.getName();
        long count = notificationRepository.countByRecipientUsernameAndIsReadFalse(username);
        return ResponseEntity.ok(count);
    }

    @PostMapping("/mark-read")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        String username = authentication.getName();
        List<Notification> unread = notificationRepository.findByRecipientUsernameOrderByCreatedAtDesc(username)
                .stream()
                .filter(n -> !n.getRead())
                .collect(Collectors.toList());
        for (Notification n : unread) {
            n.setRead(true);
        }
        notificationRepository.saveAll(unread);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id, Authentication authentication) {
        String username = authentication.getName();
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found: " + id));
        if (!n.getRecipientUsername().equals(username)) {
            throw new org.springframework.security.access.AccessDeniedException("Cannot read other user's notification");
        }
        n.setRead(true);
        notificationRepository.save(n);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/clear-all")
    public ResponseEntity<Void> clearAll(Authentication authentication) {
        String username = authentication.getName();
        List<Notification> all = notificationRepository.findByRecipientUsernameOrderByCreatedAtDesc(username);
        notificationRepository.deleteAll(all);
        return ResponseEntity.ok().build();
    }
}
