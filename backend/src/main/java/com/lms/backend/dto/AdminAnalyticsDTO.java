package com.lms.backend.dto;

public class AdminAnalyticsDTO {
    private long totalUsers;
    private long totalCourses;
    private long totalEnrollments;
    private long totalCertificates;
    private double overallCompletionRate;

    public AdminAnalyticsDTO() {}

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

    public long getTotalCourses() { return totalCourses; }
    public void setTotalCourses(long totalCourses) { this.totalCourses = totalCourses; }

    public long getTotalEnrollments() { return totalEnrollments; }
    public void setTotalEnrollments(long totalEnrollments) { this.totalEnrollments = totalEnrollments; }

    public long getTotalCertificates() { return totalCertificates; }
    public void setTotalCertificates(long totalCertificates) { this.totalCertificates = totalCertificates; }

    public double getOverallCompletionRate() { return overallCompletionRate; }
    public void setOverallCompletionRate(double overallCompletionRate) { this.overallCompletionRate = overallCompletionRate; }
}
