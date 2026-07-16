package com.lms.backend.service;

import com.lms.backend.dto.*;
import java.util.List;

public interface StudentActionService {
    EnrollmentDTO enrollInCourse(Long courseId, String username);
    EnrollmentDTO updateProgress(Long enrollmentId, Double progress, String username);
    EnrollmentDTO completeLesson(Long courseId, Long lessonId, String username);
    EnrollmentDTO getEnrollment(Long courseId, String username);
    List<EnrollmentDTO> getMyEnrollments(String username);
    List<CourseDTO> getMyEnrolledCourses(String username);

    QuizAttemptDTO attemptQuiz(Long quizId, QuizSubmissionDTO submission, String username);
    List<QuizAttemptDTO> getQuizAttempts(Long quizId, String username);
    List<QuizAttemptDTO> getQuizAttemptsByCourse(Long courseId, String username);

    AssignmentSubmissionDTO submitAssignment(Long assignmentId, String submissionUrl, String username);
    List<AssignmentSubmissionDTO> getAssignmentSubmissions(Long assignmentId, String username);
    List<AssignmentSubmissionDTO> getAssignmentSubmissionsByCourse(Long courseId, String username);
    AssignmentSubmissionDTO gradeSubmission(Long submissionId, Double grade, String feedback, String instructorUsername);

    CertificateDTO generateCertificate(Long enrollmentId, String username);
    List<CertificateDTO> getMyCertificates(String username);
    CertificateDTO verifyCertificate(String code);
    AssignmentSubmissionDTO submitAssignmentFile(Long assignmentId, org.springframework.web.multipart.MultipartFile file, String username);
}
