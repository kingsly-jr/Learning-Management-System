package com.lms.backend.controller;

import com.lms.backend.dto.AdminActivityLogDTO;
import com.lms.backend.service.AdminActivityLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/activities")
public class AdminActivityLogController {

    private final AdminActivityLogService activityLogService;

    public AdminActivityLogController(AdminActivityLogService activityLogService) {
        this.activityLogService = activityLogService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AdminActivityLogDTO>> getRecentActivities() {
        return ResponseEntity.ok(activityLogService.getRecentActivities());
    }
}
