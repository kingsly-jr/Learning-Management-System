package com.lms.backend.dto;

import com.lms.backend.entity.Notification;
import java.time.LocalDateTime;

public class NotificationDTO {
    private Long id;
    private String message;
    private String recipientUsername;
    private String senderUsername;
    private Long courseId;
    private LocalDateTime createdAt;
    private Boolean isRead;
    private String type;

    public NotificationDTO() {}

    public NotificationDTO(Notification notification) {
        this.id = notification.getId();
        this.message = notification.getMessage();
        this.recipientUsername = notification.getRecipientUsername();
        this.senderUsername = notification.getSenderUsername();
        this.courseId = notification.getCourseId();
        this.createdAt = notification.getCreatedAt();
        this.isRead = notification.getRead();
        this.type = notification.getType();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getRecipientUsername() { return recipientUsername; }
    public void setRecipientUsername(String recipientUsername) { this.recipientUsername = recipientUsername; }
    public String getSenderUsername() { return senderUsername; }
    public void setSenderUsername(String senderUsername) { this.senderUsername = senderUsername; }
    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean read) { isRead = read; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}
