package com.lms.backend.config;

import com.lms.backend.entity.Student;
import com.lms.backend.entity.Instructor;
import com.lms.backend.entity.AdminUser;
import com.lms.backend.repository.StudentRepository;
import com.lms.backend.repository.InstructorRepository;
import com.lms.backend.repository.AdminUserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import java.util.Collections;
import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final StudentRepository studentRepository;
    private final InstructorRepository instructorRepository;
    private final AdminUserRepository adminUserRepository;

    public CustomUserDetailsService(StudentRepository studentRepository, InstructorRepository instructorRepository, AdminUserRepository adminUserRepository) {
        this.studentRepository = studentRepository;
        this.instructorRepository = instructorRepository;
        this.adminUserRepository = adminUserRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Try finding in admin_users table first
        Optional<AdminUser> adminOpt = adminUserRepository.findByUsername(username);
        if (adminOpt.isPresent()) {
            AdminUser admin = adminOpt.get();
            return new org.springframework.security.core.userdetails.User(
                    admin.getUsername(),
                    admin.getPassword(),
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + admin.getRole().getName()))
            );
        }

        // Try finding in instructor table
        Optional<Instructor> instOpt = instructorRepository.findByUsername(username);
        if (instOpt.isPresent()) {
            Instructor inst = instOpt.get();
            return new org.springframework.security.core.userdetails.User(
                    inst.getUsername(),
                    inst.getPassword(),
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + inst.getRole().getName()))
            );
        }

        // Otherwise find in student table
        Student student = studentRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

        return new org.springframework.security.core.userdetails.User(
                student.getUsername(),
                student.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + student.getRole().getName()))
        );
    }
}
