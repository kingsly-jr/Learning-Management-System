package com.lms.backend.dto;

import com.lms.backend.entity.DiscussionThread;
import com.lms.backend.entity.BaseUser;
import java.time.LocalDateTime;

public class DiscussionThreadDTO {
    private Long id;
    private Long courseId;
    private String courseTitle;
    private Long lessonId;
    private String lessonTitle;
    private Long authorId;
    private String authorName;
    private String authorRole;
    private String authorThumbnailUrl;
    private String title;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private int replyCount; // To show how many replies there are

    public DiscussionThreadDTO() {}

    public DiscussionThreadDTO(DiscussionThread thread, int replyCount, BaseUser author) {
        this.id = thread.getId();
        this.courseId = thread.getCourse().getId();
        this.courseTitle = thread.getCourse().getTitle();
        if (thread.getLesson() != null) {
            this.lessonId = thread.getLesson().getId();
            this.lessonTitle = thread.getLesson().getTitle();
        }
        if (author != null) {
            this.authorId = author.getId();
            this.authorName = author.getUsername();
            this.authorRole = author.getRole() != null ? author.getRole().getName() : null;
            this.authorThumbnailUrl = author.getThumbnailUrl();
        } else {
            this.authorName = thread.getAuthorUsername();
        }
        this.title = thread.getTitle();
        this.content = thread.getContent();
        this.createdAt = thread.getCreatedAt();
        this.updatedAt = thread.getUpdatedAt();
        this.replyCount = replyCount;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }
    public String getCourseTitle() { return courseTitle; }
    public void setCourseTitle(String courseTitle) { this.courseTitle = courseTitle; }
    public Long getLessonId() { return lessonId; }
    public void setLessonId(Long lessonId) { this.lessonId = lessonId; }
    public String getLessonTitle() { return lessonTitle; }
    public void setLessonTitle(String lessonTitle) { this.lessonTitle = lessonTitle; }
    public Long getAuthorId() { return authorId; }
    public void setAuthorId(Long authorId) { this.authorId = authorId; }
    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }
    public String getAuthorRole() { return authorRole; }
    public void setAuthorRole(String authorRole) { this.authorRole = authorRole; }
    public String getAuthorThumbnailUrl() { return authorThumbnailUrl; }
    public void setAuthorThumbnailUrl(String authorThumbnailUrl) { this.authorThumbnailUrl = authorThumbnailUrl; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public int getReplyCount() { return replyCount; }
    public void setReplyCount(int replyCount) { this.replyCount = replyCount; }
}
