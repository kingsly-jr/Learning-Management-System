package com.lms.backend.repository;

import com.lms.backend.entity.DiscussionThread;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiscussionThreadRepository extends JpaRepository<DiscussionThread, Long> {
    List<DiscussionThread> findByCourseIdOrderByUpdatedAtDesc(Long courseId);
    List<DiscussionThread> findByLessonIdOrderByUpdatedAtDesc(Long lessonId);
    
    // For instructor dashboard: find threads in courses where this instructor teaches
    List<DiscussionThread> findByCourseInstructorId(Long instructorId);

    @org.springframework.transaction.annotation.Transactional
    void deleteByLessonId(Long lessonId);

    @org.springframework.transaction.annotation.Transactional
    void deleteByCourseId(Long courseId);
}
