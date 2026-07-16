package com.lms.backend.service.impl;

import com.lms.backend.dto.*;
import com.lms.backend.entity.*;
import com.lms.backend.repository.*;
import com.lms.backend.service.AnalyticsService;
import com.lms.backend.service.InstructorDashboardService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class InstructorDashboardServiceImpl implements InstructorDashboardService {

    private final InstructorRepository instructorRepository;
    private final CourseRepository courseRepository;
    private final LiveClassRepository liveClassRepository;
    private final StudentRepository studentRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository assignmentSubmissionRepository;
    private final AnalyticsService analyticsService;
    private final DiscussionThreadRepository discussionThreadRepository;
    private final DiscussionReplyRepository discussionReplyRepository;

    public InstructorDashboardServiceImpl(
            InstructorRepository instructorRepository,
            CourseRepository courseRepository,
            LiveClassRepository liveClassRepository,
            StudentRepository studentRepository,
            EnrollmentRepository enrollmentRepository,
            AssignmentRepository assignmentRepository,
            AssignmentSubmissionRepository assignmentSubmissionRepository,
            AnalyticsService analyticsService,
            DiscussionThreadRepository discussionThreadRepository,
            DiscussionReplyRepository discussionReplyRepository) {
        this.instructorRepository = instructorRepository;
        this.courseRepository = courseRepository;
        this.liveClassRepository = liveClassRepository;
        this.studentRepository = studentRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.assignmentRepository = assignmentRepository;
        this.assignmentSubmissionRepository = assignmentSubmissionRepository;
        this.analyticsService = analyticsService;
        this.discussionThreadRepository = discussionThreadRepository;
        this.discussionReplyRepository = discussionReplyRepository;
    }

    private Instructor getInstructor(String username) {
        return instructorRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Instructor not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public InstructorDashboardDataDTO getDashboardData(String username) {
        Instructor instructor = getInstructor(username);
        InstructorDashboardDataDTO data = new InstructorDashboardDataDTO();

        // 1. Stats
        InstructorAnalyticsDTO instructorStats = analyticsService.getInstructorAnalytics(instructor.getUsername());
        
        // Calculate unanswered questions
        long unansweredCount = 0;
        List<DiscussionThread> myThreads = discussionThreadRepository.findByCourseInstructorId(instructor.getId());
        for (DiscussionThread thread : myThreads) {
            int replies = discussionReplyRepository.countByThreadId(thread.getId());
            if (replies == 0) {
                unansweredCount++;
            }
        }
        instructorStats.setUnansweredQuestions(unansweredCount);
        data.setStats(instructorStats);

        // Get instructor's courses
        List<Course> courses = courseRepository.findByInstructor(instructor);
        List<Long> courseIds = courses.stream().map(Course::getId).collect(Collectors.toList());

        // 2. Upcoming Live Classes
        if (courseIds.isEmpty()) {
            data.setUpcomingClasses(new ArrayList<>());
            data.setLeaderboard(new ArrayList<>());
            data.setPendingGrading(new ArrayList<>());
            data.setRecentActivity(new ArrayList<>());
            return data;
        }

        List<LiveClassDTO> upcomingClasses = liveClassRepository.findByCourseIdInOrderByScheduledAtAsc(courseIds).stream()
                .map(lc -> {
                    LiveClassDTO dto = new LiveClassDTO();
                    dto.setId(lc.getId());
                    dto.setCourseId(lc.getCourse().getId());
                    dto.setCourseName(lc.getCourse().getTitle());
                    dto.setInstructorName(instructor.getUsername());
                    dto.setTitle(lc.getTitle());
                    dto.setScheduledAt(lc.getScheduledAt());
                    dto.setEndTime(lc.getEndTime());
                    dto.setZoomLink(lc.getZoomLink());
                    return dto;
                }).collect(Collectors.toList());
        data.setUpcomingClasses(upcomingClasses);

        // 3. Leaderboard (students in their courses)
        Set<Long> studentIds = new HashSet<>();
        for (Long cid : courseIds) {
            enrollmentRepository.findByCourseId(cid).forEach(e -> studentIds.add(e.getStudent().getId()));
        }

        List<Map<String, Object>> leaderboard = studentIds.stream()
                .map(sid -> studentRepository.findById(sid).orElse(null))
                .filter(Objects::nonNull)
                .filter(s -> s.getXp() != null && s.getXp() > 0)
                .sorted((s1, s2) -> Long.compare(s2.getXp(), s1.getXp()))
                .limit(10)
                .map(s -> Map.<String, Object>of(
                        "studentId", s.getId(),
                        "username", s.getUsername(),
                        "xp", s.getXp()
                ))
                .collect(Collectors.toList());
        data.setLeaderboard(leaderboard);

        // 4. Pending Grading (submissions in their courses without a grade)
        List<AssignmentSubmissionDTO> pendingGrading = new ArrayList<>();
        for (Long cid : courseIds) {
            List<Assignment> assignments = assignmentRepository.findByLessonCourseId(cid);
            for (Assignment assignment : assignments) {
                assignmentSubmissionRepository.findByAssignmentId(assignment.getId()).stream()
                        .filter(sub -> sub.getGrade() == null)
                        .forEach(sub -> pendingGrading.add(new AssignmentSubmissionDTO(sub)));
            }
        }
        data.setPendingGrading(pendingGrading);

        // 5. Recent Activity (Empty for now to save query complexity, or could be filled if instructor has an ActivityLog)
        data.setRecentActivity(new ArrayList<>());

        return data;
    }

    @Override
    public LiveClassDTO scheduleLiveClass(LiveClassDTO dto, String username) {
        Instructor instructor = getInstructor(username);
        Course course = courseRepository.findById(dto.getCourseId())
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        if (!course.getInstructor().getId().equals(instructor.getId())) {
            throw new IllegalArgumentException("You can only schedule live classes for your own courses");
        }

        LiveClass liveClass = new LiveClass();
        liveClass.setCourse(course);
        liveClass.setInstructor(instructor);
        liveClass.setTitle(dto.getTitle());
        liveClass.setScheduledAt(dto.getScheduledAt());
        liveClass.setEndTime(dto.getEndTime());
        liveClass.setZoomLink(dto.getZoomLink());

        liveClassRepository.save(liveClass);

        LiveClassDTO result = new LiveClassDTO();
        result.setId(liveClass.getId());
        result.setCourseId(course.getId());
        result.setCourseName(course.getTitle());
        result.setInstructorName(instructor.getUsername());
        result.setTitle(liveClass.getTitle());
        result.setScheduledAt(liveClass.getScheduledAt());
        result.setEndTime(liveClass.getEndTime());
        result.setZoomLink(liveClass.getZoomLink());
        return result;
    }

    @Override
    public void deleteLiveClass(Long classId, String username) {
        Instructor instructor = getInstructor(username);
        LiveClass liveClass = liveClassRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Live Class not found"));

        if (!liveClass.getInstructor().getId().equals(instructor.getId())) {
            throw new IllegalArgumentException("You can only delete your own live classes");
        }

        liveClassRepository.delete(liveClass);
    }
}
