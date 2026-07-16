package com.lms.backend.repository;

import com.lms.backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientUsernameOrderByCreatedAtDesc(String recipientUsername);
    long countByRecipientUsernameAndIsReadFalse(String recipientUsername);
}
