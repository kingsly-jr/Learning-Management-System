package com.lms.backend.service;

import com.lms.backend.entity.Course;
import com.lms.backend.entity.Student;
import com.lms.backend.entity.Transaction;
import com.lms.backend.entity.Enrollment;
import com.lms.backend.repository.CourseRepository;
import com.lms.backend.repository.StudentRepository;
import com.lms.backend.repository.TransactionRepository;
import com.lms.backend.repository.EnrollmentRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Service
public class PaymentService {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    private final TransactionRepository transactionRepository;
    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final EmailService emailService;

    public PaymentService(TransactionRepository transactionRepository,
                          CourseRepository courseRepository,
                          StudentRepository studentRepository,
                          EnrollmentRepository enrollmentRepository,
                          EmailService emailService) {
        this.transactionRepository = transactionRepository;
        this.courseRepository = courseRepository;
        this.studentRepository = studentRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.emailService = emailService;
    }

    @Transactional
    public String createOrder(Long courseId, String username) {
        Student student = studentRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        if (course.getPrice() == null || course.getPrice() <= 0) {
            throw new IllegalArgumentException("This course is free, use regular enrollment.");
        }

        try {
            RazorpayClient razorpay = new RazorpayClient(keyId, keySecret);
            JSONObject orderRequest = new JSONObject();
            // Razorpay amount is in paise (multiply by 100)
            orderRequest.put("amount", (int) (course.getPrice() * 100));
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "txn_" + System.currentTimeMillis());

            Order order = razorpay.orders.create(orderRequest);
            String orderId = order.get("id");

            Transaction transaction = new Transaction();
            transaction.setStudent(student);
            transaction.setCourse(course);
            transaction.setAmount(course.getPrice());
            transaction.setRazorpayOrderId(orderId);
            transaction.setStatus("CREATED");
            transactionRepository.save(transaction);

            return orderId;
        } catch (RazorpayException e) {
            throw new RuntimeException("Failed to create Razorpay Order: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void verifyPayment(Map<String, String> payload, String username) {
        String orderId = payload.get("razorpay_order_id");
        String paymentId = payload.get("razorpay_payment_id");
        String signature = payload.get("razorpay_signature");

        if (orderId == null || paymentId == null || signature == null) {
            throw new IllegalArgumentException("Missing payment verification details");
        }

        Transaction transaction = transactionRepository.findByRazorpayOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found for Order ID: " + orderId));

        if (!transaction.getStudent().getUsername().equals(username)) {
            throw new IllegalArgumentException("Unauthorized transaction verification");
        }

        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", orderId);
            options.put("razorpay_payment_id", paymentId);
            options.put("razorpay_signature", signature);

            boolean isValid = Utils.verifyPaymentSignature(options, keySecret);

            if (isValid) {
                transaction.setStatus("PAID");
                transaction.setRazorpayPaymentId(paymentId);
                transactionRepository.save(transaction);

                // Create enrollment
                Optional<Enrollment> existing = enrollmentRepository.findByStudentIdAndCourseId(
                        transaction.getStudent().getId(), transaction.getCourse().getId());
                
                if (existing.isEmpty()) {
                    Enrollment enrollment = new Enrollment(transaction.getStudent(), transaction.getCourse());
                    enrollmentRepository.save(enrollment);

                    emailService.sendEmail(
                        transaction.getStudent().getEmail(),
                        "Enrollment Confirmed: " + transaction.getCourse().getTitle(),
                        "Hi " + transaction.getStudent().getUsername() + ",\n\nYour payment of ₹" + transaction.getAmount() + " was successful.\nYou have been enrolled in " + transaction.getCourse().getTitle() + ".\nEnjoy the course!"
                    );
                }
            } else {
                transaction.setStatus("FAILED");
                transactionRepository.save(transaction);
                throw new IllegalArgumentException("Payment signature verification failed");
            }
        } catch (RazorpayException e) {
            throw new RuntimeException("Error verifying payment signature: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public java.util.List<com.lms.backend.dto.TransactionDTO> getAllTransactions() {
        return transactionRepository.findAll().stream()
                .sorted((t1, t2) -> t2.getCreatedAt().compareTo(t1.getCreatedAt()))
                .map(com.lms.backend.dto.TransactionDTO::new)
                .collect(java.util.stream.Collectors.toList());
    }
}
