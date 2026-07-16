package com.lms.backend.repository;

import com.lms.backend.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByLessonId(Long lessonId);
    List<Assignment> findByLessonCourseId(Long courseId);
    List<Assignment> findByLessonCourseIdIn(List<Long> courseIds);
}
