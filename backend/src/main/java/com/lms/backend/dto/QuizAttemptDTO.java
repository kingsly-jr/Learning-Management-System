package com.lms.backend.dto;

import com.lms.backend.entity.QuizAttempt;
import java.time.LocalDateTime;

public class QuizAttemptDTO {
    private Long id;
    private Long studentId;
    private String studentName;
    private Long quizId;
    private String quizTitle;
    private Integer score;
    private Boolean passed;
    private LocalDateTime attemptedAt;

    public QuizAttemptDTO() {}

    public QuizAttemptDTO(QuizAttempt attempt) {
        this.id = attempt.getId();
        this.studentId = attempt.getStudent().getId();
        this.studentName = attempt.getStudent().getUsername();
        this.quizId = attempt.getQuiz().getId();
        this.quizTitle = attempt.getQuiz().getTitle();
        this.score = attempt.getScore();
        this.passed = attempt.getPassed();
        this.attemptedAt = attempt.getAttemptedAt();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public Long getQuizId() { return quizId; }
    public void setQuizId(Long quizId) { this.quizId = quizId; }
    public String getQuizTitle() { return quizTitle; }
    public void setQuizTitle(String quizTitle) { this.quizTitle = quizTitle; }
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
    public Boolean getPassed() { return passed; }
    public void setPassed(Boolean passed) { this.passed = passed; }
    public LocalDateTime getAttemptedAt() { return attemptedAt; }
    public void setAttemptedAt(LocalDateTime attemptedAt) { this.attemptedAt = attemptedAt; }
}
