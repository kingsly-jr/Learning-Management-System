package com.lms.backend.service;

import com.lms.backend.dto.AdminActivityLogDTO;
import com.lms.backend.entity.AdminActivityLog;
import com.lms.backend.repository.AdminActivityLogRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminActivityLogService {

    private final AdminActivityLogRepository repository;

    public AdminActivityLogService(AdminActivityLogRepository repository) {
        this.repository = repository;
    }

    /**
     * Log a platform-wide activity.
     */
    public void log(String actionType, String description, String actorUsername, String targetType, Long targetId) {
        AdminActivityLog entry = new AdminActivityLog(actionType, description, actorUsername, targetType, targetId);
        repository.save(entry);
    }

    /**
     * Convenience overload without targetId.
     */
    public void log(String actionType, String description, String actorUsername, String targetType) {
        log(actionType, description, actorUsername, targetType, null);
    }

    /**
     * Get the 20 most recent activities.
     */
    public List<AdminActivityLogDTO> getRecentActivities() {
        return repository.findTop20ByOrderByCreatedAtDesc()
                .stream()
                .map(AdminActivityLogDTO::new)
                .collect(Collectors.toList());
    }
}
