package com.lms.backend.controller;

import com.lms.backend.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/create-order/{courseId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, String>> createOrder(@PathVariable Long courseId, Authentication authentication) {
        String orderId = paymentService.createOrder(courseId, authentication.getName());
        return ResponseEntity.ok(Collections.singletonMap("orderId", orderId));
    }

    @PostMapping("/verify-payment")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, String>> verifyPayment(@RequestBody Map<String, String> payload, Authentication authentication) {
        paymentService.verifyPayment(payload, authentication.getName());
        return ResponseEntity.ok(Collections.singletonMap("status", "success"));
    }

    @GetMapping("/transactions")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<java.util.List<com.lms.backend.dto.TransactionDTO>> getAllTransactions() {
        return ResponseEntity.ok(paymentService.getAllTransactions());
    }
}
