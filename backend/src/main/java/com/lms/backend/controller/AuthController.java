package com.lms.backend.controller;

import com.lms.backend.dto.*;
import com.lms.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.lms.backend.repository.InstructorRepository;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final InstructorRepository instructorRepository;

    public AuthController(AuthService authService, InstructorRepository instructorRepository) {
        this.authService = authService;
        this.instructorRepository = instructorRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest registerRequest) {
        AuthResponse response = authService.register(registerRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        AuthResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/instructors")
    public ResponseEntity<List<String>> getInstructors() {
        List<String> instructors = instructorRepository.findAll().stream()
                .map(instructor -> instructor.getUsername())
                .collect(Collectors.toList());
        return ResponseEntity.ok(instructors);
    }
}
