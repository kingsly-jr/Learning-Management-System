package com.lms.backend.dto;

import java.util.List;
import java.util.Map;

public class InstructorDashboardDataDTO {
    private InstructorAnalyticsDTO stats;
    private List<LiveClassDTO> upcomingClasses;
    private List<Map<String, Object>> leaderboard;
    private List<ActivityLogDTO> recentActivity;
    private List<AssignmentSubmissionDTO> pendingGrading;

    public InstructorDashboardDataDTO() {}

    public InstructorAnalyticsDTO getStats() { return stats; }
    public void setStats(InstructorAnalyticsDTO stats) { this.stats = stats; }

    public List<LiveClassDTO> getUpcomingClasses() { return upcomingClasses; }
    public void setUpcomingClasses(List<LiveClassDTO> upcomingClasses) { this.upcomingClasses = upcomingClasses; }

    public List<Map<String, Object>> getLeaderboard() { return leaderboard; }
    public void setLeaderboard(List<Map<String, Object>> leaderboard) { this.leaderboard = leaderboard; }

    public List<ActivityLogDTO> getRecentActivity() { return recentActivity; }
    public void setRecentActivity(List<ActivityLogDTO> recentActivity) { this.recentActivity = recentActivity; }

    public List<AssignmentSubmissionDTO> getPendingGrading() { return pendingGrading; }
    public void setPendingGrading(List<AssignmentSubmissionDTO> pendingGrading) { this.pendingGrading = pendingGrading; }
}
