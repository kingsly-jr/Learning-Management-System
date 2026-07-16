package com.lms.backend.dto;

import com.lms.backend.entity.Lesson;

public class LessonDTO {
    private Long id;
    private String title;
    private String description;
    private String videoUrl;
    private Integer duration;
    private Integer sequenceOrder;
    private Long courseId;

    @com.fasterxml.jackson.annotation.JsonCreator
    public LessonDTO() {}

    public LessonDTO(Lesson lesson) {
        this.id = lesson.getId();
        this.title = lesson.getTitle();
        this.description = lesson.getDescription();
        this.videoUrl = lesson.getVideoUrl();
        this.duration = lesson.getDuration();
        this.sequenceOrder = lesson.getSequenceOrder();
        this.courseId = lesson.getCourse().getId();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }
    public Integer getDuration() { return duration; }
    public void setDuration(Integer duration) { this.duration = duration; }
    public Integer getSequenceOrder() { return sequenceOrder; }
    public void setSequenceOrder(Integer sequenceOrder) { this.sequenceOrder = sequenceOrder; }
    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }
}
