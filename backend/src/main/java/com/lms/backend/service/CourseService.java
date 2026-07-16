package com.lms.backend.service;

import com.lms.backend.dto.CategoryDTO;
import com.lms.backend.dto.CourseDTO;
import com.lms.backend.dto.EnrollmentDTO;
import java.util.List;

public interface CourseService {
    CategoryDTO createCategory(CategoryDTO categoryDTO);
    CategoryDTO updateCategory(Long id, CategoryDTO categoryDTO);
    void deleteCategory(Long id);
    List<CategoryDTO> getAllCategories();

    CourseDTO createCourse(CourseDTO courseDTO, String instructorUsername);
    CourseDTO updateCourse(Long courseId, CourseDTO courseDTO, String instructorUsername);
    void deleteCourse(Long courseId, String instructorUsername);
    CourseDTO publishCourse(Long courseId, String instructorUsername);
    List<CourseDTO> getCoursesForUser(String username, String search);
    CourseDTO getCourseById(Long courseId);
    List<CourseDTO> getCoursesByCategory(Long categoryId);
    List<CourseDTO> getPublicCourses(String search);
    CourseDTO uploadThumbnail(Long courseId, org.springframework.web.multipart.MultipartFile file, String username);
    List<EnrollmentDTO> getEnrollmentsForInstructor(String instructorUsername);
    CourseDTO submitCourseForReview(Long courseId, String instructorUsername);
    CourseDTO approveCourse(Long courseId, String adminUsername);
    CourseDTO rejectCourse(Long courseId, String adminUsername);
    List<CourseDTO> getCoursesByInstructorIdForAdmin(Long instructorId);
}
