package com.lms.backend.repository;

import com.lms.backend.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findByStudentId(Long studentId);
    List<Enrollment> findByCourseId(Long courseId);
    List<Enrollment> findByCourseInstructorUsername(String username);
    Optional<Enrollment> findByStudentIdAndCourseId(Long studentId, Long courseId);
    boolean existsByStudentIdAndCourseId(Long studentId, Long courseId);
    long countByCourseId(Long courseId);
    long countByCourseInstructorId(Long instructorId);
    long countByProgressPercentageGreaterThanEqual(Double percentage);
    long countByCourseInstructorIdAndProgressPercentageGreaterThanEqual(Long instructorId, Double percentage);
    long countByStudentId(Long studentId);
    long countByStudentIdAndProgressPercentageGreaterThanEqual(Long studentId, Double percentage);
}
