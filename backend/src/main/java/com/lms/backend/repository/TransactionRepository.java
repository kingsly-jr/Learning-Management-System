package com.lms.backend.repository;

import com.lms.backend.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Optional<Transaction> findByRazorpayOrderId(String razorpayOrderId);
    
    @org.springframework.transaction.annotation.Transactional
    void deleteByStudentId(Long studentId);
}
