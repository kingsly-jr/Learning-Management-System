package com.lms.backend.dto;

import java.time.LocalDateTime;

public class LiveClassDTO {
    private Long id;
    private Long courseId;
    private String courseName;
    private String instructorName;
    private String title;
    private LocalDateTime scheduledAt;
    private LocalDateTime endTime;
    private String zoomLink;

    public LiveClassDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }

    public String getInstructorName() { return instructorName; }
    public void setInstructorName(String instructorName) { this.instructorName = instructorName; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public String getZoomLink() { return zoomLink; }
    public void setZoomLink(String zoomLink) { this.zoomLink = zoomLink; }
}
