package com.lms.backend.repository;

import com.lms.backend.entity.AdminActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdminActivityLogRepository extends JpaRepository<AdminActivityLog, Long> {
    List<AdminActivityLog> findTop20ByOrderByCreatedAtDesc();
}
