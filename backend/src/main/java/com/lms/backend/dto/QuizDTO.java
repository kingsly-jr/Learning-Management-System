package com.lms.backend.dto;

import com.lms.backend.entity.Quiz;
import java.util.List;

public class QuizDTO {
    private Long id;
    private String title;
    private Long lessonId;
    private List<QuestionDTO> questions;

    @com.fasterxml.jackson.annotation.JsonCreator
    public QuizDTO() {}

    public QuizDTO(Quiz quiz, List<QuestionDTO> questions) {
        this.id = quiz.getId();
        this.title = quiz.getTitle();
        this.lessonId = quiz.getLesson().getId();
        this.questions = questions;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public Long getLessonId() { return lessonId; }
    public void setLessonId(Long lessonId) { this.lessonId = lessonId; }
    public List<QuestionDTO> getQuestions() { return questions; }
    public void setQuestions(List<QuestionDTO> questions) { this.questions = questions; }
}
