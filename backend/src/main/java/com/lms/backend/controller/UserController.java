package com.lms.backend.controller;

import com.lms.backend.dto.UserDTO;
import com.lms.backend.dto.EnrollmentDTO;
import com.lms.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getProfile(Authentication authentication) {
        String username = authentication.getName();
        UserDTO profile = userService.getProfile(username);
        return ResponseEntity.ok(profile);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/public/instructors")
    public ResponseEntity<List<UserDTO>> getPublicInstructors() {
        List<UserDTO> instructors = userService.getPublicInstructors();
        return ResponseEntity.ok(instructors);
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUserProfile() {
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(userService.getProfile(username));
    }

    @PutMapping("/me/update")
    public ResponseEntity<UserDTO> updateCurrentUserProfile(@jakarta.validation.Valid @RequestBody com.lms.backend.dto.UpdateProfileRequest request) {
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(userService.updateCurrentUser(username, request));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> createUser(@jakarta.validation.Valid @RequestBody com.lms.backend.dto.RegisterRequest request) {
        return ResponseEntity.ok(userService.createUser(request));
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> updateUserRole(@PathVariable Long id, @RequestParam String role) {
        UserDTO updated = userService.updateUserRole(id, role);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id, @jakarta.validation.Valid @RequestBody com.lms.backend.dto.RegisterRequest request) {
        UserDTO updated = userService.updateUser(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/enrollments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<EnrollmentDTO>> getStudentEnrollments(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getStudentEnrollments(id));
    }

    @GetMapping("/instructors/{id}/enrollments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<EnrollmentDTO>> getInstructorEnrollmentsForAdmin(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getInstructorEnrollmentsForAdmin(id));
    }

    @DeleteMapping("/enrollments/{enrollmentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteEnrollment(@PathVariable Long enrollmentId) {
        userService.deleteEnrollment(enrollmentId);
        return ResponseEntity.noContent().build();
    }
}

