package com.lms.backend.dto;

import java.time.LocalDateTime;

public class ActivityLogDTO {
    private Long id;
    private String actionType;
    private String description;
    private LocalDateTime timestamp;

    public ActivityLogDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
