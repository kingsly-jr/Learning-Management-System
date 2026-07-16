package com.lms.backend.service;

import com.lms.backend.dto.InstructorDashboardDataDTO;
import com.lms.backend.dto.LiveClassDTO;
import java.util.List;

public interface InstructorDashboardService {
    InstructorDashboardDataDTO getDashboardData(String username);
    LiveClassDTO scheduleLiveClass(LiveClassDTO dto, String username);
    void deleteLiveClass(Long classId, String username);
}
