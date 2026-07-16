package com.lms.backend.service;

import com.lms.backend.dto.FeedbackDTO;
import com.lms.backend.entity.Feedback;
import com.lms.backend.entity.Notification;
import com.lms.backend.repository.FeedbackRepository;
import com.lms.backend.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final NotificationRepository notificationRepository;

    public FeedbackService(FeedbackRepository feedbackRepository, NotificationRepository notificationRepository) {
        this.feedbackRepository = feedbackRepository;
        this.notificationRepository = notificationRepository;
    }

    public FeedbackDTO submitFeedback(String username, String userRole, String content) {
        Feedback feedback = new Feedback(username, userRole, content);
        feedbackRepository.save(feedback);
        return new FeedbackDTO(feedback);
    }

    public List<FeedbackDTO> getRecentFeedback() {
        return feedbackRepository.findTop50ByOrderByCreatedAtDesc().stream()
                .map(FeedbackDTO::new)
                .collect(Collectors.toList());
    }

    public void markAsRead(Long id) {
        Feedback feedback = feedbackRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Feedback not found"));
        feedback.setRead(true);
        feedbackRepository.save(feedback);
    }

    public void replyToFeedback(Long id, String adminUsername, String replyContent) {
        Feedback feedback = feedbackRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Feedback not found"));
        
        // Mark as read when replied
        feedback.setRead(true);
        feedbackRepository.save(feedback);

        // Send notification to the user who submitted the feedback
        Notification notification = new Notification(
            "Admin reply to your feedback: " + replyContent,
            feedback.getUsername(),
            adminUsername,
            null,
            "FEEDBACK_REPLY"
        );
        notificationRepository.save(notification);
    }
}
