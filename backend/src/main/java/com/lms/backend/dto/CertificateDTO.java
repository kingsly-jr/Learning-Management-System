package com.lms.backend.dto;

import com.lms.backend.entity.Certificate;
import java.time.LocalDateTime;

public class CertificateDTO {
    private Long id;
    private Long enrollmentId;
    private Long studentId;
    private String studentName;
    private Long courseId;
    private String courseTitle;
    private LocalDateTime issueDate;
    private String certificateCode;

    public CertificateDTO() {}

    public CertificateDTO(Certificate certificate) {
        this.id = certificate.getId();
        this.enrollmentId = certificate.getEnrollment().getId();
        this.studentId = certificate.getStudent().getId();
        this.studentName = certificate.getStudent().getUsername();
        this.courseId = certificate.getCourse().getId();
        this.courseTitle = certificate.getCourse().getTitle();
        this.issueDate = certificate.getIssueDate();
        this.certificateCode = certificate.getCertificateCode();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getEnrollmentId() { return enrollmentId; }
    public void setEnrollmentId(Long enrollmentId) { this.enrollmentId = enrollmentId; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }
    public String getCourseTitle() { return courseTitle; }
    public void setCourseTitle(String courseTitle) { this.courseTitle = courseTitle; }
    public LocalDateTime getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDateTime issueDate) { this.issueDate = issueDate; }
    public String getCertificateCode() { return certificateCode; }
    public void setCertificateCode(String certificateCode) { this.certificateCode = certificateCode; }
}
