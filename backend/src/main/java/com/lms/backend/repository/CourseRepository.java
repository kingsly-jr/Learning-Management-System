package com.lms.backend.repository;

import com.lms.backend.entity.Course;
import com.lms.backend.entity.Instructor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByPublished(Boolean published);
    List<Course> findByCategoryIdAndPublished(Long categoryId, Boolean published);
    List<Course> findByInstructor(Instructor instructor);
    List<Course> findByTitleContainingIgnoreCaseAndPublishedTrue(String keyword);
    List<Course> findByCategoryIdAndPublishedTrue(Long categoryId);
    long countByCategoryId(Long categoryId);
    long countByInstructorId(Long instructorId);
}
