package com.lms.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "discussion_replies")
public class DiscussionReply {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "thread_id", nullable = false)
    private DiscussionThread thread;

    @Column(name = "author_username", nullable = false)
    private String authorUsername;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    private Boolean isInstructorResponse; // True if author is the instructor of the course

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public DiscussionThread getThread() { return thread; }
    public void setThread(DiscussionThread thread) { this.thread = thread; }
    public String getAuthorUsername() { return authorUsername; }
    public void setAuthorUsername(String authorUsername) { this.authorUsername = authorUsername; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public Boolean getIsInstructorResponse() { return isInstructorResponse; }
    public void setIsInstructorResponse(Boolean isInstructorResponse) { this.isInstructorResponse = isInstructorResponse; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
