package com.lms.backend.dto;

import java.util.List;

public class QuizSubmissionDTO {
    private List<AnswerDTO> answers;

    public QuizSubmissionDTO() {}

    public List<AnswerDTO> getAnswers() { return answers; }
    public void setAnswers(List<AnswerDTO> answers) { this.answers = answers; }
}
