package com.lms.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "assignments")
public class Assignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    @Column(columnDefinition = "TEXT")
    private String objective;

    @Column(columnDefinition = "TEXT")
    private String submissionRequirements;

    @Column(columnDefinition = "TEXT")
    private String evaluationCriteria;

    @Column(columnDefinition = "TEXT")
    private String expectedLearningOutcome;

    private Integer maxScore;

    @Column(name = "file_url")
    private String fileUrl;

    @Column(name = "due_date")
    private LocalDateTime dueDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private Lesson lesson;

    @OneToMany(mappedBy = "assignment", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private java.util.List<AssignmentSubmission> submissions;

    public Assignment() {}

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
    public Lesson getLesson() { return lesson; }
    public void setLesson(Lesson lesson) { this.lesson = lesson; }
}
