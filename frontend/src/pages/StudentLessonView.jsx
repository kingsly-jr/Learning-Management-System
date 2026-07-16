import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api.js';
import DiscussionBoard from '../components/DiscussionBoard.jsx';

export default function StudentLessonView({ courseId, lessonId, user, navigate, addToast }) {
  const [course, setCourse] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [quizSubmissions, setQuizSubmissions] = useState([]);
  const [assignmentSubmissions, setAssignmentSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active quiz/assignment views
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState({});

  // YouTube API loader
  const [ytApiLoaded, setYtApiLoaded] = useState(false);
  
  // Video tracking
  const [isVideoUnlocked, setIsVideoUnlocked] = useState(false);
  
  useEffect(() => {
    if (lesson) {
      const hasQuizAttempt = quizzes.some(q => quizSubmissions.some(s => s.quizId === q.id));
      const hasAssignmentAttempt = assignments.some(a => assignmentSubmissions.some(s => s.assignmentId === a.id));
      
      if (!lesson.videoUrl || enrollment?.completedLessonIds?.includes(lesson.id) || hasQuizAttempt || hasAssignmentAttempt) {
        setIsVideoUnlocked(true);
      } else {
        setIsVideoUnlocked(false);
      }
    }
  }, [lesson, enrollment, quizzes, assignments, quizSubmissions, assignmentSubmissions]);
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      window.onYouTubeIframeAPIReady = () => {
        setYtApiLoaded(true);
      };
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } else {
      setYtApiLoaded(true);
    }
  }, []);

  const loadData = async () => {
    if (!courseId || !lessonId) return;
    setLoading(true);
    try {
      const courseData = await apiFetch(`/courses/${courseId}`);
      setCourse(courseData);

      const [lessonsList, quizzesList, assignmentsList] = await Promise.all([
        apiFetch(`/courses/${courseId}/lessons`),
        apiFetch(`/courses/${courseId}/quizzes`),
        apiFetch(`/courses/${courseId}/assignments`)
      ]);
      
      const foundLesson = lessonsList?.find(l => l.id === parseInt(lessonId));
      if (!foundLesson) {
        throw new Error('Lesson not found');
      }
      setLesson(foundLesson);
      
      setQuizzes(quizzesList?.filter(q => q.lessonId === parseInt(lessonId)) || []);
      setAssignments(assignmentsList?.filter(a => a.lessonId === parseInt(lessonId)) || []);

      // Fetch enrollment with completedLessonIds
      let activeEnroll = null;
      try {
        activeEnroll = await apiFetch(`/student/enrollments/course/${courseId}`);
      } catch (e) {
        // Student may not be enrolled — that's okay
      }
      setEnrollment(activeEnroll);

      if (activeEnroll) {
        const [qSubs, aSubs] = await Promise.all([
          apiFetch(`/student/submissions/quizzes?courseId=${courseId}`),
          apiFetch(`/student/submissions/assignments?courseId=${courseId}`)
        ]);
        setQuizSubmissions(qSubs || []);
        setAssignmentSubmissions(aSubs || []);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [courseId, lessonId]);

  useEffect(() => {
    if (!ytApiLoaded || !lesson?.videoUrl) return;

    const extractYouTubeId = (url) => {
      if (!url) return null;
      const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[7].length === 11) ? match[7] : null;
    };
    const videoId = extractYouTubeId(lesson.videoUrl);
    
    if (!videoId) return;

    let player;
    let initTimeout;
    
    const initPlayer = () => {
      const playerEl = document.getElementById('yt-player');
      if (!playerEl) {
        initTimeout = setTimeout(initPlayer, 100);
        return;
      }
      player = new window.YT.Player('yt-player', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        events: {
          'onStateChange': (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              if (!window.ytProgressInterval) {
                window.ytProgressInterval = setInterval(() => {
                  if (player && typeof player.getCurrentTime === 'function') {
                    const currentTime = player.getCurrentTime();
                    const duration = player.getDuration();
                    if (duration > 0 && (currentTime / duration) >= 0.01) {
                      setIsVideoUnlocked(true);
                      clearInterval(window.ytProgressInterval);
                      window.ytProgressInterval = null;
                    }
                  }
                }, 1000);
              }
            } else {
              if (window.ytProgressInterval) {
                clearInterval(window.ytProgressInterval);
                window.ytProgressInterval = null;
              }
            }
            if (event.data === window.YT.PlayerState.ENDED) {
              setIsVideoUnlocked(true);
              if (enrollment && !enrollment.completedLessonIds?.includes(lesson.id)) {
                completeLesson(lesson.id);
              }
            }
          }
        }
      });
    };
    initTimeout = setTimeout(initPlayer, 50);

    return () => {
      clearTimeout(initTimeout);
      if (window.ytProgressInterval) {
        clearInterval(window.ytProgressInterval);
        window.ytProgressInterval = null;
      }
      if (player && typeof player.destroy === 'function') {
        player.destroy();
      }
    };
  }, [lesson, ytApiLoaded, enrollment]);

  const completeLesson = async (lId) => {
    try {
      await apiFetch(`/student/courses/${courseId}/lessons/${lId}/complete`, { method: 'POST' });
      addToast('Lesson marked as complete!', 'success');
      loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const submitQuizAnswer = async (quizId) => {
    try {
      const quiz = quizzes.find(q => q.id === quizId);
      
      const payloadAnswers = [];
      for (const question of quiz.questions) {
        const selectedOptionId = selectedQuizAnswers[question.id];
        if (!selectedOptionId) return addToast('Please answer all questions before submitting', 'error');
        payloadAnswers.push({ questionId: question.id, selectedOptionId });
      }

      const payload = { answers: payloadAnswers };

      const result = await apiFetch(`/student/quizzes/${quizId}/attempt`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      if (result.passed) {
        addToast(`Quiz passed! (${result.score}%)`, 'success');
      } else {
        addToast(`Quiz failed. (${result.score}%)`, 'error');
      }
      
      setActiveQuiz(null);
      loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleAssignmentFileUpload = async (e, assignmentId) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      // 1. Upload the file
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('lms_token');
      const uploadRes = await fetch('/api/files/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!uploadRes.ok) throw new Error('File upload failed');
      const uploadData = await uploadRes.json();
      const fileUrl = uploadData.url;

      // 2. Submit the assignment with the real URL
      await apiFetch(`/student/assignments/${assignmentId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ submissionUrl: fileUrl })
      });
      
      addToast('Assignment submitted successfully!', 'success');
      setActiveAssignment(null);
      loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted">Loading Lesson...</div>;
  }

  if (!lesson) {
    return <div className="p-8 text-center text-muted">Lesson not found.</div>;
  }

  const isCompleted = enrollment?.completedLessonIds?.includes(lesson.id);

  // Compute checklist requirements
  const videoOk = !lesson.videoUrl || isVideoUnlocked;
  const allQuizzesPassed = quizzes.length === 0 || quizzes.every(q => {
    const attempts = quizSubmissions.filter(sub => sub.quizId === q.id);
    return attempts.some(a => a.score >= 50);
  });
  const allAssignmentsGraded = assignments.length === 0 || assignments.every(a => {
    const sub = assignmentSubmissions.find(s => s.assignmentId === a.id);
    return sub && sub.grade != null;
  });
  const canComplete = videoOk && allQuizzesPassed && allAssignmentsGraded;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '60px' }}>
      
      {/* Header Area */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <span className="chip" style={{ fontSize: '11px', textTransform: 'uppercase', marginBottom: '8px', display: 'inline-block' }}>
            {course?.title}
          </span>
          <h2 style={{ margin: 0, fontWeight: 'bold' }}>
            {isCompleted && <span style={{ color: '#22c55e', marginRight: '8px' }}>✓</span>}
            {lesson.title}
          </h2>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('course-detail', { courseId })}>
          ← Back to Course
        </button>
      </div>

      <div className="stat-card mb-4" style={{ padding: '24px', border: isCompleted ? '1px solid rgba(34,197,94,0.3)' : '1px solid var(--accent-blue)' }}>
        {lesson.videoUrl && (
          <div style={{ background: '#000', borderRadius: '6px', height: '450px', width: '100%', marginBottom: '24px', overflow: 'hidden' }}>
            <div id="yt-player"></div>
          </div>
        )}
        <h4 style={{ fontWeight: 'bold', marginBottom: '12px' }}>Lesson Content</h4>
        <p style={{ fontSize: '15px', lineHeight: '1.7', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '8px' }}>
          {lesson.description || 'No additional content provided.'}
        </p>

        {enrollment && !isCompleted && (
          <div style={{ marginTop: '24px', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
            <h4 style={{ fontWeight: 'bold', marginBottom: '16px', fontSize: '15px' }}>Lesson Completion Requirements</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px', background: videoOk ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${videoOk ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}` }}>
                <span style={{ fontSize: '18px' }}>{videoOk ? '✅' : '❌'}</span>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>Watch the lesson video</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px', background: allQuizzesPassed ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${allQuizzesPassed ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}` }}>
                <span style={{ fontSize: '18px' }}>{allQuizzesPassed ? '✅' : '❌'}</span>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>Pass all quizzes (≥ 50%)</span>
                {quizzes.length === 0 && <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: 'auto' }}>No quizzes</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px', background: allAssignmentsGraded ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${allAssignmentsGraded ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}` }}>
                <span style={{ fontSize: '18px' }}>{allAssignmentsGraded ? '✅' : '❌'}</span>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>All assignments graded by instructor</span>
                {assignments.length === 0 && <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: 'auto' }}>No assignments</span>}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className={`btn ${canComplete ? 'btn-success' : 'btn-secondary'}`}
                disabled={!canComplete}
                onClick={() => completeLesson(lesson.id)}
                style={{ opacity: canComplete ? 1 : 0.5, cursor: canComplete ? 'pointer' : 'not-allowed' }}
              >
                {canComplete ? '✓ Verify & Complete Lesson' : 'Complete Requirements First'}
              </button>
            </div>
          </div>
        )}
        {enrollment && isCompleted && (
          <div style={{ marginTop: '24px', padding: '16px 20px', background: 'rgba(34,197,94,0.08)', borderRadius: '10px', border: '1px solid rgba(34,197,94,0.25)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '22px' }}>✅</span>
            <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#22c55e' }}>Lesson Completed! You can proceed to the next lesson.</span>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Lesson Quizzes */}
        <div className="stat-card" style={{ padding: '24px' }}>
          <h4 style={{ fontWeight: 'bold', marginBottom: '16px' }}>Lesson Quiz</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {quizzes.length === 0 ? (
              <div className="text-muted text-xs py-4 text-center">No quizzes for this lesson.</div>
            ) : !isVideoUnlocked ? (
              <div className="text-center py-6" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px dashed var(--glass-border)' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔒</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Watch the video to unlock quizzes</div>
              </div>
            ) : quizzes.map((q, idx) => {
              const attempts = quizSubmissions.filter(sub => sub.quizId === q.id);
              const latestAttempt = attempts.length > 0 ? attempts.reduce((prev, current) => (prev.id > current.id) ? prev : current) : null;
              const isPassed = latestAttempt?.score >= 50;
              return (
                <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '14px 16px', borderRadius: '8px', alignItems: 'center', border: '1px solid var(--glass-border)' }}>
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', display: 'block' }}>{q.title || `Lesson Quiz`}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Test your knowledge</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {latestAttempt && (
                      <span style={{color: isPassed ? '#22c55e' : 'var(--accent-amber)', fontSize: '13px', fontWeight: 'bold'}}>
                        {isPassed ? 'Passed' : 'Failed'} ({latestAttempt.score}%)
                      </span>
                    )}
                    {(!latestAttempt || latestAttempt.score < 100) && (
                      <button className="btn btn-primary btn-sm" onClick={() => setActiveQuiz(q)}>
                        {latestAttempt ? 'Retake Quiz' : 'Take Quiz'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lesson Assignments */}
        <div className="stat-card" style={{ padding: '24px' }}>
          <h4 style={{ fontWeight: 'bold', marginBottom: '16px' }}>Assignments & Tasks</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {assignments.length === 0 ? (
              <div className="text-muted text-xs py-4 text-center">No assignments for this lesson.</div>
            ) : !isVideoUnlocked ? (
              <div className="text-center py-6" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px dashed var(--glass-border)' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔒</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Watch the video to unlock assignments</div>
              </div>
            ) : assignments.map(a => {
              const sub = assignmentSubmissions.find(s => s.assignmentId === a.id);
              return (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '14px 16px', borderRadius: '8px', alignItems: 'center', border: '1px solid var(--glass-border)' }}>
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', display: 'block' }}>{a.title}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Max Score: {a.maxScore || 100}</span>
                  </div>
                  {sub?.grade != null ? (
                    <div style={{ textAlign: 'right' }}>
                      <span style={{color: '#22c55e', fontSize: '13px', fontWeight: 'bold', display: 'block'}}>Graded ({sub.grade}/{a.maxScore})</span>
                      {sub.feedback && <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>"{sub.feedback}"</span>}
                    </div>
                  ) : sub ? (
                    <span style={{color: 'var(--accent-amber)', fontSize: '13px', fontWeight: 'bold'}}>Pending Review</span>
                  ) : (
                    <button className="btn btn-primary btn-sm" onClick={() => setActiveAssignment(a)}>Submit Task</button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lesson Q&A Discussion Board */}
      <div style={{ marginTop: '32px' }}>
        <DiscussionBoard courseId={courseId} lessonId={lesson.id} user={user} addToast={addToast} />
      </div>

      {/* Active Quiz details (Modal) */}
      {activeQuiz && (
        <div className="modal-overlay" style={{ display: 'flex' }} onClick={() => setActiveQuiz(null)}>
          <div className="modal" style={{ width: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{activeQuiz.title || 'Solve Quiz'}</h3>
              <button className="modal-close" onClick={() => setActiveQuiz(null)}>✕</button>
            </div>
            {activeQuiz.questions?.length > 0 ? (
               <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px' }}>
                  {activeQuiz.questions.map((question, qIdx) => (
                    <div key={question.id} className="mb-6">
                      <p style={{ fontWeight: 'bold', fontSize: '15px', marginBottom: '16px' }}>{qIdx + 1}. {question.text}</p>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {['A', 'B', 'C', 'D'].map((opt, i) => {
                          const option = question.options[i];
                          if (!option) return null;
                          const isSel = selectedQuizAnswers[question.id] === option.id;
                          return (
                            <div 
                              key={opt}
                              className={`quiz-option ${isSel ? 'selected' : ''}`}
                              onClick={() => setSelectedQuizAnswers(prev => ({ ...prev, [question.id]: option.id }))}
                            >
                              <input type="radio" checked={isSel} readOnly />
                              <span>{opt}. {option.text}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  <button className="btn btn-primary btn-full" onClick={() => submitQuizAnswer(activeQuiz.id)}>Submit Answers</button>
               </div>
            ) : (
               <div className="text-muted text-center py-4">No questions configured for this quiz yet.</div>
            )}
          </div>
        </div>
      )}

      {/* Active Assignment details (Modal) */}
      {activeAssignment && (
        <div className="modal-overlay" style={{ display: 'flex' }} onClick={() => setActiveAssignment(null)}>
          <div className="modal" style={{ width: '600px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Assignment: {activeAssignment.title}</h3>
              <button className="modal-close" onClick={() => setActiveAssignment(null)}>✕</button>
            </div>
            
            <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {activeAssignment.objective && (
                <div>
                  <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--accent-blue)', marginBottom: '4px' }}>Objective</h4>
                  <p style={{ fontSize: '14px', margin: 0 }}>{activeAssignment.objective}</p>
                </div>
              )}
              {activeAssignment.instructions && (
                <div>
                  <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--accent-blue)', marginBottom: '4px' }}>Instructions</h4>
                  <p style={{ fontSize: '14px', margin: 0, whiteSpace: 'pre-wrap' }}>{activeAssignment.instructions}</p>
                </div>
              )}
              {activeAssignment.submissionRequirements && (
                <div>
                  <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--accent-blue)', marginBottom: '4px' }}>Submission Requirements</h4>
                  <p style={{ fontSize: '14px', margin: 0, whiteSpace: 'pre-wrap' }}>{activeAssignment.submissionRequirements}</p>
                </div>
              )}
              {activeAssignment.evaluationCriteria && (
                <div>
                  <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--accent-blue)', marginBottom: '4px' }}>Evaluation Criteria</h4>
                  <p style={{ fontSize: '14px', margin: 0, whiteSpace: 'pre-wrap' }}>{activeAssignment.evaluationCriteria}</p>
                </div>
              )}
              {activeAssignment.expectedLearningOutcome && (
                <div>
                  <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--accent-blue)', marginBottom: '4px' }}>Expected Learning Outcome</h4>
                  <p style={{ fontSize: '14px', margin: 0, whiteSpace: 'pre-wrap' }}>{activeAssignment.expectedLearningOutcome}</p>
                </div>
              )}
              {activeAssignment.dueDate && (
                <div>
                  <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--accent-amber)', marginBottom: '4px' }}>Deadline</h4>
                  <p style={{ fontSize: '14px', margin: 0 }}>{new Date(activeAssignment.dueDate).toLocaleString()}</p>
                </div>
              )}
            </div>
            
            <div style={{ border: '2px dashed var(--glass-border)', padding: '32px', borderRadius: '8px', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
              <input 
                type="file" 
                id="assignment-file" 
                style={{ display: 'none' }} 
                onChange={(e) => handleAssignmentFileUpload(e, activeAssignment.id)} 
              />
              <label htmlFor="assignment-file" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '40px' }}>📤</span>
                <span style={{ fontSize: '15px', fontWeight: 'bold' }}>Click to Upload File</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ZIP, PDF, or JPG up to 10MB</span>
              </label>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
