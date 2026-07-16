package com.lms.backend.dto;

import com.lms.backend.entity.AdminActivityLog;
import java.time.LocalDateTime;

public class AdminActivityLogDTO {
    private Long id;
    private String actionType;
    private String description;
    private String actorUsername;
    private String targetType;
    private Long targetId;
    private LocalDateTime createdAt;

    public AdminActivityLogDTO() {}

    public AdminActivityLogDTO(AdminActivityLog log) {
        this.id = log.getId();
        this.actionType = log.getActionType();
        this.description = log.getDescription();
        this.actorUsername = log.getActorUsername();
        this.targetType = log.getTargetType();
        this.targetId = log.getTargetId();
        this.createdAt = log.getCreatedAt();
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
