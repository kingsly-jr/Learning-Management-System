package com.lms.backend.dto;

import com.lms.backend.entity.DiscussionReply;
import com.lms.backend.entity.BaseUser;
import java.time.LocalDateTime;

public class DiscussionReplyDTO {
    private Long id;
    private Long threadId;
    private Long authorId;
    private String authorName;
    private String authorRole;
    private String authorThumbnailUrl;
    private String content;
    private Boolean isInstructorResponse;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public DiscussionReplyDTO() {}

    public DiscussionReplyDTO(DiscussionReply reply, BaseUser author) {
        this.id = reply.getId();
        this.threadId = reply.getThread().getId();
        if (author != null) {
            this.authorId = author.getId();
            this.authorName = author.getUsername();
            this.authorRole = author.getRole() != null ? author.getRole().getName() : null;
            this.authorThumbnailUrl = author.getThumbnailUrl();
        } else {
            this.authorName = reply.getAuthorUsername();
        }
        this.content = reply.getContent();
        this.isInstructorResponse = reply.getIsInstructorResponse();
        this.createdAt = reply.getCreatedAt();
        this.updatedAt = reply.getUpdatedAt();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getThreadId() { return threadId; }
    public void setThreadId(Long threadId) { this.threadId = threadId; }
    public Long getAuthorId() { return authorId; }
    public void setAuthorId(Long authorId) { this.authorId = authorId; }
    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }
    public String getAuthorRole() { return authorRole; }
    public void setAuthorRole(String authorRole) { this.authorRole = authorRole; }
    public String getAuthorThumbnailUrl() { return authorThumbnailUrl; }
    public void setAuthorThumbnailUrl(String authorThumbnailUrl) { this.authorThumbnailUrl = authorThumbnailUrl; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public Boolean getIsInstructorResponse() { return isInstructorResponse; }
    public void setIsInstructorResponse(Boolean isInstructorResponse) { this.isInstructorResponse = isInstructorResponse; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
