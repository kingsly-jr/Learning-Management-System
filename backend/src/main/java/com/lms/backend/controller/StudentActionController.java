package com.lms.backend.controller;

import com.lms.backend.dto.*;
import com.lms.backend.service.StudentActionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/student")
public class StudentActionController {

    private final StudentActionService studentActionService;
    private final com.lms.backend.service.PdfCertificateService pdfCertificateService;

    public StudentActionController(StudentActionService studentActionService,
                                   com.lms.backend.service.PdfCertificateService pdfCertificateService) {
        this.studentActionService = studentActionService;
        this.pdfCertificateService = pdfCertificateService;
    }

    @PostMapping("/enroll/{courseId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<EnrollmentDTO> enroll(@PathVariable Long courseId, Authentication authentication) {
        return ResponseEntity.ok(studentActionService.enrollInCourse(courseId, authentication.getName()));
    }

    @GetMapping("/courses")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<CourseDTO>> getMyEnrolledCourses(Authentication authentication) {
        return ResponseEntity.ok(studentActionService.getMyEnrolledCourses(authentication.getName()));
    }

    @PostMapping("/courses/{courseId}/enroll")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<EnrollmentDTO> enrollCourseAlias(@PathVariable Long courseId, Authentication authentication) {
        return ResponseEntity.ok(studentActionService.enrollInCourse(courseId, authentication.getName()));
    }

    @PostMapping("/courses/{courseId}/lessons/{lessonId}/complete")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<EnrollmentDTO> completeLesson(@PathVariable Long courseId, @PathVariable Long lessonId, Authentication authentication) {
        return ResponseEntity.ok(studentActionService.completeLesson(courseId, lessonId, authentication.getName()));
    }

    @GetMapping("/courses/{courseId}/certificate")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<org.springframework.core.io.InputStreamResource> downloadCertificateByCourseId(@PathVariable Long courseId, Authentication authentication) {
        List<CertificateDTO> certs = studentActionService.getMyCertificates(authentication.getName());
        Long certId = certs.stream()
                .filter(c -> c.getCourseId().equals(courseId))
                .map(CertificateDTO::getId)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Certificate not found for this course"));
        
        java.io.ByteArrayInputStream bis = pdfCertificateService.generateCertificatePdf(certId);
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.add("Content-Disposition", "inline; filename=certificate.pdf");
        
        return ResponseEntity.ok()
                .headers(headers)
                .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                .body(new org.springframework.core.io.InputStreamResource(bis));
    }

    @GetMapping("/submissions/quizzes")
    @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<List<QuizAttemptDTO>> getQuizSubmissionsByCourse(@RequestParam Long courseId, Authentication authentication) {
        return ResponseEntity.ok(studentActionService.getQuizAttemptsByCourse(courseId, authentication.getName()));
    }

    @GetMapping("/submissions/assignments")
    @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<List<AssignmentSubmissionDTO>> getAssignmentSubmissionsByCourse(@RequestParam Long courseId, Authentication authentication) {
        return ResponseEntity.ok(studentActionService.getAssignmentSubmissionsByCourse(courseId, authentication.getName()));
    }

    @GetMapping("/enrollments")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<EnrollmentDTO>> getMyEnrollments(Authentication authentication) {
        return ResponseEntity.ok(studentActionService.getMyEnrollments(authentication.getName()));
    }

    @GetMapping("/enrollments/course/{courseId}")
    public ResponseEntity<EnrollmentDTO> getEnrollment(@PathVariable Long courseId, Authentication authentication) {
        return ResponseEntity.ok(studentActionService.getEnrollment(courseId, authentication.getName()));
    }

    @PutMapping("/enrollments/{enrollmentId}/progress")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<EnrollmentDTO> updateProgress(@PathVariable Long enrollmentId,
                                                        @RequestBody Map<String, Double> body,
                                                        Authentication authentication) {
        Double progress = body.get("progress");
        return ResponseEntity.ok(studentActionService.updateProgress(enrollmentId, progress, authentication.getName()));
    }

    @PostMapping("/quizzes/{quizId}/attempt")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<QuizAttemptDTO> attemptQuiz(@PathVariable Long quizId,
                                                      @RequestBody QuizSubmissionDTO submission,
                                                      Authentication authentication) {
        return ResponseEntity.ok(studentActionService.attemptQuiz(quizId, submission, authentication.getName()));
    }

    @GetMapping("/quizzes/{quizId}/attempts")
    public ResponseEntity<List<QuizAttemptDTO>> getQuizAttempts(@PathVariable Long quizId, Authentication authentication) {
        return ResponseEntity.ok(studentActionService.getQuizAttempts(quizId, authentication.getName()));
    }

    @PostMapping("/assignments/{assignmentId}/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<AssignmentSubmissionDTO> submitAssignment(@PathVariable Long assignmentId,
                                                                    @RequestBody Map<String, String> body,
                                                                    Authentication authentication) {
        String submissionUrl = body.get("submissionUrl");
        return ResponseEntity.ok(studentActionService.submitAssignment(assignmentId, submissionUrl, authentication.getName()));
    }

    @PostMapping("/assignments/{assignmentId}/submit-file")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<AssignmentSubmissionDTO> submitAssignmentFile(@PathVariable Long assignmentId,
                                                                        @RequestParam("file") MultipartFile file,
                                                                        Authentication authentication) {
        return ResponseEntity.ok(studentActionService.submitAssignmentFile(assignmentId, file, authentication.getName()));
    }

    @GetMapping("/assignments/{assignmentId}/submissions")
    public ResponseEntity<List<AssignmentSubmissionDTO>> getSubmissions(@PathVariable Long assignmentId,
                                                                        Authentication authentication) {
        return ResponseEntity.ok(studentActionService.getAssignmentSubmissions(assignmentId, authentication.getName()));
    }

    @PostMapping("/submissions/{submissionId}/grade")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<AssignmentSubmissionDTO> gradeSubmission(@PathVariable Long submissionId,
                                                                   @RequestBody Map<String, Object> body,
                                                                   Authentication authentication) {
        Double grade = Double.valueOf(body.get("grade").toString());
        String feedback = (String) body.get("feedback");
        return ResponseEntity.ok(studentActionService.gradeSubmission(submissionId, grade, feedback, authentication.getName()));
    }

    @PostMapping("/certificates/generate/{enrollmentId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<CertificateDTO> generateCertificate(@PathVariable Long enrollmentId, Authentication authentication) {
        return ResponseEntity.ok(studentActionService.generateCertificate(enrollmentId, authentication.getName()));
    }

    @GetMapping("/certificates")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<CertificateDTO>> getMyCertificates(Authentication authentication) {
        return ResponseEntity.ok(studentActionService.getMyCertificates(authentication.getName()));
    }

    @GetMapping("/certificates/verify/{code}")
    public ResponseEntity<CertificateDTO> verifyCertificate(@PathVariable String code) {
        return ResponseEntity.ok(studentActionService.verifyCertificate(code));
    }

    @GetMapping("/certificates/{id}/download")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<org.springframework.core.io.InputStreamResource> downloadCertificatePdf(@PathVariable Long id) {
        java.io.ByteArrayInputStream bis = pdfCertificateService.generateCertificatePdf(id);
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.add("Content-Disposition", "inline; filename=certificate.pdf");
        
        return ResponseEntity.ok()
                .headers(headers)
                .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                .body(new org.springframework.core.io.InputStreamResource(bis));
    }
}
