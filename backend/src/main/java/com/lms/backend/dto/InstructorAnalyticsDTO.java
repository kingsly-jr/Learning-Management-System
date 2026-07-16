package com.lms.backend.dto;

public class InstructorAnalyticsDTO {
    private long totalCourses;
    private long totalEnrollments;
    private long completedEnrollments;
    private double overallCompletionRate;
    private long unansweredQuestions;

    public InstructorAnalyticsDTO() {}

    public long getTotalCourses() { return totalCourses; }
    public void setTotalCourses(long totalCourses) { this.totalCourses = totalCourses; }

    public long getTotalEnrollments() { return totalEnrollments; }
    public void setTotalEnrollments(long totalEnrollments) { this.totalEnrollments = totalEnrollments; }

    public long getCompletedEnrollments() { return completedEnrollments; }
    public void setCompletedEnrollments(long completedEnrollments) { this.completedEnrollments = completedEnrollments; }

    public double getOverallCompletionRate() { return overallCompletionRate; }
    public void setOverallCompletionRate(double overallCompletionRate) { this.overallCompletionRate = overallCompletionRate; }

    public long getUnansweredQuestions() { return unansweredQuestions; }
    public void setUnansweredQuestions(long unansweredQuestions) { this.unansweredQuestions = unansweredQuestions; }
}
