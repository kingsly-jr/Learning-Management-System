package com.lms.backend.dto;

import com.lms.backend.entity.Transaction;
import java.time.LocalDateTime;

public class TransactionDTO {
    private Long id;
    private String studentUsername;
    private String studentEmail;
    private String courseTitle;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private Double amount;
    private String status;
    private LocalDateTime createdAt;

    private Double gstAmount;
    private Double netRevenue;
    private Double adminEarnings;
    private Double instructorEarnings;
    private String paymentMethod;

    public TransactionDTO() {}

    public TransactionDTO(Transaction transaction) {
        this.id = transaction.getId();
        this.studentUsername = transaction.getStudent().getUsername();
        this.studentEmail = transaction.getStudent().getEmail();
        this.courseTitle = transaction.getCourse().getTitle();
        this.razorpayOrderId = transaction.getRazorpayOrderId();
        this.razorpayPaymentId = transaction.getRazorpayPaymentId();
        this.amount = transaction.getAmount();
        this.status = transaction.getStatus();
        this.createdAt = transaction.getCreatedAt();
        
        this.gstAmount = transaction.getGstAmount();
        this.netRevenue = transaction.getNetRevenue();
        this.adminEarnings = transaction.getAdminEarnings();
        this.instructorEarnings = transaction.getInstructorEarnings();
        this.paymentMethod = transaction.getPaymentMethod();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getStudentUsername() { return studentUsername; }
    public void setStudentUsername(String studentUsername) { this.studentUsername = studentUsername; }

    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }

    public String getCourseTitle() { return courseTitle; }
    public void setCourseTitle(String courseTitle) { this.courseTitle = courseTitle; }

    public String getRazorpayOrderId() { return razorpayOrderId; }
    public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }

    public String getRazorpayPaymentId() { return razorpayPaymentId; }
    public void setRazorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Double getGstAmount() { return gstAmount; }
    public void setGstAmount(Double gstAmount) { this.gstAmount = gstAmount; }

    public Double getNetRevenue() { return netRevenue; }
    public void setNetRevenue(Double netRevenue) { this.netRevenue = netRevenue; }

    public Double getAdminEarnings() { return adminEarnings; }
    public void setAdminEarnings(Double adminEarnings) { this.adminEarnings = adminEarnings; }

    public Double getInstructorEarnings() { return instructorEarnings; }
    public void setInstructorEarnings(Double instructorEarnings) { this.instructorEarnings = instructorEarnings; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
}
