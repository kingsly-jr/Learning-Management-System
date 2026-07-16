package com.lms.backend.repository;

import com.lms.backend.entity.AssignmentSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AssignmentSubmissionRepository extends JpaRepository<AssignmentSubmission, Long> {
    List<AssignmentSubmission> findByStudentId(Long studentId);
    List<AssignmentSubmission> findByAssignmentId(Long assignmentId);
    Optional<AssignmentSubmission> findByStudentIdAndAssignmentId(Long studentId, Long assignmentId);
}
