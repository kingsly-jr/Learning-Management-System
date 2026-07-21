package com.lms.backend.config;

import com.lms.backend.entity.*;
import com.lms.backend.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AppDatabaseInitializer implements CommandLineRunner {

    private final StudentRepository   studentRepository;
    private final InstructorRepository instructorRepository;
    private final AdminUserRepository adminUserRepository;
    private final RoleRepository      roleRepository;
    private final CategoryRepository  categoryRepository;
    private final CourseRepository    courseRepository;
    private final PasswordEncoder     passwordEncoder;
    private final JdbcTemplate        jdbc;
    private final LessonRepository    lessonRepository;
    private final QuizRepository      quizRepository;
    private final QuestionRepository  questionRepository;
    private final OptionRepository    optionRepository;
    private final AssignmentRepository assignmentRepository;

    public AppDatabaseInitializer(StudentRepository studentRepository,
                                  InstructorRepository instructorRepository,
                                  AdminUserRepository adminUserRepository,
                                  RoleRepository roleRepository,
                                  CategoryRepository categoryRepository,
                                  CourseRepository courseRepository,
                                  PasswordEncoder passwordEncoder,
                                  JdbcTemplate jdbcTemplate,
                                  LessonRepository lessonRepository,
                                  QuizRepository quizRepository,
                                  QuestionRepository questionRepository,
                                  OptionRepository optionRepository,
                                  AssignmentRepository assignmentRepository) {
        this.studentRepository   = studentRepository;
        this.instructorRepository= instructorRepository;
        this.adminUserRepository = adminUserRepository;
        this.roleRepository      = roleRepository;
        this.categoryRepository  = categoryRepository;
        this.courseRepository    = courseRepository;
        this.passwordEncoder     = passwordEncoder;
        this.jdbc                = jdbcTemplate;
        this.lessonRepository    = lessonRepository;
        this.quizRepository      = quizRepository;
        this.questionRepository  = questionRepository;
        this.optionRepository    = optionRepository;
        this.assignmentRepository= assignmentRepository;
    }

    private Role seedRole(String name) {
        return roleRepository.findByName(name)
                .orElseGet(() -> roleRepository.save(new Role(name)));
    }



    @Override
    public void run(String... args) {
        System.out.println("=================================================");
        System.out.println("⚡ AppDatabaseInitializer starting...");

        // ⚠️ REMOVED: The one-time database wipe and sequence reset block has been safely removed.
        // Since Render uses an ephemeral file system, keeping it would have wiped your database on every restart!

        try {
            jdbc.execute("ALTER TABLE courses ALTER COLUMN thumbnail_url TYPE TEXT");
            jdbc.execute("ALTER TABLE lessons ALTER COLUMN video_url TYPE TEXT");
            jdbc.execute("ALTER TABLE categories ALTER COLUMN thumbnail_url TYPE TEXT");
            jdbc.execute("ALTER TABLE students ALTER COLUMN thumbnail_url TYPE TEXT");
            jdbc.execute("ALTER TABLE instructors ALTER COLUMN thumbnail_url TYPE TEXT");
            jdbc.execute("ALTER TABLE admin_users ALTER COLUMN thumbnail_url TYPE TEXT");
            jdbc.execute("ALTER TABLE instructors ALTER COLUMN portfolio_url TYPE TEXT");
            jdbc.execute("ALTER TABLE instructors ALTER COLUMN resume_url TYPE TEXT");
            jdbc.execute("ALTER TABLE assignments ALTER COLUMN file_url TYPE TEXT");
            jdbc.execute("ALTER TABLE assignment_submissions ALTER COLUMN submission_url TYPE TEXT");
            System.out.println("⚡ Altered URL columns to TEXT to support base64");
        } catch (Exception e) { System.out.println("⚡ Note (Alter URL columns): " + e.getMessage()); }
        
        try {
            jdbc.execute("DROP TABLE IF EXISTS student_badges");
            jdbc.execute("DROP TABLE IF EXISTS badges");
            System.out.println("⚡ Dropped badges tables from database");
        } catch (Exception e) { System.out.println("⚡ Note (Badges Drop): " + e.getMessage()); }

        try {
            jdbc.execute("ALTER TABLE assignments MODIFY course_id BIGINT NULL");
            System.out.println("⚡ Allowed NULLs on obsolete course_id in assignments table");
        } catch (Exception e) { System.out.println("⚡ Note: " + e.getMessage()); }
        
        try {
            jdbc.execute("ALTER TABLE courses MODIFY instructor_id BIGINT NULL");
            System.out.println("⚡ Allowed NULLs on instructor_id in courses table");
        } catch (Exception e) { System.out.println("⚡ Note: " + e.getMessage()); }
        Role adminRole      = seedRole("ADMIN");
        Role instructorRole = seedRole("INSTRUCTOR");
        Role studentRole    = seedRole("STUDENT");

        adminUserRepository.findByUsername("kingsly").ifPresentOrElse(admin -> {
            admin.setPassword(passwordEncoder.encode("pass@123"));
            if (admin.getRole() == null) admin.setRole(adminRole);
            adminUserRepository.save(admin);
            System.out.println("⚡ Admin user kingsly ALREADY EXISTS. Password force-reset to pass@123.");
        }, () -> {
            System.out.println("⚡ Admin user kingsly not found. Seeding now...");
            AdminUser admin = new AdminUser();
            admin.setUsername("kingsly");
            admin.setEmail("kingsly@learnsphere.com");
            admin.setPassword(passwordEncoder.encode("pass@123"));
            admin.setRole(adminRole);
            adminUserRepository.save(admin);
            System.out.println("⚡ Admin user kingsly successfully saved!");
        });


        System.out.println("=================================================");
        System.out.println("✅ SEEDING COMPLETE");
        System.out.println("=================================================");
    }
}
