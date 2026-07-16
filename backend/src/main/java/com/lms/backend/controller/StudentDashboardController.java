package com.lms.backend.controller;

import com.lms.backend.dto.StudentDashboardDataDTO;
import com.lms.backend.entity.Student;
import com.lms.backend.repository.StudentRepository;
import com.lms.backend.service.StudentDashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/student/dashboard")
public class StudentDashboardController {

    @Autowired
    private StudentDashboardService dashboardService;

    @Autowired
    private StudentRepository studentRepository;

    @GetMapping("/data")
    public ResponseEntity<StudentDashboardDataDTO> getDashboardData(Authentication auth) {
        if (auth == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(dashboardService.getDashboardData(auth.getName()));
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<?> getLeaderboard(Authentication auth) {
        if (auth == null) return ResponseEntity.status(401).build();
        
        // Simple global leaderboard for now based on XP
        List<Map<String, Object>> leaderboard = studentRepository.findAll().stream()
                .filter(s -> s.getXp() != null && s.getXp() > 0)
                .sorted((s1, s2) -> Long.compare(s2.getXp(), s1.getXp()))
                .limit(10)
                .map(s -> Map.<String, Object>of(
                        "username", s.getUsername(),
                        "xp", s.getXp(),
                        "streak", s.getCurrentStreak() != null ? s.getCurrentStreak() : 0
                )).collect(Collectors.toList());
                
        return ResponseEntity.ok(leaderboard);
    }
}
