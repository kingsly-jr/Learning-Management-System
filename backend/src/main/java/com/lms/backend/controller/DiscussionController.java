package com.lms.backend.controller;

import com.lms.backend.dto.DiscussionReplyDTO;
import com.lms.backend.dto.DiscussionThreadDTO;
import com.lms.backend.service.DiscussionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/discussions")
public class DiscussionController {

    private final DiscussionService discussionService;

    public DiscussionController(DiscussionService discussionService) {
        this.discussionService = discussionService;
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<DiscussionThreadDTO>> getThreadsForCourse(
            @PathVariable Long courseId,
            @RequestParam(required = false) Long lessonId) {
        if (lessonId != null) {
            return ResponseEntity.ok(discussionService.getThreadsForLesson(lessonId));
        }
        return ResponseEntity.ok(discussionService.getThreadsForCourse(courseId));
    }

    @GetMapping("/{threadId}")
    public ResponseEntity<DiscussionThreadDTO> getThread(@PathVariable Long threadId) {
        return ResponseEntity.ok(discussionService.getThread(threadId));
    }

    @GetMapping("/{threadId}/replies")
    public ResponseEntity<List<DiscussionReplyDTO>> getReplies(@PathVariable Long threadId) {
        return ResponseEntity.ok(discussionService.getRepliesForThread(threadId));
    }

    @PostMapping("/course/{courseId}")
    public ResponseEntity<DiscussionThreadDTO> createThread(
            @PathVariable Long courseId,
            @RequestBody Map<String, Object> payload,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Long lessonId = payload.get("lessonId") != null ? Long.valueOf(payload.get("lessonId").toString()) : null;
        String title = (String) payload.get("title");
        String content = (String) payload.get("content");
        
        DiscussionThreadDTO thread = discussionService.createThread(
                courseId, lessonId, userDetails.getUsername(), title, content);
        return ResponseEntity.ok(thread);
    }

    @PostMapping("/{threadId}/replies")
    public ResponseEntity<DiscussionReplyDTO> createReply(
            @PathVariable Long threadId,
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        String content = payload.get("content");
        DiscussionReplyDTO reply = discussionService.createReply(
                threadId, userDetails.getUsername(), content);
        return ResponseEntity.ok(reply);
    }
}
