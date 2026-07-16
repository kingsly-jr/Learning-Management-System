package com.lms.backend.repository;

import com.lms.backend.entity.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CertificateRepository extends JpaRepository<Certificate, Long> {
    List<Certificate> findByStudentId(Long studentId);
    Optional<Certificate> findByEnrollmentId(Long enrollmentId);
    Optional<Certificate> findByCertificateCode(String certificateCode);
    long countByStudentId(Long studentId);
}
