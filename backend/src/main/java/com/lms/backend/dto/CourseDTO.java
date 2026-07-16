package com.lms.backend.dto;

import com.lms.backend.entity.Course;
import java.time.LocalDateTime;

public class CourseDTO {
    private Long id;
    private String title;
    private String subtitle;
    private String description;
    private Double price;
    private String thumbnailUrl;
    private Boolean published;
    private String reviewStatus;
    private Long instructorId;
    private String instructorName;
    private Long categoryId;
    private String categoryName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Double progressPercentage;

    @com.fasterxml.jackson.annotation.JsonCreator
    public CourseDTO() {}

    public CourseDTO(Course course) {
        this.id = course.getId();
        this.title = course.getTitle();
        this.subtitle = course.getSubtitle();
        this.description = course.getDescription();
        this.price = course.getPrice();
        this.thumbnailUrl = course.getThumbnailUrl();
        this.published = course.getPublished();
        this.reviewStatus = course.getReviewStatus();
        if (course.getInstructor() != null) {
            this.instructorId = course.getInstructor().getId();
            this.instructorName = course.getInstructor().getUsername();
        }
        if (course.getCategory() != null) {
            this.categoryId = course.getCategory().getId();
            this.categoryName = course.getCategory().getName();
        }
        this.createdAt = course.getCreatedAt();
        this.updatedAt = course.getUpdatedAt();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getSubtitle() { return subtitle; }
    public void setSubtitle(String subtitle) { this.subtitle = subtitle; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public String getThumbnailUrl() { return thumbnailUrl; }
    public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }
    public Boolean getPublished() { return published; }
    public void setPublished(Boolean published) { this.published = published; }
    public Long getInstructorId() { return instructorId; }
    public void setInstructorId(Long instructorId) { this.instructorId = instructorId; }
    public String getInstructorName() { return instructorName; }
    public void setInstructorName(String instructorName) { this.instructorName = instructorName; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public String getReviewStatus() { return reviewStatus; }
    public void setReviewStatus(String reviewStatus) { this.reviewStatus = reviewStatus; }
    public Double getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(Double progressPercentage) { this.progressPercentage = progressPercentage; }
}
