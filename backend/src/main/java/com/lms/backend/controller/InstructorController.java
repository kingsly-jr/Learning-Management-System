package com.lms.backend.controller;

import com.lms.backend.dto.AssignmentSubmissionDTO;
import com.lms.backend.entity.Assignment;
import com.lms.backend.repository.AssignmentRepository;
import com.lms.backend.repository.AssignmentSubmissionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import com.lms.backend.service.InstructorDashboardService;
import org.springframework.web.bind.annotation.PostMapping;

@RestController
@RequestMapping("/api/instructor")
public class InstructorController {

    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository assignmentSubmissionRepository;
    private final InstructorDashboardService dashboardService;

    public InstructorController(AssignmentRepository assignmentRepository, 
                                AssignmentSubmissionRepository assignmentSubmissionRepository,
                                InstructorDashboardService dashboardService) {
        this.assignmentRepository = assignmentRepository;
        this.assignmentSubmissionRepository = assignmentSubmissionRepository;
        this.dashboardService = dashboardService;
    }

    @GetMapping("/submissions")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    @Transactional(readOnly = true)
    public ResponseEntity<List<AssignmentSubmissionDTO>> getCourseSubmissions(@RequestParam Long courseId) {
        List<Assignment> assignments = assignmentRepository.findByLessonCourseId(courseId);
        List<AssignmentSubmissionDTO> submissions = new ArrayList<>();
        
        for (Assignment assignment : assignments) {
            submissions.addAll(
                assignmentSubmissionRepository.findByAssignmentId(assignment.getId()).stream()
                    .map(AssignmentSubmissionDTO::new)
                    .collect(Collectors.toList())
            );
        }
        
        return ResponseEntity.ok(submissions);
    }

    @GetMapping("/dashboard/data")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<com.lms.backend.dto.InstructorDashboardDataDTO> getDashboardData(org.springframework.security.core.Authentication auth) {
        if (auth == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(dashboardService.getDashboardData(auth.getName()));
    }

    @PostMapping("/live-classes")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<com.lms.backend.dto.LiveClassDTO> scheduleLiveClass(
            @org.springframework.web.bind.annotation.RequestBody com.lms.backend.dto.LiveClassDTO dto, 
            org.springframework.security.core.Authentication auth) {
        return ResponseEntity.ok(dashboardService.scheduleLiveClass(dto, auth.getName()));
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/live-classes/{classId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<?> deleteLiveClass(
            @org.springframework.web.bind.annotation.PathVariable Long classId,
            org.springframework.security.core.Authentication auth) {
        dashboardService.deleteLiveClass(classId, auth.getName());
        return ResponseEntity.ok(java.util.Map.of("message", "Live Class deleted successfully"));
    }
}
