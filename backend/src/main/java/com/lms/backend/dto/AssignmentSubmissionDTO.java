package com.lms.backend.dto;

import com.lms.backend.entity.AssignmentSubmission;
import java.time.LocalDateTime;

public class AssignmentSubmissionDTO {
    private Long id;
    private Long studentId;
    private String studentName;
    private Long assignmentId;
    private Long courseId;
    private Long lessonId;
    private String assignmentTitle;
    private String submissionUrl;
    private Double grade;
    private String feedback;
    private LocalDateTime submittedAt;
    private LocalDateTime gradedAt;

    public AssignmentSubmissionDTO() {}

    public AssignmentSubmissionDTO(AssignmentSubmission submission) {
        this.id = submission.getId();
        this.studentId = submission.getStudent().getId();
        this.studentName = submission.getStudent().getUsername();
        this.assignmentId = submission.getAssignment().getId();
        this.courseId = submission.getAssignment().getLesson().getCourse().getId();
        this.lessonId = submission.getAssignment().getLesson().getId();
        this.assignmentTitle = submission.getAssignment().getTitle();
        this.submissionUrl = submission.getSubmissionUrl();
        this.grade = submission.getGrade();
        this.feedback = submission.getFeedback();
        this.submittedAt = submission.getSubmittedAt();
        this.gradedAt = submission.getGradedAt();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public Long getAssignmentId() { return assignmentId; }
    public void setAssignmentId(Long assignmentId) { this.assignmentId = assignmentId; }
    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }
    public Long getLessonId() { return lessonId; }
    public void setLessonId(Long lessonId) { this.lessonId = lessonId; }
    public String getAssignmentTitle() { return assignmentTitle; }
    public void setAssignmentTitle(String assignmentTitle) { this.assignmentTitle = assignmentTitle; }
    public String getSubmissionUrl() { return submissionUrl; }
    public void setSubmissionUrl(String submissionUrl) { this.submissionUrl = submissionUrl; }
    public Double getGrade() { return grade; }
    public void setGrade(Double grade) { this.grade = grade; }
    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
    public LocalDateTime getGradedAt() { return gradedAt; }
    public void setGradedAt(LocalDateTime gradedAt) { this.gradedAt = gradedAt; }
}
