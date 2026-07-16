package com.lms.backend.controller;

import com.lms.backend.dto.AssignmentDTO;
import com.lms.backend.dto.LessonDTO;
import com.lms.backend.dto.QuizDTO;
import com.lms.backend.service.CourseItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses/{courseId}")
public class CourseItemController {

    private final CourseItemService courseItemService;

    public CourseItemController(CourseItemService courseItemService) {
        this.courseItemService = courseItemService;
    }

    @GetMapping("/lessons")
    public ResponseEntity<List<LessonDTO>> getLessons(@PathVariable Long courseId) {
        return ResponseEntity.ok(courseItemService.getLessonsByCourse(courseId));
    }

    @PostMapping("/lessons")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<LessonDTO> createLesson(@PathVariable Long courseId,
                                                  @RequestBody LessonDTO lessonDTO,
                                                  Authentication authentication) {
        return ResponseEntity.ok(courseItemService.createLesson(courseId, lessonDTO, authentication.getName()));
    }

    @PutMapping("/lessons/{lessonId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<LessonDTO> updateLesson(@PathVariable Long courseId,
                                                  @PathVariable Long lessonId,
                                                  @RequestBody LessonDTO lessonDTO,
                                                  Authentication authentication) {
        return ResponseEntity.ok(courseItemService.updateLesson(courseId, lessonId, lessonDTO, authentication.getName()));
    }

    @DeleteMapping("/lessons/{lessonId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<Void> deleteLesson(@PathVariable Long courseId,
                                             @PathVariable Long lessonId,
                                             Authentication authentication) {
        courseItemService.deleteLesson(courseId, lessonId, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/quizzes")
    public ResponseEntity<List<QuizDTO>> getQuizzes(@PathVariable Long courseId) {
        return ResponseEntity.ok(courseItemService.getQuizzesByCourse(courseId));
    }

    @PostMapping("/quizzes")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<QuizDTO> createOrUpdateQuiz(@PathVariable Long courseId,
                                                      @RequestBody QuizDTO quizDTO,
                                                      Authentication authentication) {
        return ResponseEntity.ok(courseItemService.createOrUpdateQuiz(courseId, quizDTO, authentication.getName()));
    }

    @GetMapping("/assignments")
    public ResponseEntity<List<AssignmentDTO>> getAssignments(@PathVariable Long courseId) {
        return ResponseEntity.ok(courseItemService.getAssignmentsByCourse(courseId));
    }

    @PostMapping("/assignments")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<AssignmentDTO> createAssignment(@PathVariable Long courseId,
                                                          @RequestBody AssignmentDTO assignmentDTO,
                                                          Authentication authentication) {
        return ResponseEntity.ok(courseItemService.createAssignment(courseId, assignmentDTO, authentication.getName()));
    }

    @PutMapping("/assignments/{assignmentId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<AssignmentDTO> updateAssignment(@PathVariable Long courseId,
                                                          @PathVariable Long assignmentId,
                                                          @RequestBody AssignmentDTO assignmentDTO,
                                                          Authentication authentication) {
        return ResponseEntity.ok(courseItemService.updateAssignment(courseId, assignmentId, assignmentDTO, authentication.getName()));
    }

    @DeleteMapping("/assignments/{assignmentId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<Void> deleteAssignment(@PathVariable Long courseId,
                                                 @PathVariable Long assignmentId,
                                                 Authentication authentication) {
        courseItemService.deleteAssignment(courseId, assignmentId, authentication.getName());
        return ResponseEntity.ok().build();
    }
}
