package com.lms.backend.dto;

import com.lms.backend.entity.Feedback;
import java.time.LocalDateTime;

public class FeedbackDTO {
    private Long id;
    private String username;
    private String userRole;
    private String content;
    private boolean isRead;
    private LocalDateTime createdAt;

    public FeedbackDTO() {}

    public FeedbackDTO(Feedback feedback) {
        this.id = feedback.getId();
        this.username = feedback.getUsername();
        this.userRole = feedback.getUserRole();
        this.content = feedback.getContent();
        this.isRead = feedback.isRead();
        this.createdAt = feedback.getCreatedAt();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getUserRole() { return userRole; }
    public void setUserRole(String userRole) { this.userRole = userRole; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
