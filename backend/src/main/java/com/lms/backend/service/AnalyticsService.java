package com.lms.backend.service;

import com.lms.backend.dto.AdminAnalyticsDTO;
import com.lms.backend.dto.InstructorAnalyticsDTO;

import com.lms.backend.dto.StudentAnalyticsDTO;

public interface AnalyticsService {
    AdminAnalyticsDTO getAdminAnalytics();
    InstructorAnalyticsDTO getInstructorAnalytics(String username);
    StudentAnalyticsDTO getStudentAnalytics(String username);
}
