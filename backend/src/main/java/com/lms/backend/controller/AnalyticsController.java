package com.lms.backend.controller;

import com.lms.backend.dto.AdminAnalyticsDTO;
import com.lms.backend.dto.InstructorAnalyticsDTO;
import com.lms.backend.dto.StudentAnalyticsDTO;
import com.lms.backend.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminAnalyticsDTO> getAdminAnalytics() {
        return ResponseEntity.ok(analyticsService.getAdminAnalytics());
    }

    @GetMapping("/instructor")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<InstructorAnalyticsDTO> getInstructorAnalytics(Authentication authentication) {
        return ResponseEntity.ok(analyticsService.getInstructorAnalytics(authentication.getName()));
    }

    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentAnalyticsDTO> getStudentAnalytics(Authentication authentication) {
        return ResponseEntity.ok(analyticsService.getStudentAnalytics(authentication.getName()));
    }
}
