package com.lms.backend.service;

import com.lms.backend.dto.AssignmentDTO;
import com.lms.backend.dto.LessonDTO;
import com.lms.backend.dto.QuizDTO;
import java.util.List;

public interface CourseItemService {
    List<LessonDTO> getLessonsByCourse(Long courseId);
    LessonDTO createLesson(Long courseId, LessonDTO lessonDTO, String username);
    LessonDTO updateLesson(Long courseId, Long lessonId, LessonDTO lessonDTO, String username);
    void deleteLesson(Long courseId, Long lessonId, String username);

    List<QuizDTO> getQuizzesByCourse(Long courseId);
    QuizDTO createOrUpdateQuiz(Long courseId, QuizDTO quizDTO, String username);

    List<AssignmentDTO> getAssignmentsByCourse(Long courseId);
    AssignmentDTO createAssignment(Long courseId, AssignmentDTO assignmentDTO, String username);
    AssignmentDTO updateAssignment(Long courseId, Long assignmentId, AssignmentDTO assignmentDTO, String username);
    void deleteAssignment(Long courseId, Long assignmentId, String username);
}
