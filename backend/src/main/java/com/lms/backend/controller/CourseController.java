package com.lms.backend.controller;

import com.lms.backend.dto.CategoryDTO;
import com.lms.backend.dto.CourseDTO;
import com.lms.backend.dto.EnrollmentDTO;
import com.lms.backend.service.CourseService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
        return ResponseEntity.ok(courseService.getAllCategories());
    }

    @PostMapping("/categories")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryDTO> createCategory(@RequestBody CategoryDTO categoryDTO) {
        return ResponseEntity.ok(courseService.createCategory(categoryDTO));
    }

    @PutMapping("/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryDTO> updateCategory(@PathVariable Long id, @RequestBody CategoryDTO categoryDTO) {
        return ResponseEntity.ok(courseService.updateCategory(id, categoryDTO));
    }

    @DeleteMapping("/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        courseService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/courses")
    public ResponseEntity<List<CourseDTO>> getCourses(@RequestParam(required = false) String search, Authentication authentication) {
        return ResponseEntity.ok(courseService.getCoursesForUser(authentication.getName(), search));
    }

    @GetMapping("/courses/public")
    public ResponseEntity<List<CourseDTO>> getPublicCourses(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(courseService.getPublicCourses(search));
    }

    @GetMapping("/courses/{id}")
    public ResponseEntity<CourseDTO> getCourseById(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }

    @GetMapping("/courses/category/{categoryId}")
    public ResponseEntity<List<CourseDTO>> getCoursesByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(courseService.getCoursesByCategory(categoryId));
    }

    @PostMapping("/courses")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<CourseDTO> createCourse(@RequestBody CourseDTO courseDTO, Authentication authentication) {
        return ResponseEntity.ok(courseService.createCourse(courseDTO, authentication.getName()));
    }

    @PutMapping("/courses/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<CourseDTO> updateCourse(@PathVariable Long id, @RequestBody CourseDTO courseDTO, Authentication authentication) {
        return ResponseEntity.ok(courseService.updateCourse(id, courseDTO, authentication.getName()));
    }

    @DeleteMapping("/courses/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id, Authentication authentication) {
        courseService.deleteCourse(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/courses/{id}/publish")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<CourseDTO> publishCourse(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(courseService.publishCourse(id, authentication.getName()));
    }

    @PostMapping("/courses/{id}/thumbnail")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<CourseDTO> uploadThumbnail(@PathVariable Long id, @RequestParam("file") MultipartFile file, Authentication authentication) {
        return ResponseEntity.ok(courseService.uploadThumbnail(id, file, authentication.getName()));
    }

    @GetMapping("/instructor/enrollments")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<List<EnrollmentDTO>> getInstructorEnrollments(Authentication authentication) {
        return ResponseEntity.ok(courseService.getEnrollmentsForInstructor(authentication.getName()));
    }

    @PostMapping("/courses/{id}/submit-review")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<CourseDTO> submitCourseForReview(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(courseService.submitCourseForReview(id, authentication.getName()));
    }

    @PostMapping("/courses/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CourseDTO> approveCourse(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(courseService.approveCourse(id, authentication.getName()));
    }

    @PostMapping("/courses/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CourseDTO> rejectCourse(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(courseService.rejectCourse(id, authentication.getName()));
    }

    @GetMapping("/courses/instructor/{instructorId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CourseDTO>> getInstructorCoursesForAdmin(@PathVariable Long instructorId) {
        return ResponseEntity.ok(courseService.getCoursesByInstructorIdForAdmin(instructorId));
    }
}
