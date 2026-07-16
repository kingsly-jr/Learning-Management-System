package com.lms.backend.dto;

public class AnswerDTO {
    private Long questionId;
    private Long selectedOptionId;

    public AnswerDTO() {}

    public Long getQuestionId() { return questionId; }
    public void setQuestionId(Long questionId) { this.questionId = questionId; }
    public Long getSelectedOptionId() { return selectedOptionId; }
    public void setSelectedOptionId(Long selectedOptionId) { this.selectedOptionId = selectedOptionId; }
}
