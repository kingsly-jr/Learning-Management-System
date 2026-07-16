package com.lms.backend.service;

import com.lms.backend.dto.DiscussionReplyDTO;
import com.lms.backend.dto.DiscussionThreadDTO;

import java.util.List;

public interface DiscussionService {
    List<DiscussionThreadDTO> getThreadsForCourse(Long courseId);
    List<DiscussionThreadDTO> getThreadsForLesson(Long lessonId);
    DiscussionThreadDTO getThread(Long threadId);
    List<DiscussionReplyDTO> getRepliesForThread(Long threadId);
    
    DiscussionThreadDTO createThread(Long courseId, Long lessonId, String username, String title, String content);
    DiscussionReplyDTO createReply(Long threadId, String username, String content);
}
