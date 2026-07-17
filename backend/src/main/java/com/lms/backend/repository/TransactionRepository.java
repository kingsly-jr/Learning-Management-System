package com.lms.backend.repository;

import com.lms.backend.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Optional<Transaction> findByRazorpayOrderId(String razorpayOrderId);
    
    @org.springframework.transaction.annotation.Transactional
    void deleteByStudentId(Long studentId);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.status = 'PAID'")
    Double sumTotalCourseSales();

    @org.springframework.data.jpa.repository.Query("SELECT SUM(t.gstAmount) FROM Transaction t WHERE t.status = 'PAID'")
    Double sumTotalGstCollected();

    @org.springframework.data.jpa.repository.Query("SELECT SUM(t.netRevenue) FROM Transaction t WHERE t.status = 'PAID'")
    Double sumTotalNetRevenue();

    @org.springframework.data.jpa.repository.Query("SELECT SUM(t.adminEarnings) FROM Transaction t WHERE t.status = 'PAID'")
    Double sumTotalAdminEarnings();

    @org.springframework.data.jpa.repository.Query("SELECT SUM(t.instructorEarnings) FROM Transaction t WHERE t.status = 'PAID'")
    Double sumTotalInstructorPayouts();

    @org.springframework.data.jpa.repository.Query("SELECT SUM(t.instructorEarnings) FROM Transaction t WHERE t.instructorId = :instructorId AND t.status = 'PAID'")
    Double sumInstructorEarningsByInstructorId(@org.springframework.data.repository.query.Param("instructorId") Long instructorId);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(t.instructorEarnings) FROM Transaction t WHERE t.instructorId = :instructorId AND t.status = 'PAID' AND t.createdAt >= :startDate")
    Double sumInstructorEarningsByInstructorIdSince(@org.springframework.data.repository.query.Param("instructorId") Long instructorId, @org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate);
}
