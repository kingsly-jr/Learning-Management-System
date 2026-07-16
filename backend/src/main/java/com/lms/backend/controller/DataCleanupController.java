package com.lms.backend.controller;

import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cleanup-db")
public class DataCleanupController {

    @Autowired
    private EntityManager entityManager;

    @GetMapping
    @Transactional
    public String cleanupDb() {
        entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS = 0;").executeUpdate();
        
        String[] tables = {
            "assignments",
            "assignment_submissions",
            "certificates",
            "courses",
            "enrollments",
            "instructors",
            "lessons",
            "notifications",
            "options",
            "questions",
            "quizzes",
            "quiz_attempts",
            "students",
            "users"
        };

        for (String table : tables) {
            try {
                entityManager.createNativeQuery("TRUNCATE TABLE " + table).executeUpdate();
            } catch (Exception e) {
                // Ignore if table doesn't exist
            }
        }
        
        entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS = 1;").executeUpdate();

        return "Database successfully truncated (excluding admin_users, roles, and categories).";
    }
}
