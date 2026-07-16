package com.lms.backend.controller;

import com.lms.backend.dto.FeedbackDTO;
import com.lms.backend.service.FeedbackService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/feedbacks")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR')")
    public ResponseEntity<FeedbackDTO> submitFeedback(@RequestBody Map<String, String> payload, Authentication authentication) {
        String content = payload.get("content");
        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        String role = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> a.startsWith("ROLE_"))
                .map(a -> a.substring(5))
                .findFirst()
                .orElse("UNKNOWN");

        return ResponseEntity.ok(feedbackService.submitFeedback(authentication.getName(), role, content));
    }

    @GetMapping("/recent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FeedbackDTO>> getRecentFeedback() {
        return ResponseEntity.ok(feedbackService.getRecentFeedback());
    }

    @PostMapping("/{id}/read")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        feedbackService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/reply")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> replyToFeedback(@PathVariable Long id, @RequestBody Map<String, String> payload, Authentication authentication) {
        String replyContent = payload.get("replyContent");
        if (replyContent == null || replyContent.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        feedbackService.replyToFeedback(id, authentication.getName(), replyContent);
        return ResponseEntity.ok().build();
    }
}
