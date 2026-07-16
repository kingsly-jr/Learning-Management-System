package com.lms.backend.controller;

import com.lms.backend.config.AppDatabaseInitializer;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.lms.backend.repository.InstructorRepository;
import com.lms.backend.entity.Instructor;
import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
@RequestMapping("/api")
public class SeedController {

    private final AppDatabaseInitializer initializer;
    private final InstructorRepository instructorRepository;
    private final PasswordEncoder passwordEncoder;

    public SeedController(AppDatabaseInitializer initializer, 
                          InstructorRepository instructorRepository,
                          PasswordEncoder passwordEncoder) {
        this.initializer = initializer;
        this.instructorRepository = instructorRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/seed-data-now")
    public ResponseEntity<String> forceSeedData() {
        try {
            initializer.run();
            return ResponseEntity.ok("✅ SUCCESS! Check your database or UI now.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("❌ FAILED: " + e.getMessage());
        }
    }

    @GetMapping("/reset-instructors")
    public ResponseEntity<String> resetInstructors() {
        try {
            String encoded = passwordEncoder.encode("pass@123");
            for (Instructor inst : instructorRepository.findAll()) {
                inst.setPassword(encoded);
                instructorRepository.save(inst);
            }
            return ResponseEntity.ok("✅ SUCCESS! All instructor passwords have been reset to pass@123");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("❌ FAILED: " + e.getMessage());
        }
    }
}
