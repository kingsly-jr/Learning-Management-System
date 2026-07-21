package com.lms.backend.service.impl;

import com.lms.backend.dto.*;
import com.lms.backend.entity.*;
import com.lms.backend.repository.*;
import com.lms.backend.service.StudentActionService;
import com.lms.backend.service.EmailService;
import com.lms.backend.service.FileStorageService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class StudentActionServiceImpl implements StudentActionService {

    private final StudentRepository studentRepository;
    private final InstructorRepository instructorRepository;
    private final AdminUserRepository adminUserRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final QuestionRepository questionRepository;
    private final OptionRepository optionRepository;
    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository assignmentSubmissionRepository;
    private final LessonRepository lessonRepository;
    private final CertificateRepository certificateRepository;
    private final EmailService emailService;
    private final FileStorageService fileStorageService;
    private final NotificationRepository notificationRepository;

    public StudentActionServiceImpl(StudentRepository studentRepository,
                                    InstructorRepository instructorRepository,
                                    AdminUserRepository adminUserRepository,
                                    CourseRepository courseRepository,
                                    EnrollmentRepository enrollmentRepository,
                                    QuizRepository quizRepository,
                                    QuizAttemptRepository quizAttemptRepository,
                                    QuestionRepository questionRepository,
                                    OptionRepository optionRepository,
                                    AssignmentRepository assignmentRepository,
                                    AssignmentSubmissionRepository assignmentSubmissionRepository,
                                    LessonRepository lessonRepository,
                                    CertificateRepository certificateRepository,
                                    EmailService emailService,
                                    FileStorageService fileStorageService,
                                    NotificationRepository notificationRepository) {
        this.studentRepository = studentRepository;
        this.instructorRepository = instructorRepository;
        this.adminUserRepository = adminUserRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.quizRepository = quizRepository;
        this.quizAttemptRepository = quizAttemptRepository;
        this.questionRepository = questionRepository;
        this.optionRepository = optionRepository;
        this.assignmentRepository = assignmentRepository;
        this.assignmentSubmissionRepository = assignmentSubmissionRepository;
        this.lessonRepository = lessonRepository;
        this.certificateRepository = certificateRepository;
        this.emailService = emailService;
        this.fileStorageService = fileStorageService;
        this.notificationRepository = notificationRepository;
    }

    private Student getStudent(String username) {
        return studentRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
    }

    @Override
    public EnrollmentDTO enrollInCourse(Long courseId, String username) {
        Student student = getStudent(username);

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        if (!course.getPublished()) {
            throw new IllegalArgumentException("Cannot enroll in an unpublished course");
        }

        Optional<Enrollment> existing = enrollmentRepository.findByStudentIdAndCourseId(student.getId(), courseId);
        if (existing.isPresent()) {
            return new EnrollmentDTO(existing.get());
        }

        if (course.getPrice() != null && course.getPrice() > 0) {
            throw new IllegalArgumentException("This is a paid course. Please complete payment first.");
        }

        Enrollment enrollment = new Enrollment(student, course);
        enrollmentRepository.save(enrollment);

        emailService.sendEmail(
            student.getEmail(),
            "Enrollment Confirmed: " + course.getTitle(),
            "Hi " + student.getUsername() + ",\n\nYou have successfully enrolled in " + course.getTitle() + ".\nEnjoy the course!"
        );

        return new EnrollmentDTO(enrollment);
    }

    @Override
    public EnrollmentDTO completeLesson(Long courseId, Long lessonId, String username) {
        Student student = getStudent(username);
        Enrollment enrollment = enrollmentRepository.findByStudentIdAndCourseId(student.getId(), courseId)
                .orElseThrow(() -> new IllegalArgumentException("Enrollment not found"));
        
        // 1. Verify all quizzes for this lesson are passed (>= 50%)
        List<Quiz> lessonQuizzes = quizRepository.findByLessonId(lessonId);
        for (Quiz quiz : lessonQuizzes) {
            boolean passed = quizAttemptRepository.findByStudentIdAndQuizId(student.getId(), quiz.getId())
                    .stream().anyMatch(attempt -> attempt.getScore() >= 50);
            if (!passed) {
                throw new IllegalArgumentException("You must pass all quizzes for this lesson before proceeding.");
            }
        }

        // 2. Verify all assignments for this lesson are graded
        List<Assignment> lessonAssignments = assignmentRepository.findByLessonId(lessonId);
        for (Assignment assignment : lessonAssignments) {
            boolean graded = assignmentSubmissionRepository.findByStudentIdAndAssignmentId(student.getId(), assignment.getId())
                    .stream().anyMatch(sub -> sub.getGrade() != null);
            if (!graded) {
                throw new IllegalArgumentException("You must submit all assignments and wait for grading before proceeding.");
            }
        }

        enrollment.getCompletedLessonIds().add(lessonId);
        
        // Update automatic progress
        long totalLessons = lessonRepository.findByCourseIdOrderBySequenceOrderAsc(courseId).size();
        if (totalLessons > 0) {
            double progress = (enrollment.getCompletedLessonIds().size() / (double) totalLessons) * 100;
            enrollment.setProgressPercentage(progress);
        }

        // Generate Certificate if 100% completed
        if (enrollment.getProgressPercentage() >= 100.0 && !enrollment.getCertificateGenerated()) {
            enrollment.setCertificateGenerated(true);
            enrollment.setCompletedAt(LocalDateTime.now());
            
            Certificate certificate = new Certificate();
            certificate.setEnrollment(enrollment);
            certificate.setStudent(student);
            certificate.setCourse(enrollment.getCourse());
            certificate.setCertificateCode("CERT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            certificateRepository.save(certificate);
            
            // Optional: Send notification or email
        }

        enrollmentRepository.save(enrollment);
        return new EnrollmentDTO(enrollment);
    }

    @Override
    public EnrollmentDTO updateProgress(Long enrollmentId, Double progress, String username) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new IllegalArgumentException("Enrollment record not found"));

        if (!enrollment.getStudent().getUsername().equals(username)) {
            throw new AccessDeniedException("You are not authorized to update progress for this enrollment");
        }

        enrollment.setProgressPercentage(Math.min(100.0, Math.max(0.0, progress)));
        
        // Generate Certificate if 100% completed
        if (enrollment.getProgressPercentage() >= 100.0 && !enrollment.getCertificateGenerated()) {
            enrollment.setCertificateGenerated(true);
            enrollment.setCompletedAt(LocalDateTime.now());
            
            Certificate certificate = new Certificate();
            certificate.setEnrollment(enrollment);
            certificate.setStudent(enrollment.getStudent());
            certificate.setCourse(enrollment.getCourse());
            certificate.setCertificateCode("CERT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            certificateRepository.save(certificate);
        }

        enrollmentRepository.save(enrollment);
        return new EnrollmentDTO(enrollment);
    }

    @Override
    @Transactional(readOnly = true)
    public EnrollmentDTO getEnrollment(Long courseId, String username) {
        Student student = getStudent(username);
        Enrollment enrollment = enrollmentRepository.findByStudentIdAndCourseId(student.getId(), courseId)
                .orElseThrow(() -> new IllegalArgumentException("Enrollment not found"));
        return new EnrollmentDTO(enrollment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EnrollmentDTO> getMyEnrollments(String username) {
        Student student = studentRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
        return enrollmentRepository.findByStudentId(student.getId()).stream()
                .map(EnrollmentDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseDTO> getMyEnrolledCourses(String username) {
        Student student = studentRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
        return enrollmentRepository.findByStudentId(student.getId()).stream()
                .map(enrollment -> {
                    CourseDTO courseDTO = new CourseDTO(enrollment.getCourse());
                    courseDTO.setProgressPercentage(enrollment.getProgressPercentage());
                    return courseDTO;
                })
                .collect(Collectors.toList());
    }

    @Override
    public QuizAttemptDTO attemptQuiz(Long quizId, QuizSubmissionDTO submission, String username) {
        Student student = getStudent(username);

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new IllegalArgumentException("Quiz not found"));

        List<Question> questions = questionRepository.findByQuizId(quizId);
        int totalPoints = questions.stream().mapToInt(Question::getPoints).sum();
        int earnedPoints = 0;

        Map<Long, Long> submissionMap = new HashMap<>();
        if (submission.getAnswers() != null) {
            for (AnswerDTO answer : submission.getAnswers()) {
                submissionMap.put(answer.getQuestionId(), answer.getSelectedOptionId());
            }
        }

        for (Question question : questions) {
            Long selectedOptionId = submissionMap.get(question.getId());
            if (selectedOptionId != null) {
                Option option = optionRepository.findById(selectedOptionId).orElse(null);
                if (option != null && option.getQuestion().getId().equals(question.getId()) && option.getCorrect()) {
                    earnedPoints += question.getPoints();
                }
            }
        }

        int scorePercentage = totalPoints > 0 ? (earnedPoints * 100) / totalPoints : 100;
        boolean passed = scorePercentage >= 50;

        QuizAttempt attempt = new QuizAttempt();
        attempt.setStudent(student);
        attempt.setQuiz(quiz);
        attempt.setScore(scorePercentage);
        attempt.setPassed(passed);

        quizAttemptRepository.save(attempt);
        return new QuizAttemptDTO(attempt);
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizAttemptDTO> getQuizAttempts(Long quizId, String username) {
        Student student = getStudent(username);
        return quizAttemptRepository.findByStudentIdAndQuizId(student.getId(), quizId).stream()
                .map(QuizAttemptDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizAttemptDTO> getQuizAttemptsByCourse(Long courseId, String username) {
        Student student = getStudent(username);
        return quizAttemptRepository.findByStudentId(student.getId()).stream()
                .filter(attempt -> attempt.getQuiz().getLesson().getCourse().getId().equals(courseId))
                .map(QuizAttemptDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    public AssignmentSubmissionDTO submitAssignment(Long assignmentId, String submissionUrl, String username) {
        Student student = getStudent(username);

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new IllegalArgumentException("Assignment not found"));

        if (!enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), assignment.getLesson().getCourse().getId())) {
            throw new IllegalArgumentException("You must be enrolled in the course to submit assignments");
        }

        AssignmentSubmission submission = assignmentSubmissionRepository
                .findByStudentIdAndAssignmentId(student.getId(), assignmentId)
                .orElse(null);

        if (submission == null) {
            submission = new AssignmentSubmission();
            submission.setStudent(student);
            submission.setAssignment(assignment);
        }

        submission.setSubmissionUrl(submissionUrl);
        submission.setGrade(null);
        submission.setFeedback(null);
        submission.setGradedAt(null);

        assignmentSubmissionRepository.save(submission);

        // Send notification to instructor
        com.lms.backend.entity.Notification notif = new com.lms.backend.entity.Notification(
                "Student " + student.getUsername() + " has submitted the assignment: " + assignment.getTitle(),
                assignment.getLesson().getCourse().getInstructor().getUsername(),
                student.getUsername(),
                assignment.getLesson().getCourse().getId(),
                "ASSIGNMENT_SUBMISSION"
        );
        notificationRepository.save(notif);

        return new AssignmentSubmissionDTO(submission);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssignmentSubmissionDTO> getAssignmentSubmissions(Long assignmentId, String username) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new IllegalArgumentException("Assignment not found"));

        Optional<Student> studentOpt = studentRepository.findByUsername(username);
        if (studentOpt.isPresent()) {
            return assignmentSubmissionRepository.findByStudentIdAndAssignmentId(studentOpt.get().getId(), assignmentId)
                    .stream().map(AssignmentSubmissionDTO::new).collect(Collectors.toList());
        } else {
            boolean isAdmin = adminUserRepository.findByUsername(username).isPresent();
            if (!isAdmin && !assignment.getLesson().getCourse().getInstructor().getUsername().equals(username)) {
                throw new AccessDeniedException("You do not have permission to view submissions for this course");
            }
            return assignmentSubmissionRepository.findByAssignmentId(assignmentId).stream()
                    .map(AssignmentSubmissionDTO::new)
                    .collect(Collectors.toList());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssignmentSubmissionDTO> getAssignmentSubmissionsByCourse(Long courseId, String username) {
        Student student = getStudent(username);
        return assignmentSubmissionRepository.findByStudentId(student.getId()).stream()
                .filter(submission -> submission.getAssignment().getLesson().getCourse().getId().equals(courseId))
                .map(AssignmentSubmissionDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    public AssignmentSubmissionDTO gradeSubmission(Long submissionId, Double grade, String feedback, String instructorUsername) {
        AssignmentSubmission submission = assignmentSubmissionRepository.findById(submissionId)
                .orElseThrow(() -> new IllegalArgumentException("Submission not found"));

        Course course = submission.getAssignment().getLesson().getCourse();
        boolean isAdmin = adminUserRepository.findByUsername(instructorUsername).isPresent();
        
        if (!isAdmin && !course.getInstructor().getUsername().equals(instructorUsername)) {
            throw new AccessDeniedException("You do not have permission to grade this assignment");
        }

        submission.setGrade(grade);
        submission.setFeedback(feedback);
        submission.setGradedAt(LocalDateTime.now());

        assignmentSubmissionRepository.save(submission);

        emailService.sendEmail(
            submission.getStudent().getEmail(),
            "Assignment Graded: " + submission.getAssignment().getTitle(),
            "Hi " + submission.getStudent().getUsername() + ",\n\nYour submission for '" + submission.getAssignment().getTitle() + "' has been graded.\nScore: " + grade + "\nFeedback: " + feedback
        );

        return new AssignmentSubmissionDTO(submission);
    }

    @Override
    public CertificateDTO generateCertificate(Long enrollmentId, String username) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new IllegalArgumentException("Enrollment record not found"));

        if (!enrollment.getStudent().getUsername().equals(username)) {
            throw new AccessDeniedException("You cannot generate certificates for other users");
        }

        if (enrollment.getProgressPercentage() < 100.0) {
            throw new IllegalArgumentException("Course progress must be 100% to generate a certificate");
        }

        Optional<Quiz> quizOpt = quizRepository.findByLessonCourseId(enrollment.getCourse().getId()).stream().findFirst();
        if (quizOpt.isPresent()) {
            List<QuizAttempt> attempts = quizAttemptRepository.findByStudentIdAndQuizId(enrollment.getStudent().getId(), quizOpt.get().getId());
            boolean hasPassed = attempts.stream().anyMatch(QuizAttempt::getPassed);
            if (!hasPassed) {
                throw new IllegalArgumentException("You must pass the course quiz to generate a certificate");
            }
        }

        Optional<Certificate> existing = certificateRepository.findByEnrollmentId(enrollmentId);
        if (existing.isPresent()) {
            return new CertificateDTO(existing.get());
        }

        Certificate certificate = new Certificate();
        certificate.setEnrollment(enrollment);
        certificate.setStudent(enrollment.getStudent());
        certificate.setCourse(enrollment.getCourse());
        certificate.setCertificateCode("CERT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        certificateRepository.save(certificate);

        enrollment.setCertificateGenerated(true);
        enrollmentRepository.save(enrollment);

        emailService.sendEmail(
            enrollment.getStudent().getEmail(),
            "Certificate Awarded: " + enrollment.getCourse().getTitle(),
            "Congratulations " + enrollment.getStudent().getUsername() + "!\n\nYou have successfully completed '" + enrollment.getCourse().getTitle() + "' and earned your certificate.\nCertificate Code: " + certificate.getCertificateCode()
        );

        return new CertificateDTO(certificate);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CertificateDTO> getMyCertificates(String username) {
        Student student = getStudent(username);
        return certificateRepository.findByStudentId(student.getId()).stream()
                .map(CertificateDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CertificateDTO verifyCertificate(String code) {
        Certificate certificate = certificateRepository.findByCertificateCode(code)
                .orElseThrow(() -> new IllegalArgumentException("Invalid certificate code"));
        return new CertificateDTO(certificate);
    }

    @Override
    public AssignmentSubmissionDTO submitAssignmentFile(Long assignmentId, MultipartFile file, String username) {
        String fileUrl = fileStorageService.storeFile(file);
        return submitAssignment(assignmentId, fileUrl, username);
    }
}
