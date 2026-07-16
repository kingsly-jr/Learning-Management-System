package com.lms.backend.service;

import com.lms.backend.dto.UserDTO;
import com.lms.backend.dto.EnrollmentDTO;
import java.util.List;

public interface UserService {
    UserDTO getProfile(String username);
    List<UserDTO> getAllUsers();
    List<UserDTO> getPublicInstructors();
    UserDTO updateUserRole(Long userId, String role);
    UserDTO updateUser(Long userId, com.lms.backend.dto.RegisterRequest request);
    UserDTO updateCurrentUser(String username, com.lms.backend.dto.RegisterRequest request);
    void deleteUser(Long userId);
    List<EnrollmentDTO> getStudentEnrollments(Long studentId);
    List<EnrollmentDTO> getInstructorEnrollmentsForAdmin(Long instructorId);
    void deleteEnrollment(Long enrollmentId);
    UserDTO createUser(com.lms.backend.dto.RegisterRequest request);
}
