package com.lms.backend.service.impl;

import com.lms.backend.dto.AdminAnalyticsDTO;
import com.lms.backend.dto.InstructorAnalyticsDTO;
import com.lms.backend.dto.StudentAnalyticsDTO;
import com.lms.backend.entity.Instructor;
import com.lms.backend.entity.Student;
import com.lms.backend.entity.Enrollment;
import com.lms.backend.repository.*;
import com.lms.backend.service.AnalyticsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class AnalyticsServiceImpl implements AnalyticsService {

    private final StudentRepository studentRepository;
    private final InstructorRepository instructorRepository;
    private final AdminUserRepository adminUserRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CertificateRepository certificateRepository;
    private final TransactionRepository transactionRepository;

    public AnalyticsServiceImpl(StudentRepository studentRepository,
                                InstructorRepository instructorRepository,
                                AdminUserRepository adminUserRepository,
                                CourseRepository courseRepository,
                                EnrollmentRepository enrollmentRepository,
                                CertificateRepository certificateRepository,
                                TransactionRepository transactionRepository) {
        this.studentRepository = studentRepository;
        this.instructorRepository = instructorRepository;
        this.adminUserRepository = adminUserRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.certificateRepository = certificateRepository;
        this.transactionRepository = transactionRepository;
    }

    @Override
    public AdminAnalyticsDTO getAdminAnalytics() {
        AdminAnalyticsDTO dto = new AdminAnalyticsDTO();
        long totalUsers = studentRepository.count() + instructorRepository.count() + adminUserRepository.count();
        dto.setTotalUsers(totalUsers);
        dto.setTotalCourses(courseRepository.count());
        
        long totalEnrolls = enrollmentRepository.count();
        dto.setTotalEnrollments(totalEnrolls);
        dto.setTotalCertificates(certificateRepository.count());

        long completedEnrolls = enrollmentRepository.countByProgressPercentageGreaterThanEqual(100.0);
        double overallCompletionRate = totalEnrolls > 0 ? ((double) completedEnrolls / totalEnrolls) * 100 : 0.0;
        dto.setOverallCompletionRate(overallCompletionRate);
        
        Double totalSales = transactionRepository.sumTotalCourseSales();
        dto.setTotalCourseSales(totalSales != null ? totalSales : 0.0);
        
        Double totalGst = transactionRepository.sumTotalGstCollected();
        dto.setTotalGstCollected(totalGst != null ? totalGst : 0.0);
        
        Double totalNet = transactionRepository.sumTotalNetRevenue();
        dto.setTotalNetRevenue(totalNet != null ? totalNet : 0.0);
        
        Double adminEarn = transactionRepository.sumTotalAdminEarnings();
        dto.setTotalPlatformEarnings(adminEarn != null ? adminEarn : 0.0);
        
        Double instructorPayout = transactionRepository.sumTotalInstructorPayouts();
        dto.setTotalInstructorPayout(instructorPayout != null ? instructorPayout : 0.0);

        return dto;
    }

    @Override
    public InstructorAnalyticsDTO getInstructorAnalytics(String username) {
        Instructor instructor = instructorRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        InstructorAnalyticsDTO dto = new InstructorAnalyticsDTO();
        dto.setTotalCourses(courseRepository.countByInstructorId(instructor.getId()));
        
        long totalEnrolls = enrollmentRepository.countByCourseInstructorId(instructor.getId());
        dto.setTotalEnrollments(totalEnrolls);

        long completedEnrolls = enrollmentRepository.countByCourseInstructorIdAndProgressPercentageGreaterThanEqual(instructor.getId(), 100.0);
        dto.setCompletedEnrollments(completedEnrolls);

        double overallCompletionRate = totalEnrolls > 0 ? ((double) completedEnrolls / totalEnrolls) * 100 : 0.0;
        dto.setOverallCompletionRate(overallCompletionRate);
        
        Double totalEarnings = transactionRepository.sumInstructorEarningsByInstructorId(instructor.getId());
        dto.setTotalEarnings(totalEarnings != null ? totalEarnings : 0.0);
        
        java.time.LocalDateTime todayStart = java.time.LocalDate.now().atStartOfDay();
        Double todayEarnings = transactionRepository.sumInstructorEarningsByInstructorIdSince(instructor.getId(), todayStart);
        dto.setTodayEarnings(todayEarnings != null ? todayEarnings : 0.0);
        
        java.time.LocalDateTime monthStart = java.time.LocalDate.now().withDayOfMonth(1).atStartOfDay();
        Double monthlyEarnings = transactionRepository.sumInstructorEarningsByInstructorIdSince(instructor.getId(), monthStart);
        dto.setMonthlyEarnings(monthlyEarnings != null ? monthlyEarnings : 0.0);

        return dto;
    }

    @Override
    public StudentAnalyticsDTO getStudentAnalytics(String username) {
        Student student = studentRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        StudentAnalyticsDTO dto = new StudentAnalyticsDTO();
        
        long totalEnrolled = enrollmentRepository.countByStudentId(student.getId());
        dto.setTotalEnrolledCourses(totalEnrolled);

        long completedCourses = enrollmentRepository.countByStudentIdAndProgressPercentageGreaterThanEqual(student.getId(), 100.0);
        dto.setCompletedCourses(completedCourses);

        long certificatesEarned = certificateRepository.countByStudentId(student.getId());
        dto.setCertificatesEarned(certificatesEarned);

        double totalProgress = 0;
        var enrollments = enrollmentRepository.findByStudentId(student.getId());
        for (Enrollment e : enrollments) {
            totalProgress += (e.getProgressPercentage() != null ? e.getProgressPercentage() : 0.0);
        }
        
        double averageProgress = totalEnrolled > 0 ? (totalProgress / totalEnrolled) : 0.0;
        dto.setAverageProgress(averageProgress);

        return dto;
    }
}
