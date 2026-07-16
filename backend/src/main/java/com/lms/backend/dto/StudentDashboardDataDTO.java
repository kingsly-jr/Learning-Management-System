package com.lms.backend.dto;

import java.util.List;

public class StudentDashboardDataDTO {
    private StudentAnalyticsDTO stats;
    private List<AssignmentDTO> pendingAssignments;
    private List<ActivityLogDTO> recentActivity;
    private List<LiveClassDTO> upcomingClasses;
    private List<java.util.Map<String, Object>> leaderboard;

    public StudentDashboardDataDTO() {}

    public StudentAnalyticsDTO getStats() { return stats; }
    public void setStats(StudentAnalyticsDTO stats) { this.stats = stats; }

    public List<AssignmentDTO> getPendingAssignments() { return pendingAssignments; }
    public void setPendingAssignments(List<AssignmentDTO> pendingAssignments) { this.pendingAssignments = pendingAssignments; }

    public List<ActivityLogDTO> getRecentActivity() { return recentActivity; }
    public void setRecentActivity(List<ActivityLogDTO> recentActivity) { this.recentActivity = recentActivity; }

    public List<LiveClassDTO> getUpcomingClasses() { return upcomingClasses; }
    public void setUpcomingClasses(List<LiveClassDTO> upcomingClasses) { this.upcomingClasses = upcomingClasses; }

    public List<java.util.Map<String, Object>> getLeaderboard() { return leaderboard; }
    public void setLeaderboard(List<java.util.Map<String, Object>> leaderboard) { this.leaderboard = leaderboard; }
}
