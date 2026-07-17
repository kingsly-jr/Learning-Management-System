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

    private double totalEarnings;
    private double todayEarnings;
    private double monthlyEarnings;

    public double getTotalEarnings() { return totalEarnings; }
    public void setTotalEarnings(double totalEarnings) { this.totalEarnings = totalEarnings; }

    public double getTodayEarnings() { return todayEarnings; }
    public void setTodayEarnings(double todayEarnings) { this.todayEarnings = todayEarnings; }

    public double getMonthlyEarnings() { return monthlyEarnings; }
    public void setMonthlyEarnings(double monthlyEarnings) { this.monthlyEarnings = monthlyEarnings; }
}
