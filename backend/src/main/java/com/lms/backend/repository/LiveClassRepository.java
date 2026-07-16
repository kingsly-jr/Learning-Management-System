package com.lms.backend.repository;

import com.lms.backend.entity.LiveClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LiveClassRepository extends JpaRepository<LiveClass, Long> {
    List<LiveClass> findByCourseIdInOrderByScheduledAtAsc(List<Long> courseIds);
    List<LiveClass> findByCourseIdOrderByScheduledAtAsc(Long courseId);
}
