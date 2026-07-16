package com.lms.backend.service;

import com.lms.backend.dto.*;
import com.lms.backend.entity.*;
import com.lms.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class StudentDashboardService {

    @Autowired private StudentRepository studentRepository;
    @Autowired private EnrollmentRepository enrollmentRepository;
    @Autowired private CertificateRepository certificateRepository;
    @Autowired private QuizAttemptRepository quizAttemptRepository;
    @Autowired private AssignmentRepository assignmentRepository;
    @Autowired private AssignmentSubmissionRepository assignmentSubmissionRepository;
    @Autowired private ActivityLogRepository activityLogRepository;
    @Autowired private LiveClassRepository liveClassRepository;

    public StudentDashboardDataDTO getDashboardData(String username) {
        Student student = studentRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        StudentDashboardDataDTO data = new StudentDashboardDataDTO();

        // 1. Stats
        List<Enrollment> enrollments = enrollmentRepository.findByStudentId(student.getId());
        long completedCourses = enrollments.stream().filter(e -> e.getProgressPercentage() == 100).count();
        long certificates = certificateRepository.findByStudentId(student.getId()).size();
        double avgProgress = enrollments.isEmpty() ? 0 : enrollments.stream().mapToDouble(Enrollment::getProgressPercentage).average().orElse(0);
        
        List<QuizAttempt> quizAttempts = quizAttemptRepository.findByStudentId(student.getId());
        double avgQuizScore = quizAttempts.isEmpty() ? 0 : quizAttempts.stream().mapToDouble(QuizAttempt::getScore).average().orElse(0);

        StudentAnalyticsDTO stats = new StudentAnalyticsDTO();
        stats.setTotalEnrolledCourses(enrollments.size());
        stats.setCompletedCourses(completedCourses);
        stats.setCertificatesEarned(certificates);
        stats.setAverageProgress(avgProgress);
        stats.setTotalXp(student.getXp() != null ? student.getXp() : 0L);
        stats.setCurrentStreak(student.getCurrentStreak() != null ? student.getCurrentStreak() : 0);
        stats.setLearningHours(student.getLearningHours() != null ? student.getLearningHours() : 0.0);
        stats.setAverageQuizScore(avgQuizScore);
        
        // If no active enrollments, reset stats to 0 as requested
        if (enrollments.isEmpty()) {
            stats.setTotalXp(0L);
            stats.setCurrentStreak(0);
            stats.setLearningHours(0.0);
            stats.setAverageQuizScore(0.0);
        }
        
        data.setStats(stats);

        // 2. Pending Assignments
        List<Long> enrolledCourseIds = enrollments.stream().map(e -> e.getCourse().getId()).collect(Collectors.toList());
        List<AssignmentDTO> pendingAssignments = new ArrayList<>();
        if (!enrolledCourseIds.isEmpty()) {
            List<Assignment> allCourseAssignments = assignmentRepository.findByLessonCourseIdIn(enrolledCourseIds);
            for (Assignment a : allCourseAssignments) {
                if (assignmentSubmissionRepository.findByStudentIdAndAssignmentId(student.getId(), a.getId()).isEmpty()) {
                    AssignmentDTO dto = new AssignmentDTO();
                    dto.setId(a.getId());
                    dto.setTitle(a.getTitle());
                    dto.setLessonId(a.getLesson().getId());
                    dto.setLessonTitle(a.getLesson().getTitle());
                    pendingAssignments.add(dto);
                }
            }
        }
        data.setPendingAssignments(pendingAssignments);

        // 3. Recent Activity
        List<ActivityLogDTO> activityDTOs = activityLogRepository.findTop5ByStudentIdOrderByTimestampDesc(student.getId())
                .stream().map(log -> {
                    ActivityLogDTO dto = new ActivityLogDTO();
                    dto.setId(log.getId());
                    dto.setActionType(log.getActionType());
                    dto.setDescription(log.getDescription());
                    dto.setTimestamp(log.getTimestamp());
                    return dto;
                }).collect(Collectors.toList());
        data.setRecentActivity(activityDTOs);

        // 4. Upcoming Live Classes
        List<LiveClassDTO> classes = new ArrayList<>();
        if (!enrolledCourseIds.isEmpty()) {
            classes = liveClassRepository.findByCourseIdInOrderByScheduledAtAsc(enrolledCourseIds).stream()
                    .map(lc -> {
                        LiveClassDTO dto = new LiveClassDTO();
                        dto.setId(lc.getId());
                        dto.setCourseId(lc.getCourse().getId());
                        dto.setCourseName(lc.getCourse().getTitle());
                        dto.setInstructorName(lc.getInstructor().getUsername());
                        dto.setTitle(lc.getTitle());
                        dto.setScheduledAt(lc.getScheduledAt());
                        dto.setZoomLink(lc.getZoomLink());
                        return dto;
                    }).collect(Collectors.toList());
        }
        data.setUpcomingClasses(classes);

        // 6. Leaderboard (Global Top 5 for now)
        List<java.util.Map<String, Object>> leaderboard = studentRepository.findAll().stream()
                .filter(s -> s.getXp() != null && s.getXp() > 0)
                .sorted((s1, s2) -> Long.compare(s2.getXp(), s1.getXp()))
                .limit(5)
                .map(s -> java.util.Map.<String, Object>of(
                        "username", s.getUsername(),
                        "xp", s.getXp(),
                        "isCurrentUser", s.getId().equals(student.getId())
                )).collect(Collectors.toList());
        data.setLeaderboard(leaderboard);

        return data;
    }
}
