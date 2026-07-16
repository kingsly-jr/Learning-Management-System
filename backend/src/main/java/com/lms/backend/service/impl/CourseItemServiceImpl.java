package com.lms.backend.service.impl;

import com.lms.backend.dto.*;
import com.lms.backend.entity.*;
import com.lms.backend.repository.*;
import com.lms.backend.service.CourseItemService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CourseItemServiceImpl implements CourseItemService {

    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final OptionRepository optionRepository;
    private final AssignmentRepository assignmentRepository;
    private final AdminUserRepository adminUserRepository;
    private final DiscussionThreadRepository discussionThreadRepository;
    private final DiscussionReplyRepository discussionReplyRepository;

    public CourseItemServiceImpl(CourseRepository courseRepository,
                                 LessonRepository lessonRepository,
                                 QuizRepository quizRepository,
                                 QuestionRepository questionRepository,
                                 OptionRepository optionRepository,
                                 AssignmentRepository assignmentRepository,
                                 AdminUserRepository adminUserRepository,
                                 DiscussionThreadRepository discussionThreadRepository,
                                 DiscussionReplyRepository discussionReplyRepository) {
        this.courseRepository = courseRepository;
        this.lessonRepository = lessonRepository;
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
        this.optionRepository = optionRepository;
        this.assignmentRepository = assignmentRepository;
        this.adminUserRepository = adminUserRepository;
        this.discussionThreadRepository = discussionThreadRepository;
        this.discussionReplyRepository = discussionReplyRepository;
    }

    private void verifyOwnership(Course course, String username) {
        boolean isAdmin = adminUserRepository.findByUsername(username).isPresent();
        if (!isAdmin && !course.getInstructor().getUsername().equals(username)) {
            throw new AccessDeniedException("You do not have permission to modify this course content");
        }
    }

    // Lessons
    @Override
    @Transactional(readOnly = true)
    public List<LessonDTO> getLessonsByCourse(Long courseId) {
        return lessonRepository.findByCourseIdOrderBySequenceOrderAsc(courseId).stream()
                .map(LessonDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    public LessonDTO createLesson(Long courseId, LessonDTO lessonDTO, String username) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        verifyOwnership(course, username);

        Lesson lesson = new Lesson();
        lesson.setTitle(lessonDTO.getTitle());
        lesson.setDescription(lessonDTO.getDescription());
        lesson.setVideoUrl(lessonDTO.getVideoUrl());
        lesson.setDuration(lessonDTO.getDuration() != null ? lessonDTO.getDuration() : 0);
        lesson.setSequenceOrder(lessonDTO.getSequenceOrder() != null ? lessonDTO.getSequenceOrder() : 0);
        lesson.setCourse(course);

        lessonRepository.save(lesson);
        return new LessonDTO(lesson);
    }

    @Override
    public LessonDTO updateLesson(Long courseId, Long lessonId, LessonDTO lessonDTO, String username) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        verifyOwnership(course, username);

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new IllegalArgumentException("Lesson not found"));
        
        if (!lesson.getCourse().getId().equals(courseId)) {
            throw new IllegalArgumentException("Lesson does not belong to this course");
        }

        lesson.setTitle(lessonDTO.getTitle());
        lesson.setDescription(lessonDTO.getDescription());
        lesson.setVideoUrl(lessonDTO.getVideoUrl());
        lesson.setDuration(lessonDTO.getDuration() != null ? lessonDTO.getDuration() : 0);
        lesson.setSequenceOrder(lessonDTO.getSequenceOrder() != null ? lessonDTO.getSequenceOrder() : 0);

        lessonRepository.save(lesson);
        return new LessonDTO(lesson);
    }

    @Override
    public void deleteLesson(Long courseId, Long lessonId, String username) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        verifyOwnership(course, username);

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new IllegalArgumentException("Lesson not found"));

        if (!lesson.getCourse().getId().equals(courseId)) {
            throw new IllegalArgumentException("Lesson does not belong to this course");
        }

        List<DiscussionThread> threads = discussionThreadRepository.findByLessonIdOrderByUpdatedAtDesc(lessonId);
        for (DiscussionThread thread : threads) {
            discussionReplyRepository.deleteByThreadId(thread.getId());
        }
        discussionThreadRepository.deleteByLessonId(lessonId);
        lessonRepository.delete(lesson);
    }

    // Quizzes
    @Override
    @Transactional(readOnly = true)
    public List<QuizDTO> getQuizzesByCourse(Long courseId) {
        List<Quiz> quizzes = quizRepository.findByLessonCourseId(courseId);
        List<QuizDTO> quizDTOs = new ArrayList<>();
        
        for (Quiz quiz : quizzes) {
            List<Question> questions = questionRepository.findByQuizId(quiz.getId());
            List<QuestionDTO> questionDTOs = new ArrayList<>();
            for (Question q : questions) {
                List<OptionDTO> optionDTOs = optionRepository.findByQuestionId(q.getId()).stream()
                        .map(OptionDTO::new)
                        .collect(Collectors.toList());
                questionDTOs.add(new QuestionDTO(q, optionDTOs));
            }
            quizDTOs.add(new QuizDTO(quiz, questionDTOs));
        }

        return quizDTOs;
    }

    @Override
    public QuizDTO createOrUpdateQuiz(Long courseId, QuizDTO quizDTO, String username) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        verifyOwnership(course, username);

        Lesson lesson = lessonRepository.findById(quizDTO.getLessonId())
                .orElseThrow(() -> new IllegalArgumentException("Lesson not found"));

        if (!lesson.getCourse().getId().equals(courseId)) {
            throw new IllegalArgumentException("Lesson does not belong to this course");
        }

        Quiz quiz;
        if (quizDTO.getId() != null) {
            quiz = quizRepository.findById(quizDTO.getId()).orElse(null);
        } else {
            // Find existing quiz for this lesson to overwrite (if we want 1 quiz per lesson, or just allow multiple)
            // Let's assume one quiz per lesson for simplicity, or if id is passed we update.
            List<Quiz> existingQuizzes = quizRepository.findByLessonId(lesson.getId());
            quiz = existingQuizzes.isEmpty() ? null : existingQuizzes.get(0);
        }

        if (quiz != null) {
            List<Question> oldQuestions = questionRepository.findByQuizId(quiz.getId());
            for (Question q : oldQuestions) {
                List<Option> options = optionRepository.findByQuestionId(q.getId());
                optionRepository.deleteAll(options);
            }
            questionRepository.deleteAll(oldQuestions);
            quiz.setTitle(quizDTO.getTitle());
        } else {
            quiz = new Quiz();
            quiz.setTitle(quizDTO.getTitle());
            quiz.setLesson(lesson);
        }
        quizRepository.save(quiz);

        List<QuestionDTO> savedQuestionDTOs = new ArrayList<>();
        if (quizDTO.getQuestions() != null) {
            for (QuestionDTO qDto : quizDTO.getQuestions()) {
                Question question = new Question();
                question.setText(qDto.getText());
                question.setPoints(qDto.getPoints() != null ? qDto.getPoints() : 1);
                question.setQuiz(quiz);
                questionRepository.save(question);

                List<OptionDTO> savedOptionDTOs = new ArrayList<>();
                if (qDto.getOptions() != null) {
                    for (OptionDTO oDto : qDto.getOptions()) {
                        Option option = new Option();
                        option.setText(oDto.getText());
                        option.setCorrect(oDto.getCorrect() != null ? oDto.getCorrect() : false);
                        option.setQuestion(question);
                        optionRepository.save(option);
                        savedOptionDTOs.add(new OptionDTO(option));
                    }
                }
                savedQuestionDTOs.add(new QuestionDTO(question, savedOptionDTOs));
            }
        }

        return new QuizDTO(quiz, savedQuestionDTOs);
    }

    // Assignments
    @Override
    @Transactional(readOnly = true)
    public List<AssignmentDTO> getAssignmentsByCourse(Long courseId) {
        return assignmentRepository.findByLessonCourseId(courseId).stream()
                .map(AssignmentDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    public AssignmentDTO createAssignment(Long courseId, AssignmentDTO assignmentDTO, String username) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        verifyOwnership(course, username);

        Lesson lesson = lessonRepository.findById(assignmentDTO.getLessonId())
                .orElseThrow(() -> new IllegalArgumentException("Lesson not found"));

        if (!lesson.getCourse().getId().equals(courseId)) {
            throw new IllegalArgumentException("Lesson does not belong to this course");
        }

        Assignment assignment = new Assignment();
        if (assignmentDTO.getId() != null) {
            assignment = assignmentRepository.findById(assignmentDTO.getId()).orElse(new Assignment());
        }

        assignment.setTitle(assignmentDTO.getTitle());
        assignment.setInstructions(assignmentDTO.getInstructions());
        assignment.setObjective(assignmentDTO.getObjective());
        assignment.setSubmissionRequirements(assignmentDTO.getSubmissionRequirements());
        assignment.setEvaluationCriteria(assignmentDTO.getEvaluationCriteria());
        assignment.setExpectedLearningOutcome(assignmentDTO.getExpectedLearningOutcome());
        assignment.setMaxScore(assignmentDTO.getMaxScore());
        assignment.setFileUrl(assignmentDTO.getFileUrl());
        assignment.setDueDate(assignmentDTO.getDueDate());
        assignment.setLesson(lesson);

        assignmentRepository.save(assignment);
        return new AssignmentDTO(assignment);
    }

    @Override
    public AssignmentDTO updateAssignment(Long courseId, Long assignmentId, AssignmentDTO assignmentDTO, String username) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        verifyOwnership(course, username);

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new IllegalArgumentException("Assignment not found"));

        if (!assignment.getLesson().getCourse().getId().equals(courseId)) {
            throw new IllegalArgumentException("Assignment does not belong to this course");
        }

        assignment.setTitle(assignmentDTO.getTitle());
        assignment.setInstructions(assignmentDTO.getInstructions());
        assignment.setObjective(assignmentDTO.getObjective());
        assignment.setSubmissionRequirements(assignmentDTO.getSubmissionRequirements());
        assignment.setEvaluationCriteria(assignmentDTO.getEvaluationCriteria());
        assignment.setExpectedLearningOutcome(assignmentDTO.getExpectedLearningOutcome());
        assignment.setMaxScore(assignmentDTO.getMaxScore());
        assignment.setFileUrl(assignmentDTO.getFileUrl());
        assignment.setDueDate(assignmentDTO.getDueDate());

        assignmentRepository.save(assignment);
        return new AssignmentDTO(assignment);
    }

    @Override
    public void deleteAssignment(Long courseId, Long assignmentId, String username) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        verifyOwnership(course, username);

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new IllegalArgumentException("Assignment not found"));

        if (!assignment.getLesson().getCourse().getId().equals(courseId)) {
            throw new IllegalArgumentException("Assignment does not belong to this course");
        }

        assignmentRepository.delete(assignment);
    }
}
