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
        try {
            entityManager.createNativeQuery(
                "TRUNCATE TABLE admin_activity_logs, assignment_submissions, assignments, " +
                "categories, certificates, courses, discussion_replies, discussion_threads, enrollments, " +
                "feedbacks, instructors, lessons, live_classes, notifications, options, questions, " +
                "quiz_attempts, quizzes, students, transactions, activity_logs RESTART IDENTITY CASCADE"
            ).executeUpdate();
            return "✅ Database successfully cleaned up! All tables truncated and sequence IDs reset to 1. (admin_users & roles preserved)";
        } catch (Exception e) {
            return "❌ Error cleaning database: " + e.getMessage();
        }
    }
}
