package com.lms.backend.repository;

import com.lms.backend.entity.DiscussionReply;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiscussionReplyRepository extends JpaRepository<DiscussionReply, Long> {
    List<DiscussionReply> findByThreadIdOrderByCreatedAtAsc(Long threadId);
    int countByThreadId(Long threadId);
    
    @org.springframework.transaction.annotation.Transactional
    void deleteByThreadId(Long threadId);
}
