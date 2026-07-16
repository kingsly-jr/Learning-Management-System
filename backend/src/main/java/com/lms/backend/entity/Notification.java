package com.lms.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String message;

    @Column(name = "recipient_username", nullable = false)
    private String recipientUsername;

    @Column(name = "sender_username")
    private String senderUsername;

    @Column(name = "course_id")
    private Long courseId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private Boolean isRead = false;

    @Column(nullable = false)
    private String type; // e.g. "COURSE_SUBMITTED", "COURSE_APPROVED", "COURSE_REJECTED"

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Notification() {}

    public Notification(String message, String recipientUsername, String senderUsername, Long courseId, String type) {
        this.message = message;
        this.recipientUsername = recipientUsername;
        this.senderUsername = senderUsername;
        this.courseId = courseId;
        this.type = type;
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
    public Boolean getRead() { return isRead; }
    public void setRead(Boolean read) { isRead = read; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}
