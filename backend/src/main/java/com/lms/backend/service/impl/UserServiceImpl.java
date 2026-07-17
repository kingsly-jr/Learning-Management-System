package com.lms.backend.service.impl;

import com.lms.backend.dto.UserDTO;
import com.lms.backend.dto.EnrollmentDTO;
import com.lms.backend.entity.Role;
import com.lms.backend.entity.Student;
import com.lms.backend.entity.Instructor;
import com.lms.backend.entity.AdminUser;
import com.lms.backend.repository.StudentRepository;
import com.lms.backend.repository.InstructorRepository;
import com.lms.backend.repository.AdminUserRepository;
import com.lms.backend.repository.RoleRepository;
import com.lms.backend.repository.EnrollmentRepository;
import com.lms.backend.repository.TransactionRepository;
import com.lms.backend.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    private final StudentRepository studentRepository;
    private final InstructorRepository instructorRepository;
    private final AdminUserRepository adminUserRepository;
    private final RoleRepository roleRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final com.lms.backend.repository.CourseRepository courseRepository;
    private final TransactionRepository transactionRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public UserServiceImpl(StudentRepository studentRepository, 
                           InstructorRepository instructorRepository,
                           AdminUserRepository adminUserRepository,
                           RoleRepository roleRepository,
                           EnrollmentRepository enrollmentRepository,
                           com.lms.backend.repository.CourseRepository courseRepository,
                           TransactionRepository transactionRepository,
                           org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        this.studentRepository = studentRepository;
        this.instructorRepository = instructorRepository;
        this.adminUserRepository = adminUserRepository;
        this.roleRepository = roleRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.courseRepository = courseRepository;
        this.transactionRepository = transactionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDTO getProfile(String username) {
        Optional<AdminUser> adminOpt = adminUserRepository.findByUsername(username);
        if (adminOpt.isPresent()) return new UserDTO(adminOpt.get());

        Optional<Instructor> instOpt = instructorRepository.findByUsername(username);
        if (instOpt.isPresent()) return new UserDTO(instOpt.get());

        Optional<Student> studentOpt = studentRepository.findByUsername(username);
        if (studentOpt.isPresent()) return new UserDTO(studentOpt.get());

        throw new IllegalArgumentException("User not found: " + username);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDTO> getAllUsers() {
        List<UserDTO> allUsers = new ArrayList<>();
        allUsers.addAll(studentRepository.findAll().stream().map(UserDTO::new).collect(Collectors.toList()));
        allUsers.addAll(instructorRepository.findAll().stream().map(inst -> {
            UserDTO dto = new UserDTO(inst);
            dto.setStudentCount(enrollmentRepository.countByCourseInstructorId(inst.getId()));
            return dto;
        }).collect(Collectors.toList()));
        allUsers.addAll(adminUserRepository.findAll().stream().map(UserDTO::new).collect(Collectors.toList()));
        return allUsers;
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDTO> getPublicInstructors() {
        return instructorRepository.findAll().stream().map(inst -> {
            UserDTO dto = new UserDTO(inst);
            dto.setStudentCount(enrollmentRepository.countByCourseInstructorId(inst.getId()));
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    public UserDTO updateUserRole(Long userId, String roleStr) {
        throw new UnsupportedOperationException("Updating user role is not supported in separate table architecture.");
    }

    @Override
    public UserDTO updateUser(Long userId, com.lms.backend.dto.RegisterRequest request) {
        if (request.getUsername() != null) {
            boolean usernameExists = (studentRepository.existsByUsername(request.getUsername()) && studentRepository.findByUsername(request.getUsername()).get().getId() != userId) ||
                    (instructorRepository.existsByUsername(request.getUsername()) && instructorRepository.findByUsername(request.getUsername()).get().getId() != userId) ||
                    (adminUserRepository.existsByUsername(request.getUsername()) && adminUserRepository.findByUsername(request.getUsername()).get().getId() != userId);
            if (usernameExists) throw new IllegalArgumentException("Username is already taken!");
        }
        if (request.getEmail() != null) {
            boolean emailExists = (studentRepository.existsByEmail(request.getEmail()) && studentRepository.findByEmail(request.getEmail()).get().getId() != userId) ||
                    (instructorRepository.existsByEmail(request.getEmail()) && instructorRepository.findByEmail(request.getEmail()).get().getId() != userId) ||
                    (adminUserRepository.existsByEmail(request.getEmail()) && adminUserRepository.findByEmail(request.getEmail()).get().getId() != userId);
            if (emailExists) throw new IllegalArgumentException("Email Address already in use!");
        }

        if (studentRepository.existsById(userId)) {
            Student student = studentRepository.findById(userId).get();
            if (request.getUsername() != null) student.setUsername(request.getUsername());
            if (request.getEmail() != null) student.setEmail(request.getEmail());
            if (request.getThumbnailUrl() != null) student.setThumbnailUrl(request.getThumbnailUrl());
            if (request.getFullName() != null) student.setFullName(request.getFullName());
            if (request.getPhoneNumber() != null) student.setPhoneNumber(request.getPhoneNumber());
            if (request.getDateOfBirth() != null) student.setDateOfBirth(request.getDateOfBirth());
            if (request.getGender() != null) student.setGender(request.getGender());
            if (request.getHighestQualification() != null) student.setHighestQualification(request.getHighestQualification());
            if (request.getCollege() != null) student.setCollege(request.getCollege());
            if (request.getCourse() != null) student.setCourse(request.getCourse());
            if (request.getDepartment() != null) student.setDepartment(request.getDepartment());
            if (request.getAreasOfInterest() != null) student.setAreasOfInterest(request.getAreasOfInterest());
            if (request.getBio() != null) student.setBio(request.getBio());
            if (request.getPreferredLanguage() != null) student.setPreferredLanguage(request.getPreferredLanguage());
            return new UserDTO(studentRepository.save(student));
        } else if (instructorRepository.existsById(userId)) {
            Instructor inst = instructorRepository.findById(userId).get();
            if (request.getUsername() != null) inst.setUsername(request.getUsername());
            if (request.getEmail() != null) inst.setEmail(request.getEmail());
            if (request.getThumbnailUrl() != null) inst.setThumbnailUrl(request.getThumbnailUrl());
            if (request.getFullName() != null) inst.setFullName(request.getFullName());
            if (request.getPhoneNumber() != null) inst.setPhoneNumber(request.getPhoneNumber());
            if (request.getProfessionalTitle() != null) inst.setProfessionalTitle(request.getProfessionalTitle());
            if (request.getExperienceYears() != null) inst.setExperienceYears(request.getExperienceYears());
            if (request.getHighestQualification() != null) inst.setHighestQualification(request.getHighestQualification());
            if (request.getSkills() != null) inst.setSkills(request.getSkills());
            if (request.getPortfolioUrl() != null) inst.setPortfolioUrl(request.getPortfolioUrl());
            if (request.getGovernmentId() != null) inst.setGovernmentId(request.getGovernmentId());
            if (request.getResumeUrl() != null) inst.setResumeUrl(request.getResumeUrl());
            if (request.getInterestedCategories() != null) inst.setInterestedCategories(request.getInterestedCategories());
            if (request.getBio() != null) inst.setBio(request.getBio());
            if (request.getPreferredLanguage() != null) inst.setPreferredLanguage(request.getPreferredLanguage());
            UserDTO dto = new UserDTO(instructorRepository.save(inst));
            dto.setStudentCount(enrollmentRepository.countByCourseInstructorId(inst.getId()));
            return dto;
        } else if (adminUserRepository.existsById(userId)) {
            AdminUser admin = adminUserRepository.findById(userId).get();
            if (request.getUsername() != null) admin.setUsername(request.getUsername());
            if (request.getEmail() != null) admin.setEmail(request.getEmail());
            return new UserDTO(adminUserRepository.save(admin));
        }
        throw new RuntimeException("User not found with id: " + userId);
    }

    @Override
    public UserDTO updateCurrentUser(String username, com.lms.backend.dto.RegisterRequest request) {
        Optional<Student> studentOpt = studentRepository.findByUsername(username);
        if (studentOpt.isPresent()) {
            Student student = studentOpt.get();
            // Username is NOT updated here — it's tied to the JWT token identity
            if (request.getEmail() != null) student.setEmail(request.getEmail());
            if (request.getPassword() != null && !request.getPassword().isEmpty()) {
                student.setPassword(passwordEncoder.encode(request.getPassword()));
            }
            if (request.getThumbnailUrl() != null) student.setThumbnailUrl(request.getThumbnailUrl());
            if (request.getFullName() != null) student.setFullName(request.getFullName());
            if (request.getPhoneNumber() != null) student.setPhoneNumber(request.getPhoneNumber());
            if (request.getDateOfBirth() != null) student.setDateOfBirth(request.getDateOfBirth());
            if (request.getGender() != null) student.setGender(request.getGender());
            if (request.getHighestQualification() != null) student.setHighestQualification(request.getHighestQualification());
            if (request.getCollege() != null) student.setCollege(request.getCollege());
            if (request.getCourse() != null) student.setCourse(request.getCourse());
            if (request.getDepartment() != null) student.setDepartment(request.getDepartment());
            if (request.getAreasOfInterest() != null) student.setAreasOfInterest(request.getAreasOfInterest());
            if (request.getBio() != null) student.setBio(request.getBio());
            if (request.getPreferredLanguage() != null) student.setPreferredLanguage(request.getPreferredLanguage());
            return new UserDTO(studentRepository.save(student));
        }

        Optional<Instructor> instOpt = instructorRepository.findByUsername(username);
        if (instOpt.isPresent()) {
            Instructor inst = instOpt.get();
            // Username is NOT updated here — it's tied to the JWT token identity
            if (request.getEmail() != null) inst.setEmail(request.getEmail());
            if (request.getPassword() != null && !request.getPassword().isEmpty()) {
                inst.setPassword(passwordEncoder.encode(request.getPassword()));
            }
            if (request.getThumbnailUrl() != null) inst.setThumbnailUrl(request.getThumbnailUrl());
            if (request.getFullName() != null) inst.setFullName(request.getFullName());
            if (request.getPhoneNumber() != null) inst.setPhoneNumber(request.getPhoneNumber());
            if (request.getProfessionalTitle() != null) inst.setProfessionalTitle(request.getProfessionalTitle());
            if (request.getExperienceYears() != null) inst.setExperienceYears(request.getExperienceYears());
            if (request.getHighestQualification() != null) inst.setHighestQualification(request.getHighestQualification());
            if (request.getSkills() != null) inst.setSkills(request.getSkills());
            if (request.getPortfolioUrl() != null) inst.setPortfolioUrl(request.getPortfolioUrl());
            if (request.getGovernmentId() != null) inst.setGovernmentId(request.getGovernmentId());
            if (request.getResumeUrl() != null) inst.setResumeUrl(request.getResumeUrl());
            if (request.getInterestedCategories() != null) inst.setInterestedCategories(request.getInterestedCategories());
            if (request.getBio() != null) inst.setBio(request.getBio());
            if (request.getPreferredLanguage() != null) inst.setPreferredLanguage(request.getPreferredLanguage());
            UserDTO dto = new UserDTO(instructorRepository.save(inst));
            dto.setStudentCount(enrollmentRepository.countByCourseInstructorId(inst.getId()));
            return dto;
        }

        Optional<AdminUser> adminOpt = adminUserRepository.findByUsername(username);
        if (adminOpt.isPresent()) {
            AdminUser admin = adminOpt.get();
            if (request.getUsername() != null) admin.setUsername(request.getUsername());
            if (request.getEmail() != null) admin.setEmail(request.getEmail());
            if (request.getPassword() != null && !request.getPassword().isEmpty()) {
                admin.setPassword(passwordEncoder.encode(request.getPassword()));
            }
            return new UserDTO(adminUserRepository.save(admin));
        }

        throw new RuntimeException("User not found: " + username);
    }


    @Override
    public void deleteUser(Long userId) {
        if (studentRepository.existsById(userId)) {
            transactionRepository.deleteByStudentId(userId);
            studentRepository.deleteById(userId);
        } else if (instructorRepository.existsById(userId)) {
            Instructor inst = instructorRepository.findById(userId).get();
            java.util.List<com.lms.backend.entity.Course> courses = courseRepository.findByInstructor(inst);
            courses.forEach(c -> c.setInstructor(null));
            courseRepository.saveAll(courses);
            instructorRepository.deleteById(userId);
        } else if (adminUserRepository.existsById(userId)) {
            adminUserRepository.deleteById(userId);
        } else {
            throw new RuntimeException("User not found with id: " + userId);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<EnrollmentDTO> getStudentEnrollments(Long studentId) {
        return enrollmentRepository.findByStudentId(studentId).stream()
                .filter(e -> e.getStudent() != null)
                .map(EnrollmentDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EnrollmentDTO> getInstructorEnrollmentsForAdmin(Long instructorId) {
        Instructor instructor = instructorRepository.findById(instructorId)
                .orElseThrow(() -> new IllegalArgumentException("Instructor not found: " + instructorId));
        return enrollmentRepository.findByCourseInstructorUsername(instructor.getUsername()).stream()
                .filter(e -> e.getStudent() != null)
                .map(EnrollmentDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteEnrollment(Long enrollmentId) {
        if (!enrollmentRepository.existsById(enrollmentId)) {
            throw new IllegalArgumentException("Enrollment not found with ID: " + enrollmentId);
        }
        enrollmentRepository.deleteById(enrollmentId);
    }

    @Override
    public UserDTO createUser(com.lms.backend.dto.RegisterRequest request) {
        if (studentRepository.existsByUsername(request.getUsername()) || instructorRepository.existsByUsername(request.getUsername()) || adminUserRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username is already taken!");
        }
        if (studentRepository.existsByEmail(request.getEmail()) || instructorRepository.existsByEmail(request.getEmail()) || adminUserRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email Address already in use!");
        }
        if (request.getPhoneNumber() != null && (studentRepository.existsByPhoneNumber(request.getPhoneNumber()) || instructorRepository.existsByPhoneNumber(request.getPhoneNumber()))) {
            throw new IllegalArgumentException("Phone Number already in use!");
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
            return new UserDTO(instructorRepository.save(inst));
        } else if (roleStr.equalsIgnoreCase("ADMIN")) {
            AdminUser admin = new AdminUser();
            admin.setUsername(request.getUsername());
            admin.setEmail(request.getEmail());
            admin.setPassword(passwordEncoder.encode(request.getPassword()));
            admin.setRole(role);
            return new UserDTO(adminUserRepository.save(admin));
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
            return new UserDTO(studentRepository.save(student));
        }
    }
}
