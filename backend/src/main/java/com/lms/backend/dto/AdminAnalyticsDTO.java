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

    private double totalCourseSales;
    private double totalGstCollected;
    private double totalNetRevenue;
    private double totalPlatformEarnings;
    private double totalInstructorPayout;

    public double getTotalCourseSales() { return totalCourseSales; }
    public void setTotalCourseSales(double totalCourseSales) { this.totalCourseSales = totalCourseSales; }

    public double getTotalGstCollected() { return totalGstCollected; }
    public void setTotalGstCollected(double totalGstCollected) { this.totalGstCollected = totalGstCollected; }

    public double getTotalNetRevenue() { return totalNetRevenue; }
    public void setTotalNetRevenue(double totalNetRevenue) { this.totalNetRevenue = totalNetRevenue; }

    public double getTotalPlatformEarnings() { return totalPlatformEarnings; }
    public void setTotalPlatformEarnings(double totalPlatformEarnings) { this.totalPlatformEarnings = totalPlatformEarnings; }

    public double getTotalInstructorPayout() { return totalInstructorPayout; }
    public void setTotalInstructorPayout(double totalInstructorPayout) { this.totalInstructorPayout = totalInstructorPayout; }
}
