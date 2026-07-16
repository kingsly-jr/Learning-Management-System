package com.lms.backend.dto;

public class StudentAnalyticsDTO {
    private long totalEnrolledCourses;
    private long completedCourses;
    private long certificatesEarned;
    private double averageProgress;
    private long totalXp;
    private int currentStreak;
    private double learningHours;
    private double averageQuizScore;

    public StudentAnalyticsDTO() {}

    public long getTotalEnrolledCourses() { return totalEnrolledCourses; }
    public void setTotalEnrolledCourses(long totalEnrolledCourses) { this.totalEnrolledCourses = totalEnrolledCourses; }

    public long getCompletedCourses() { return completedCourses; }
    public void setCompletedCourses(long completedCourses) { this.completedCourses = completedCourses; }

    public long getCertificatesEarned() { return certificatesEarned; }
    public void setCertificatesEarned(long certificatesEarned) { this.certificatesEarned = certificatesEarned; }

    public double getAverageProgress() { return averageProgress; }
    public void setAverageProgress(double averageProgress) { this.averageProgress = averageProgress; }

    public long getTotalXp() { return totalXp; }
    public void setTotalXp(long totalXp) { this.totalXp = totalXp; }

    public int getCurrentStreak() { return currentStreak; }
    public void setCurrentStreak(int currentStreak) { this.currentStreak = currentStreak; }

    public double getLearningHours() { return learningHours; }
    public void setLearningHours(double learningHours) { this.learningHours = learningHours; }

    public double getAverageQuizScore() { return averageQuizScore; }
    public void setAverageQuizScore(double averageQuizScore) { this.averageQuizScore = averageQuizScore; }
}
