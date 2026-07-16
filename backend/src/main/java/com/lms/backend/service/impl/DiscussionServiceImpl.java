package com.lms.backend.service.impl;

import com.lms.backend.dto.DiscussionReplyDTO;
import com.lms.backend.dto.DiscussionThreadDTO;
import com.lms.backend.entity.*;
import com.lms.backend.repository.*;
import com.lms.backend.service.DiscussionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DiscussionServiceImpl implements DiscussionService {

    private final DiscussionThreadRepository threadRepository;
    private final DiscussionReplyRepository replyRepository;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final StudentRepository studentRepository;
    private final InstructorRepository instructorRepository;
    private final AdminUserRepository adminUserRepository;

    public DiscussionServiceImpl(DiscussionThreadRepository threadRepository,
                                 DiscussionReplyRepository replyRepository,
                                 CourseRepository courseRepository,
                                 LessonRepository lessonRepository,
                                 StudentRepository studentRepository,
                                 InstructorRepository instructorRepository,
                                 AdminUserRepository adminUserRepository) {
        this.threadRepository = threadRepository;
        this.replyRepository = replyRepository;
        this.courseRepository = courseRepository;
        this.lessonRepository = lessonRepository;
        this.studentRepository = studentRepository;
        this.instructorRepository = instructorRepository;
        this.adminUserRepository = adminUserRepository;
    }

    private BaseUser findUser(String username) {
        return studentRepository.findByUsername(username)
                .map(s -> (BaseUser) s)
                .orElseGet(() -> instructorRepository.findByUsername(username)
                        .map(i -> (BaseUser) i)
                        .orElseGet(() -> adminUserRepository.findByUsername(username)
                                .map(a -> (BaseUser) a)
                                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username))));
    }

    private DiscussionThreadDTO mapToDto(DiscussionThread thread) {
        int replyCount = replyRepository.countByThreadId(thread.getId());
        BaseUser author = null;
        try {
            author = findUser(thread.getAuthorUsername());
        } catch (Exception e) {}
        return new DiscussionThreadDTO(thread, replyCount, author);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DiscussionThreadDTO> getThreadsForCourse(Long courseId) {
        return threadRepository.findByCourseIdOrderByUpdatedAtDesc(courseId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DiscussionThreadDTO> getThreadsForLesson(Long lessonId) {
        return threadRepository.findByLessonIdOrderByUpdatedAtDesc(lessonId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public DiscussionThreadDTO getThread(Long threadId) {
        DiscussionThread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new IllegalArgumentException("Thread not found"));
        return mapToDto(thread);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DiscussionReplyDTO> getRepliesForThread(Long threadId) {
        return replyRepository.findByThreadIdOrderByCreatedAtAsc(threadId).stream()
                .map(reply -> {
                    BaseUser author = null;
                    try {
                        author = findUser(reply.getAuthorUsername());
                    } catch (Exception e) {}
                    return new DiscussionReplyDTO(reply, author);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public DiscussionThreadDTO createThread(Long courseId, Long lessonId, String username, String title, String content) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        BaseUser author = findUser(username);
        
        Lesson lesson = null;
        if (lessonId != null) {
            lesson = lessonRepository.findById(lessonId).orElse(null);
        }

        DiscussionThread thread = new DiscussionThread();
        thread.setCourse(course);
        thread.setLesson(lesson);
        thread.setAuthorUsername(author.getUsername());
        thread.setTitle(title);
        thread.setContent(content);

        thread = threadRepository.save(thread);
        return mapToDto(thread);
    }

    @Override
    @Transactional
    public DiscussionReplyDTO createReply(Long threadId, String username, String content) {
        DiscussionThread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new IllegalArgumentException("Thread not found"));
        BaseUser author = findUser(username);

        DiscussionReply reply = new DiscussionReply();
        reply.setThread(thread);
        reply.setAuthorUsername(author.getUsername());
        reply.setContent(content);

        // Check if author is the instructor of the course
        boolean isInstructor = false;
        if (author instanceof Instructor) {
            if (thread.getCourse().getInstructor() != null && 
                thread.getCourse().getInstructor().getId().equals(author.getId())) {
                isInstructor = true;
            }
        } else if (author instanceof AdminUser) {
            isInstructor = true; // Admin replies always get highlighted
        }
        reply.setIsInstructorResponse(isInstructor);

        reply = replyRepository.save(reply);
        
        // Update thread updated at time
        thread.setUpdatedAt(LocalDateTime.now());
        threadRepository.save(thread);

        return new DiscussionReplyDTO(reply, author);
    }
}
