package com.lms.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "options")
public class Option {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private Question question;

    @Column(nullable = false)
    private String text;

    @Column(name = "is_correct", nullable = false)
    private Boolean correct = false;

    public Option() {}

    public Option(Question question, String text, Boolean correct) {
        this.question = question;
        this.text = text;
        this.correct = correct;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Question getQuestion() { return question; }
    public void setQuestion(Question question) { this.question = question; }
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public Boolean getCorrect() { return correct; }
    public void setCorrect(Boolean correct) { this.correct = correct; }
}
