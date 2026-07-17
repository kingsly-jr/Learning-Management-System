package com.lms.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private Course course;

    @Column(name = "razorpay_order_id")
    private String razorpayOrderId;

    @Column(name = "razorpay_payment_id")
    private String razorpayPaymentId;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private String status; // PENDING, PAID, FAILED

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Transaction() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }

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

    // Revenue Sharing Fields
    @Column(name = "instructor_id")
    private Long instructorId;

    @Column(name = "gst_percentage")
    private Double gstPercentage = 18.0;

    @Column(name = "gst_amount")
    private Double gstAmount;

    @Column(name = "net_revenue")
    private Double netRevenue;

    @Column(name = "admin_percentage")
    private Double adminPercentage = 80.0;

    @Column(name = "admin_earnings")
    private Double adminEarnings;

    @Column(name = "instructor_percentage")
    private Double instructorPercentage = 20.0;

    @Column(name = "instructor_earnings")
    private Double instructorEarnings;

    @Column(name = "payment_method")
    private String paymentMethod;

    public Long getInstructorId() { return instructorId; }
    public void setInstructorId(Long instructorId) { this.instructorId = instructorId; }

    public Double getGstPercentage() { return gstPercentage; }
    public void setGstPercentage(Double gstPercentage) { this.gstPercentage = gstPercentage; }

    public Double getGstAmount() { return gstAmount; }
    public void setGstAmount(Double gstAmount) { this.gstAmount = gstAmount; }

    public Double getNetRevenue() { return netRevenue; }
    public void setNetRevenue(Double netRevenue) { this.netRevenue = netRevenue; }

    public Double getAdminPercentage() { return adminPercentage; }
    public void setAdminPercentage(Double adminPercentage) { this.adminPercentage = adminPercentage; }

    public Double getAdminEarnings() { return adminEarnings; }
    public void setAdminEarnings(Double adminEarnings) { this.adminEarnings = adminEarnings; }

    public Double getInstructorPercentage() { return instructorPercentage; }
    public void setInstructorPercentage(Double instructorPercentage) { this.instructorPercentage = instructorPercentage; }

    public Double getInstructorEarnings() { return instructorEarnings; }
    public void setInstructorEarnings(Double instructorEarnings) { this.instructorEarnings = instructorEarnings; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
}
