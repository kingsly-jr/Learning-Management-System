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

    private Category seedCategory(String name, String description) {
        return categoryRepository.findByName(name)
                .orElseGet(() -> categoryRepository.save(new Category(name, description)));
    }

    private Instructor seedInstructor(String username, String email, String rawPassword, Role role) {
        return instructorRepository.findByUsername(username).orElseGet(() -> {
            Instructor u = new Instructor(username, passwordEncoder.encode(rawPassword), email, role);
            return instructorRepository.save(u);
        });
    }

    private Student seedStudent(String username, String email, String rawPassword, Role role) {
        return studentRepository.findByUsername(username).orElseGet(() -> {
            Student u = new Student(username, passwordEncoder.encode(rawPassword), email, role);
            return studentRepository.save(u);
        });
    }

    private void seedCourseItems(Course course) {
        // Seed 2 lessons if none exist
        if (lessonRepository.findByCourseIdOrderBySequenceOrderAsc(course.getId()).isEmpty()) {
            Lesson l1 = new Lesson();
            l1.setTitle("Introduction to " + course.getTitle());
            l1.setDescription("This lesson covers the fundamentals and overview of " + course.getTitle() + ".");
            l1.setVideoUrl("https://www.w3schools.com/html/mov_bbb.mp4"); // dummy video
            l1.setDuration(120); // 2 minutes
            l1.setSequenceOrder(1);
            l1.setCourse(course);
            lessonRepository.save(l1);

            Lesson l2 = new Lesson();
            l2.setTitle("Deep Dive into " + course.getTitle());
            l2.setDescription("An in-depth look at advanced features, performance optimization, and practical application of " + course.getTitle() + ".");
            l2.setVideoUrl("https://www.w3schools.com/html/movie.mp4"); // dummy video
            l2.setDuration(300); // 5 minutes
            l2.setSequenceOrder(2);
            l2.setCourse(course);
            lessonRepository.save(l2);
        }

        Lesson firstLesson = lessonRepository.findByCourseIdOrderBySequenceOrderAsc(course.getId()).stream().findFirst().orElse(null);
        if (firstLesson == null) return;

        // Seed 1 quiz if none exists
        if (quizRepository.findByLessonCourseId(course.getId()).isEmpty()) {
            Quiz quiz = new Quiz();
            quiz.setTitle(course.getTitle() + " Evaluation Quiz");
            quiz.setLesson(firstLesson);
            quiz = quizRepository.save(quiz);

            // Question 1
            Question q1 = new Question();
            q1.setQuiz(quiz);
            q1.setText("Which of the following best describes the core concept of " + course.getTitle() + "?");
            q1.setPoints(10);
            q1 = questionRepository.save(q1);

            optionRepository.save(new Option(q1, "It is a design pattern for microservices.", false));
            optionRepository.save(new Option(q1, "It represents a state-of-the-art approach in this domain.", true));
            optionRepository.save(new Option(q1, "It is an outdated feature that shouldn't be used.", false));
            optionRepository.save(new Option(q1, "None of the above.", false));

            // Question 2
            Question q2 = new Question();
            q2.setQuiz(quiz);
            q2.setText("True or False: " + course.getTitle() + " requires external plugins to run efficiently.");
            q2.setPoints(5);
            q2 = questionRepository.save(q2);

            optionRepository.save(new Option(q2, "True", false));
            optionRepository.save(new Option(q2, "False", true));
        }

        // Seed 1 assignment if none exists
        if (assignmentRepository.findByLessonCourseId(course.getId()).isEmpty()) {
            Assignment assignment = new Assignment();
            assignment.setTitle(course.getTitle() + " Practical Assignment");
            assignment.setObjective("Apply concepts learned in the course.");
            assignment.setInstructions("Complete the hands-on project for " + course.getTitle() + ". Submit your solution source files in a ZIP/PDF format. Make sure to cover the core concepts taught in lessons.");
            assignment.setSubmissionRequirements("A ZIP or PDF file containing your solution.");
            assignment.setEvaluationCriteria("Code correctness, readability, and completeness.");
            assignment.setExpectedLearningOutcome("Demonstrate mastery of " + course.getTitle() + " concepts.");
            assignment.setMaxScore(100);
            assignment.setDueDate(java.time.LocalDateTime.now().plusDays(7));
            assignment.setLesson(firstLesson);
            assignmentRepository.save(assignment);
        }
    }

    private void seedCourse(String title, String subtitle, String description,
                            double price, String thumb, Instructor instructor, Category category) {
        Course existing = courseRepository.findByInstructor(instructor)
                .stream().filter(c -> c.getTitle().equals(title)).findFirst().orElse(null);
        Course courseToSeedItems;
        if (existing != null) {
            if (existing.getPrice() < 200) {
                existing.setPrice(price);
                existing = courseRepository.save(existing);
            }
            courseToSeedItems = existing;
        } else {
            Course c = new Course();
            c.setTitle(title);       c.setSubtitle(subtitle);
            c.setDescription(description);
            c.setPrice(price);       c.setThumbnailUrl(thumb);
            c.setPublished(true);    c.setInstructor(instructor);
            c.setCategory(category);
            courseToSeedItems = courseRepository.save(c);
        }
        seedCourseItems(courseToSeedItems);
    }

    @Override
    public void run(String... args) {
        System.out.println("=================================================");
        System.out.println("⚡ AppDatabaseInitializer starting...");

        // Safely alter obsolete columns to allow NULLs (bypassing foreign key drop errors)
        try {
            jdbc.execute("ALTER TABLE quizzes MODIFY course_id BIGINT NULL");
            System.out.println("⚡ Allowed NULLs on obsolete course_id in quizzes table");
        } catch (Exception e) { System.out.println("⚡ Note: " + e.getMessage()); }

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

        Category java   = seedCategory("Java", "Core to advanced Java programming");
        Category spring = seedCategory("Spring Boot", "Build production-ready REST APIs");
        Category js     = seedCategory("JavaScript", "Modern JavaScript and async");
        Category react  = seedCategory("React", "Build dynamic UIs with React");
        Category sql    = seedCategory("SQL", "Relational databases and queries");
        Category python = seedCategory("Python", "Python for scripting and data");
        Category ai     = seedCategory("Artificial Intelligence", "ML and Deep learning");
        Category cloud  = seedCategory("Cloud Computing", "AWS, Azure, GCP");
        Category devops = seedCategory("DevOps", "CI/CD, Docker, Kubernetes");
        Category ds     = seedCategory("Data Structures", "Algorithms and complexity");
        Category cyber  = seedCategory("Cyber Security", "Ethical hacking");
        Category uiux   = seedCategory("UI/UX", "User interface design and Figma");

        // --- DEMO DATA SEEDING ENABLED ---
        Instructor jose  = seedInstructor("jose", "jose@learnsphere.com", "pass@123", instructorRole);
        Instructor maria = seedInstructor("maria", "maria@learnsphere.com", "pass@123", instructorRole);
        Student mohan    = seedStudent("mohan", "mohan@learnsphere.com", "pass@123", studentRole);

        seedCourse("Mastering Java 21", "Comprehensive guide to modern Java", 
                   "Learn Java 21 from scratch...", 199.99, 
                   "https://images.unsplash.com/photo-1517694712202-14dd9538aa97", jose, java);
        
        seedCourse("Spring Boot Microservices", "Build scalable APIs", 
                   "Deep dive into Spring Boot...", 249.99, 
                   "https://images.unsplash.com/photo-1555066931-4365d14bab8c", jose, spring);

        seedCourse("React Frontend Development", "Modern web apps with React", 
                   "Master React hooks, components...", 149.99, 
                   "https://images.unsplash.com/photo-1633356122544-f134324a6cee", maria, react);

        System.out.println("=================================================");
        System.out.println("✅ SEEDING COMPLETE");
        System.out.println("=================================================");
    }
}
