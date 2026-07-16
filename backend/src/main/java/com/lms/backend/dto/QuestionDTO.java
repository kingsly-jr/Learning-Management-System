package com.lms.backend.dto;

import com.lms.backend.entity.Question;
import java.util.List;

public class QuestionDTO {
    private Long id;
    private String text;
    private Integer points;
    private List<OptionDTO> options;

    @com.fasterxml.jackson.annotation.JsonCreator
    public QuestionDTO() {}

    public QuestionDTO(Question question, List<OptionDTO> options) {
        this.id = question.getId();
        this.text = question.getText();
        this.points = question.getPoints();
        this.options = options;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public Integer getPoints() { return points; }
    public void setPoints(Integer points) { this.points = points; }
    public List<OptionDTO> getOptions() { return options; }
    public void setOptions(List<OptionDTO> options) { this.options = options; }
}
