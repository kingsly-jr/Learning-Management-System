package com.lms.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    /**
     * Mocks sending an email by logging to the console.
     * In a production environment, you would inject JavaMailSender here.
     */
    @Async
    public void sendEmail(String to, String subject, String body) {
        logger.info("\n=======================================================");
        logger.info("📧 SENDING MOCK EMAIL");
        logger.info("TO:      {}", to);
        logger.info("SUBJECT: {}", subject);
        logger.info("BODY:\n{}", body);
        logger.info("=========================================================\n");
    }
}
