package com.lms.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "admin_activity_logs")
public class AdminActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "action_type", nullable = false)
    private String actionType; // USER_JOINED, COURSE_CREATED, COURSE_UPDATED, COURSE_DELETED, CATEGORY_CREATED, ENROLLMENT, etc.

    @Column(nullable = false)
    private String description;

    @Column(name = "actor_username")
    private String actorUsername;

    @Column(name = "target_type")
    private String targetType; // COURSE, USER, CATEGORY, ENROLLMENT

    @Column(name = "target_id")
    private Long targetId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public AdminActivityLog() {}

    public AdminActivityLog(String actionType, String description, String actorUsername, String targetType, Long targetId) {
        this.actionType = actionType;
        this.description = description;
        this.actorUsername = actorUsername;
        this.targetType = targetType;
        this.targetId = targetId;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getActorUsername() { return actorUsername; }
    public void setActorUsername(String actorUsername) { this.actorUsername = actorUsername; }
    public String getTargetType() { return targetType; }
    public void setTargetType(String targetType) { this.targetType = targetType; }
    public Long getTargetId() { return targetId; }
    public void setTargetId(Long targetId) { this.targetId = targetId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
