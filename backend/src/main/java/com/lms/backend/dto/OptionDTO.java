package com.lms.backend.dto;

import com.lms.backend.entity.Option;

public class OptionDTO {
    private Long id;
    private String text;
    private Boolean correct;

    @com.fasterxml.jackson.annotation.JsonCreator
    public OptionDTO() {}

    public OptionDTO(Option option) {
        this.id = option.getId();
        this.text = option.getText();
        this.correct = option.getCorrect();
    }

    public OptionDTO(String text, Boolean correct) {
        this.text = text;
        this.correct = correct;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public Boolean getCorrect() { return correct; }
    public void setCorrect(Boolean correct) { this.correct = correct; }
}
