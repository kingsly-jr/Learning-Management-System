package com.lms.backend.service.impl;

import com.lms.backend.dto.CategoryDTO;
import com.lms.backend.dto.CourseDTO;
import com.lms.backend.entity.*;
import com.lms.backend.repository.*;
import com.lms.backend.service.CourseService;
import com.lms.backend.service.FileStorageService;
import com.lms.backend.service.AdminActivityLogService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.lms.backend.dto.EnrollmentDTO;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;

@Service
@Transactional
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final CategoryRepository categoryRepository;
    private final InstructorRepository instructorRepository;
    private final StudentRepository studentRepository;
    private final AdminUserRepository adminUserRepository;
    private final FileStorageService fileStorageService;
    private final EnrollmentRepository enrollmentRepository;
    private final NotificationRepository notificationRepository;
    private final AdminActivityLogService adminActivityLogService;

    @PersistenceContext
    private EntityManager entityManager;

    public CourseServiceImpl(CourseRepository courseRepository,
                             CategoryRepository categoryRepository,
                             InstructorRepository instructorRepository,
                             StudentRepository studentRepository,
                             AdminUserRepository adminUserRepository,
                             FileStorageService fileStorageService,
                             EnrollmentRepository enrollmentRepository,
                             NotificationRepository notificationRepository,
                             AdminActivityLogService adminActivityLogService) {
        this.courseRepository = courseRepository;
        this.categoryRepository = categoryRepository;
        this.instructorRepository = instructorRepository;
        this.studentRepository = studentRepository;
        this.adminUserRepository = adminUserRepository;
        this.fileStorageService = fileStorageService;
        this.enrollmentRepository = enrollmentRepository;
        this.notificationRepository = notificationRepository;
        this.adminActivityLogService = adminActivityLogService;
    }

    private boolean isAdmin(String username) {
        return adminUserRepository.findByUsername(username).isPresent();
    }

    private Instructor requireInstructor(String username) {
        return instructorRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Instructor not found: " + username));
    }
    
    private void requireInstructorOrAdmin(Course course, String username) {
        if (!isAdmin(username)) {
            if (course.getInstructor() == null || !course.getInstructor().getUsername().equals(username)) {
                throw new AccessDeniedException("You do not have permission to modify this course");
            }
        }
    }

    @Override
    public CategoryDTO createCategory(CategoryDTO categoryDTO) {
        if (categoryRepository.existsByName(categoryDTO.getName())) {
            throw new IllegalArgumentException("Category with name '" + categoryDTO.getName() + "' already exists");
        }
        Category category = new Category(categoryDTO.getName(), categoryDTO.getDescription());
        categoryRepository.save(category);
        adminActivityLogService.log("CATEGORY_CREATED",
            "New category '" + category.getName() + "' created",
            "admin", "CATEGORY", category.getId());
        return new CategoryDTO(category);
    }

    @Override
    public CategoryDTO updateCategory(Long id, CategoryDTO categoryDTO) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        if (!category.getName().equalsIgnoreCase(categoryDTO.getName())
                && categoryRepository.existsByName(categoryDTO.getName())) {
            throw new IllegalArgumentException("Category with name '" + categoryDTO.getName() + "' already exists");
        }

        category.setName(categoryDTO.getName());
        category.setDescription(categoryDTO.getDescription());
        category.setThumbnailUrl(categoryDTO.getThumbnailUrl());
        categoryRepository.save(category);
        return new CategoryDTO(category);
    }

    @Override
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        if (courseRepository.countByCategoryId(id) > 0) {
            throw new IllegalArgumentException("Cannot delete category containing active courses");
        }

        categoryRepository.delete(category);
        adminActivityLogService.log("CATEGORY_DELETED",
            "Category '" + category.getName() + "' deleted",
            "admin", "CATEGORY", id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(CategoryDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    public CourseDTO createCourse(CourseDTO courseDTO, String username) {
        Instructor instructor;
        if (isAdmin(username)) {
            if (courseDTO.getInstructorId() == null) {
                throw new IllegalArgumentException("Admin must specify an instructor ID");
            }
            instructor = instructorRepository.findById(courseDTO.getInstructorId())
                    .orElseThrow(() -> new IllegalArgumentException("Instructor not found"));
        } else {
            instructor = requireInstructor(username);
        }

        Category category = categoryRepository.findById(courseDTO.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        Course course = new Course();
        course.setTitle(courseDTO.getTitle());
        course.setSubtitle(courseDTO.getSubtitle());
        course.setDescription(courseDTO.getDescription());
        course.setPrice(courseDTO.getPrice());
        course.setThumbnailUrl(courseDTO.getThumbnailUrl());
        
        if ("DRAFT".equals(courseDTO.getReviewStatus())) {
            course.setPublished(false);
            course.setReviewStatus("DRAFT");
        } else if (isAdmin(username)) {
            course.setPublished(true);
            course.setReviewStatus("APPROVED");
        } else {
            course.setPublished(false);
            course.setReviewStatus("PENDING");
        }
        
        course.setInstructor(instructor);
        course.setCategory(category);

        courseRepository.save(course);
        adminActivityLogService.log(
            "DRAFT".equals(course.getReviewStatus()) ? "COURSE_DRAFTED" : "COURSE_CREATED",
            username + " created course '" + course.getTitle() + "'",
            username, "COURSE", course.getId());
        return new CourseDTO(course);
    }

    @Override
    public CourseDTO updateCourse(Long courseId, CourseDTO courseDTO, String username) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        requireInstructorOrAdmin(course, username);

        Category category = categoryRepository.findById(courseDTO.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        course.setTitle(courseDTO.getTitle());
        course.setSubtitle(courseDTO.getSubtitle());
        course.setDescription(courseDTO.getDescription());
        course.setPrice(courseDTO.getPrice());
        course.setThumbnailUrl(courseDTO.getThumbnailUrl());
        course.setCategory(category);

        if (isAdmin(username) && courseDTO.getInstructorId() != null) {
            Instructor newInstructor = instructorRepository.findById(courseDTO.getInstructorId())
                    .orElseThrow(() -> new IllegalArgumentException("Instructor not found"));
            course.setInstructor(newInstructor);
        }

        if (isAdmin(username) && courseDTO.getReviewStatus() != null) {
            course.setReviewStatus(courseDTO.getReviewStatus());
            if ("APPROVED".equals(courseDTO.getReviewStatus())) {
                course.setPublished(true);
            } else if ("DRAFT".equals(courseDTO.getReviewStatus()) || "REJECTED".equals(courseDTO.getReviewStatus())) {
                course.setPublished(false);
            }
        }

        courseRepository.save(course);
        return new CourseDTO(course);
    }

    @Override
    public void deleteCourse(Long courseId, String username) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        requireInstructorOrAdmin(course, username);

        // Delete Quiz Data
        entityManager.createNativeQuery("DELETE FROM quiz_attempts WHERE quiz_id IN (SELECT id FROM quizzes WHERE lesson_id IN (SELECT id FROM lessons WHERE course_id = ?1))").setParameter(1, courseId).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM options WHERE question_id IN (SELECT id FROM questions WHERE quiz_id IN (SELECT id FROM quizzes WHERE lesson_id IN (SELECT id FROM lessons WHERE course_id = ?1)))").setParameter(1, courseId).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM questions WHERE quiz_id IN (SELECT id FROM quizzes WHERE lesson_id IN (SELECT id FROM lessons WHERE course_id = ?1))").setParameter(1, courseId).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM quizzes WHERE lesson_id IN (SELECT id FROM lessons WHERE course_id = ?1)").setParameter(1, courseId).executeUpdate();

        // Delete Assignment Data
        entityManager.createNativeQuery("DELETE FROM assignment_submissions WHERE assignment_id IN (SELECT id FROM assignments WHERE lesson_id IN (SELECT id FROM lessons WHERE course_id = ?1))").setParameter(1, courseId).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM assignments WHERE lesson_id IN (SELECT id FROM lessons WHERE course_id = ?1)").setParameter(1, courseId).executeUpdate();

        // Delete other course references
        entityManager.createNativeQuery("DELETE FROM certificates WHERE course_id = ?1").setParameter(1, courseId).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM enrollments WHERE course_id = ?1").setParameter(1, courseId).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM lessons WHERE course_id = ?1").setParameter(1, courseId).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM courses WHERE id = ?1").setParameter(1, courseId).executeUpdate();
        adminActivityLogService.log("COURSE_DELETED",
            username + " deleted course '" + course.getTitle() + "'",
            username, "COURSE", courseId);
    }

    @Override
    public CourseDTO publishCourse(Long courseId, String username) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        requireInstructorOrAdmin(course, username);

        course.setPublished(true);
        courseRepository.save(course);
        return new CourseDTO(course);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseDTO> getCoursesForUser(String username, String search) {
        if (isAdmin(username)) {
            return courseRepository.findAll().stream()
                    .map(CourseDTO::new)
                    .collect(Collectors.toList());
        }

        Optional<Instructor> instOpt = instructorRepository.findByUsername(username);
        if (instOpt.isPresent()) {
            return courseRepository.findByInstructor(instOpt.get()).stream()
                    .map(CourseDTO::new)
                    .collect(Collectors.toList());
        }

        if (search != null && !search.trim().isEmpty()) {
            return courseRepository.findByTitleContainingIgnoreCaseAndPublishedTrue(search.trim()).stream()
                    .map(CourseDTO::new)
                    .collect(Collectors.toList());
        } else {
            return courseRepository.findByPublished(true).stream()
                    .map(CourseDTO::new)
                    .collect(Collectors.toList());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public CourseDTO getCourseById(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        return new CourseDTO(course);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseDTO> getCoursesByCategory(Long categoryId) {
        return courseRepository.findByCategoryIdAndPublished(categoryId, true).stream()
                .map(CourseDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseDTO> getPublicCourses(String search) {
        if (search != null && !search.trim().isEmpty()) {
            return courseRepository.findByTitleContainingIgnoreCaseAndPublishedTrue(search.trim()).stream()
                    .map(CourseDTO::new)
                    .collect(Collectors.toList());
        } else {
            return courseRepository.findByPublished(true).stream()
                    .map(CourseDTO::new)
                    .collect(Collectors.toList());
        }
    }

    @Override
    public CourseDTO uploadThumbnail(Long courseId, MultipartFile file, String username) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        requireInstructorOrAdmin(course, username);

        String fileUrl = fileStorageService.storeFile(file);
        course.setThumbnailUrl(fileUrl);
        courseRepository.save(course);
        return new CourseDTO(course);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EnrollmentDTO> getEnrollmentsForInstructor(String instructorUsername) {
        return enrollmentRepository.findByCourseInstructorUsername(instructorUsername).stream()
                .filter(e -> e.getStudent() != null)
                .map(EnrollmentDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    public CourseDTO submitCourseForReview(Long courseId, String instructorUsername) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        if (course.getInstructor() == null || !course.getInstructor().getUsername().equals(instructorUsername)) {
            throw new org.springframework.security.access.AccessDeniedException("Only the course instructor can submit for review");
        }
        course.setReviewStatus("PENDING");
        courseRepository.save(course);

        // Notify all admins
        for (AdminUser admin : adminUserRepository.findAll()) {
            Notification notif = new Notification(
                "Instructor " + instructorUsername + " submitted course '" + course.getTitle() + "' for review.",
                admin.getUsername(),
                instructorUsername,
                course.getId(),
                "COURSE_SUBMITTED"
            );
            notificationRepository.save(notif);
        }

        return new CourseDTO(course);
    }

    @Override
    public CourseDTO approveCourse(Long courseId, String adminUsername) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        course.setReviewStatus("APPROVED");
        course.setPublished(true);
        courseRepository.save(course);

        // Notify instructor
        Notification notif = new Notification(
            "Your course '" + course.getTitle() + "' has been approved by the Admin.",
            course.getInstructor() != null ? course.getInstructor().getUsername() : "Unassigned",
            adminUsername,
            course.getId(),
            "COURSE_APPROVED"
        );
        notificationRepository.save(notif);

        adminActivityLogService.log("COURSE_APPROVED",
            adminUsername + " approved course '" + course.getTitle() + "'",
            adminUsername, "COURSE", course.getId());

        return new CourseDTO(course);
    }

    @Override
    public CourseDTO rejectCourse(Long courseId, String adminUsername) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        course.setReviewStatus("REJECTED");
        course.setPublished(false);
        courseRepository.save(course);

        // Notify instructor
        Notification notif = new Notification(
            "Your course '" + course.getTitle() + "' has been rejected by the Admin.",
            course.getInstructor() != null ? course.getInstructor().getUsername() : "Unassigned",
            adminUsername,
            course.getId(),
            "COURSE_REJECTED"
        );
        notificationRepository.save(notif);

        adminActivityLogService.log("COURSE_REJECTED",
            adminUsername + " rejected course '" + course.getTitle() + "'",
            adminUsername, "COURSE", course.getId());

        return new CourseDTO(course);
    }

    @Override
    public List<CourseDTO> getCoursesByInstructorIdForAdmin(Long instructorId) {
        Instructor instructor = instructorRepository.findById(instructorId)
                .orElseThrow(() -> new RuntimeException("Instructor not found"));
        return courseRepository.findByInstructor(instructor).stream()
                .map(CourseDTO::new)
                .collect(Collectors.toList());
    }
}
