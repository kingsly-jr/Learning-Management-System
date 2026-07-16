package com.lms.backend.service.impl;

import com.lms.backend.config.JwtTokenProvider;
import com.lms.backend.dto.*;
import com.lms.backend.entity.Role;
import com.lms.backend.entity.Student;
import com.lms.backend.entity.Instructor;
import com.lms.backend.entity.AdminUser;
import com.lms.backend.repository.StudentRepository;
import com.lms.backend.repository.InstructorRepository;
import com.lms.backend.repository.AdminUserRepository;
import java.util.Optional;
import com.lms.backend.service.AuthService;
import com.lms.backend.service.EmailService;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final StudentRepository studentRepository;
    private final InstructorRepository instructorRepository;
    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final EmailService emailService;
    private final com.lms.backend.repository.RoleRepository roleRepository;

    public AuthServiceImpl(AuthenticationManager authenticationManager,
                           StudentRepository studentRepository,
                           InstructorRepository instructorRepository,
                           AdminUserRepository adminUserRepository,
                           PasswordEncoder passwordEncoder,
                           JwtTokenProvider tokenProvider,
                           EmailService emailService,
                           com.lms.backend.repository.RoleRepository roleRepository) {
        this.authenticationManager = authenticationManager;
        this.studentRepository = studentRepository;
        this.instructorRepository = instructorRepository;
        this.adminUserRepository = adminUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.emailService = emailService;
        this.roleRepository = roleRepository;
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (studentRepository.existsByUsername(request.getUsername()) || instructorRepository.existsByUsername(request.getUsername()) || adminUserRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username is already taken!");
        }
        if (studentRepository.existsByEmail(request.getEmail()) || instructorRepository.existsByEmail(request.getEmail()) || adminUserRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email Address already in use!");
        }

        String roleStr = request.getRole() != null ? request.getRole() : "STUDENT";
        Role role = roleRepository.findByName(roleStr.toUpperCase())
                .orElseThrow(() -> new IllegalArgumentException("Role not found: " + roleStr));

        if (roleStr.equalsIgnoreCase("INSTRUCTOR")) {
            Instructor inst = new Instructor();
            inst.setUsername(request.getUsername());
            inst.setEmail(request.getEmail());
            inst.setPassword(passwordEncoder.encode(request.getPassword()));
            inst.setRole(role);
            inst.setFullName(request.getFullName());
            inst.setPhoneNumber(request.getPhoneNumber());
            inst.setProfessionalTitle(request.getProfessionalTitle());
            inst.setExperienceYears(request.getExperienceYears());
            inst.setHighestQualification(request.getHighestQualification());
            inst.setSkills(request.getSkills());
            inst.setPortfolioUrl(request.getPortfolioUrl());
            inst.setGovernmentId(request.getGovernmentId());
            inst.setResumeUrl(request.getResumeUrl());
            inst.setInterestedCategories(request.getInterestedCategories());
            inst.setBio(request.getBio());
            inst.setPreferredLanguage(request.getPreferredLanguage());
            inst.setThumbnailUrl(request.getThumbnailUrl());
            instructorRepository.save(inst);
            sendWelcomeEmail(inst.getEmail(), inst.getUsername(), inst.getRole().getName());
        } else {
            Student student = new Student();
            student.setUsername(request.getUsername());
            student.setEmail(request.getEmail());
            student.setPassword(passwordEncoder.encode(request.getPassword()));
            student.setRole(role);
            student.setFullName(request.getFullName());
            student.setPhoneNumber(request.getPhoneNumber());
            student.setDateOfBirth(request.getDateOfBirth());
            student.setGender(request.getGender());
            student.setHighestQualification(request.getHighestQualification());
            student.setCollege(request.getCollege());
            student.setCourse(request.getCourse());
            student.setDepartment(request.getDepartment());
            student.setThumbnailUrl(request.getThumbnailUrl());
            student.setBio(request.getBio());
            student.setPreferredLanguage(request.getPreferredLanguage());
            student.setAreasOfInterest(request.getAreasOfInterest());
            studentRepository.save(student);
            sendWelcomeEmail(student.getEmail(), student.getUsername(), student.getRole().getName());
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        return new AuthResponse(jwt, request.getUsername(), request.getEmail(), role.getName());
    }
    
    private void sendWelcomeEmail(String email, String username, String roleName) {
        emailService.sendEmail(
            email,
            "Welcome to LearnSphere!",
            "Hi " + username + ",\n\nWelcome to LearnSphere LMS. We are excited to have you on board as a " + roleName + ".\n\nHappy Learning!"
        );
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        Optional<AdminUser> adminOpt = adminUserRepository.findByUsername(request.getUsername());
        if (adminOpt.isPresent()) {
            AdminUser admin = adminOpt.get();
            return new AuthResponse(jwt, admin.getUsername(), admin.getEmail(), admin.getRole().getName());
        }

        Optional<Instructor> instOpt = instructorRepository.findByUsername(request.getUsername());
        if (instOpt.isPresent()) {
            Instructor inst = instOpt.get();
            return new AuthResponse(jwt, inst.getUsername(), inst.getEmail(), inst.getRole().getName());
        }

        Student student = studentRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return new AuthResponse(jwt, student.getUsername(), student.getEmail(), student.getRole().getName());
    }
}
