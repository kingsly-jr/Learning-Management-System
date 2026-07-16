package com.lms.backend.dto;

import com.lms.backend.entity.Assignment;
import java.time.LocalDateTime;

public class AssignmentDTO {
    private Long id;
    private String title;
    private String instructions;
    private String objective;
    private String submissionRequirements;
    private String evaluationCriteria;
    private String expectedLearningOutcome;
    private Integer maxScore;
    private String fileUrl;
    private LocalDateTime dueDate;
    private Long lessonId;
    private String lessonTitle;

    @com.fasterxml.jackson.annotation.JsonCreator
    public AssignmentDTO() {}

    public AssignmentDTO(Assignment assignment) {
        this.id = assignment.getId();
        this.title = assignment.getTitle();
        this.instructions = assignment.getInstructions();
        this.objective = assignment.getObjective();
        this.submissionRequirements = assignment.getSubmissionRequirements();
        this.evaluationCriteria = assignment.getEvaluationCriteria();
        this.expectedLearningOutcome = assignment.getExpectedLearningOutcome();
        this.maxScore = assignment.getMaxScore();
        this.fileUrl = assignment.getFileUrl();
        this.dueDate = assignment.getDueDate();
        this.lessonId = assignment.getLesson().getId();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }
    
    public String getObjective() { return objective; }
    public void setObjective(String objective) { this.objective = objective; }
    
    public String getSubmissionRequirements() { return submissionRequirements; }
    public void setSubmissionRequirements(String submissionRequirements) { this.submissionRequirements = submissionRequirements; }
    
    public String getEvaluationCriteria() { return evaluationCriteria; }
    public void setEvaluationCriteria(String evaluationCriteria) { this.evaluationCriteria = evaluationCriteria; }
    
    public String getExpectedLearningOutcome() { return expectedLearningOutcome; }
    public void setExpectedLearningOutcome(String expectedLearningOutcome) { this.expectedLearningOutcome = expectedLearningOutcome; }
    
    public Integer getMaxScore() { return maxScore; }
    public void setMaxScore(Integer maxScore) { this.maxScore = maxScore; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }
    public Long getLessonId() { return lessonId; }
    public void setLessonId(Long lessonId) { this.lessonId = lessonId; }

    public String getLessonTitle() { return lessonTitle; }
    public void setLessonTitle(String lessonTitle) { this.lessonTitle = lessonTitle; }
}
