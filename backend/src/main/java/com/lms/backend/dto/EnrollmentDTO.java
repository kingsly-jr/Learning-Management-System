package com.lms.backend.dto;

import com.lms.backend.entity.Enrollment;
import java.time.LocalDateTime;
import java.util.Set;

public class EnrollmentDTO {
    private Long id;
    private Long studentId;
    private String studentName;
    private Long courseId;
    private String courseTitle;
    private LocalDateTime enrolledAt;
    private Double progressPercentage;
    private Boolean certificateGenerated;
    private Set<Long> completedLessonIds;

    private String categoryName;
    private String instructorName;
    private LocalDateTime completedAt;

    public EnrollmentDTO() {}

    public EnrollmentDTO(Enrollment enrollment) {
        this.id = enrollment.getId();
        this.studentId = enrollment.getStudent() != null ? enrollment.getStudent().getId() : null;
        this.studentName = enrollment.getStudent() != null ? enrollment.getStudent().getUsername() : "Deleted Student";
        this.courseId = enrollment.getCourse() != null ? enrollment.getCourse().getId() : null;
        this.courseTitle = enrollment.getCourse() != null ? enrollment.getCourse().getTitle() : "Deleted Course";
        this.categoryName = (enrollment.getCourse() != null && enrollment.getCourse().getCategory() != null) 
                            ? enrollment.getCourse().getCategory().getName() : "Uncategorized";
        this.instructorName = (enrollment.getCourse() != null && enrollment.getCourse().getInstructor() != null) 
                              ? enrollment.getCourse().getInstructor().getUsername() : "Unknown Instructor";
        this.enrolledAt = enrollment.getEnrolledAt();
        this.progressPercentage = enrollment.getProgressPercentage();
        this.certificateGenerated = enrollment.getCertificateGenerated();
        this.completedLessonIds = enrollment.getCompletedLessonIds();
        this.completedAt = enrollment.getCompletedAt();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }
    public String getCourseTitle() { return courseTitle; }
    public void setCourseTitle(String courseTitle) { this.courseTitle = courseTitle; }
    public LocalDateTime getEnrolledAt() { return enrolledAt; }
    public void setEnrolledAt(LocalDateTime enrolledAt) { this.enrolledAt = enrolledAt; }
    public Double getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(Double progressPercentage) { this.progressPercentage = progressPercentage; }
    public Boolean getCertificateGenerated() { return certificateGenerated; }
    public void setCertificateGenerated(Boolean certificateGenerated) { this.certificateGenerated = certificateGenerated; }
    public Set<Long> getCompletedLessonIds() { return completedLessonIds; }
    public void setCompletedLessonIds(Set<Long> completedLessonIds) { this.completedLessonIds = completedLessonIds; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public String getInstructorName() { return instructorName; }
    public void setInstructorName(String instructorName) { this.instructorName = instructorName; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}
