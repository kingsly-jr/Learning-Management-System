import React, { useState, useEffect } from 'react';

import DiscussionBoard from '../components/DiscussionBoard.jsx';
import { apiFetch } from '../utils/api.js';

export default function LessonWorkspace({ courseId, lessonId, user, navigate, addToast }) {
  const [course, setCourse] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [studentSubmissions, setStudentSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showQuizTitleModal, setShowQuizTitleModal] = useState(false);
  const [quizTitle, setQuizTitle] = useState('');

  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [questionForm, setQuestionForm] = useState({ text: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A' });

  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState(null);
  const [assignmentForm, setAssignmentForm] = useState({ 
    title: '', lessonId: '', instructions: '', objective: '', 
    submissionRequirements: '', evaluationCriteria: '', 
    expectedLearningOutcome: '', dueDate: '', maxScore: 100 
  });

  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradeValue, setGradeValue] = useState(0);
  const [gradingFeedback, setGradingFeedback] = useState('');
  
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'QUESTION' | 'ASSIGNMENT', indexOrId: number }

  const loadData = async () => {
    if (!courseId || !lessonId) return;
    setLoading(true);
    try {
      const [courseData, lessonsList, quizzesList, assignmentsList, gradingList] = await Promise.all([
        apiFetch(`/courses/${courseId}`),
        apiFetch(`/courses/${courseId}/lessons`),
        apiFetch(`/courses/${courseId}/quizzes`),
        apiFetch(`/courses/${courseId}/assignments`),
        apiFetch(`/instructor/submissions?courseId=${courseId}`)
      ]);
      setCourse(courseData);
      
      const foundLesson = lessonsList?.find(l => l.id === parseInt(lessonId));
      if (!foundLesson) {
        addToast("Lesson not found", "error");
        navigate('course-detail', { courseId });
        return;
      }
      setLesson(foundLesson);
      
      const lessonQuizzes = quizzesList?.filter(q => q.lessonId === parseInt(lessonId)) || [];
      setActiveQuiz(lessonQuizzes.length > 0 ? lessonQuizzes[0] : null);
      
      setAssignments(assignmentsList?.filter(a => a.lessonId === parseInt(lessonId)) || []);
      
      // Filter grading list for assignments in this lesson
      const lessonAssignmentIds = assignmentsList?.filter(a => a.lessonId === parseInt(lessonId)).map(a => a.id) || [];
      setStudentSubmissions(gradingList?.filter(sub => lessonAssignmentIds.includes(sub.assignmentId)) || []);
      
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [courseId, lessonId]);

  // ─── QUIZ HANDLERS ───
  const openQuizTitleForm = () => {
    setQuizTitle(activeQuiz?.title || '');
    setShowQuizTitleModal(true);
  };

  const handleQuizTitleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        id: activeQuiz?.id,
        title: quizTitle || 'Lesson Quiz',
        lessonId: parseInt(lessonId),
        questions: activeQuiz?.questions || []
      };
      
      await apiFetch(`/courses/${courseId}/quizzes`, { method: 'POST', body: JSON.stringify(payload) });
      addToast('Quiz title saved!', 'success');
      setShowQuizTitleModal(false);
      loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const openQuestionForm = (index = null) => {
    if (index !== null) {
      setEditingQuestionIndex(index);
      const q = activeQuiz.questions[index];
      setQuestionForm({
        text: q.text || '',
        optionA: q.options?.[0]?.text || '',
        optionB: q.options?.[1]?.text || '',
        optionC: q.options?.[2]?.text || '',
        optionD: q.options?.[3]?.text || '',
        correctOption: q.options?.findIndex(o => o.correct) === 0 ? 'A' : q.options?.findIndex(o => o.correct) === 1 ? 'B' : q.options?.findIndex(o => o.correct) === 2 ? 'C' : 'D'
      });
    } else {
      setEditingQuestionIndex(null);
      setQuestionForm({ text: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A' });
    }
    setShowQuestionModal(true);
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    try {
      const newQuestion = {
        text: questionForm.text,
        points: 100,
        options: [
          { text: questionForm.optionA, correct: questionForm.correctOption === 'A' },
          { text: questionForm.optionB, correct: questionForm.correctOption === 'B' },
          { text: questionForm.optionC, correct: questionForm.correctOption === 'C' },
          { text: questionForm.optionD, correct: questionForm.correctOption === 'D' }
        ]
      };

      const updatedQuestions = [...(activeQuiz?.questions || [])];
      if (editingQuestionIndex !== null) {
        updatedQuestions[editingQuestionIndex] = newQuestion;
      } else {
        updatedQuestions.push(newQuestion);
      }

      const payload = {
        id: activeQuiz?.id,
        title: activeQuiz?.title || 'Lesson Quiz',
        lessonId: parseInt(lessonId),
        questions: updatedQuestions
      };

      await apiFetch(`/courses/${courseId}/quizzes`, { method: 'POST', body: JSON.stringify(payload) });
      addToast('Question saved!', 'success');
      setShowQuestionModal(false);
      loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const deleteQuestion = (index) => {
    setDeleteTarget({ type: 'QUESTION', indexOrId: index });
  };

  const confirmDeleteQuestion = async (index) => {
    try {
      const updatedQuestions = activeQuiz.questions.filter((_, i) => i !== index);
      const payload = {
        id: activeQuiz.id,
        title: activeQuiz.title,
        lessonId: parseInt(lessonId),
        questions: updatedQuestions
      };
      await apiFetch(`/courses/${courseId}/quizzes`, { method: 'POST', body: JSON.stringify(payload) });
      addToast('Question deleted.', 'info');
      loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // ─── ASSIGNMENT HANDLERS ───
  const openAssignmentForm = (assignment = null) => {
    if (assignment) {
      setEditingAssignmentId(assignment.id);
      setAssignmentForm({
        title: assignment.title || '',
        lessonId: assignment.lessonId,
        instructions: assignment.instructions || '',
        objective: assignment.objective || '',
        submissionRequirements: assignment.submissionRequirements || '',
        evaluationCriteria: assignment.evaluationCriteria || '',
        expectedLearningOutcome: assignment.expectedLearningOutcome || '',
        dueDate: assignment.dueDate ? assignment.dueDate.substring(0, 16) : '',
        maxScore: assignment.maxScore || 100
      });
    } else {
      setEditingAssignmentId(null);
      setAssignmentForm({ 
        title: '', lessonId: lessonId, instructions: '', objective: '', 
        submissionRequirements: '', evaluationCriteria: '', 
        expectedLearningOutcome: '', dueDate: '', maxScore: 100 
      });
    }
    setShowAssignmentModal(true);
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...assignmentForm, lessonId: parseInt(assignmentForm.lessonId) };
      if (editingAssignmentId) {
        await apiFetch(`/courses/${courseId}/assignments/${editingAssignmentId}`, { method: 'PUT', body: JSON.stringify(payload) });
        addToast('Assignment updated!', 'success');
      } else {
        await apiFetch(`/courses/${courseId}/assignments`, { method: 'POST', body: JSON.stringify(payload) });
        addToast('Assignment created!', 'success');
      }
      setShowAssignmentModal(false);
      loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const deleteAssignment = (assignmentId) => {
    setDeleteTarget({ type: 'ASSIGNMENT', indexOrId: assignmentId });
  };

  const confirmDeleteAssignment = async (assignmentId) => {
    try {
      await apiFetch(`/courses/${courseId}/assignments/${assignmentId}`, { method: 'DELETE' });
      addToast('Assignment deleted.', 'info');
      loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'QUESTION') {
      confirmDeleteQuestion(deleteTarget.indexOrId);
    } else if (deleteTarget.type === 'ASSIGNMENT') {
      confirmDeleteAssignment(deleteTarget.indexOrId);
    }
    setDeleteTarget(null);
  };

  // ─── GRADING HANDLERS ───
  const openGradingModal = (sub) => {
    setGradingSubmission(sub);
    setGradeValue(sub.grade != null ? sub.grade.toString() : '');
    setGradingFeedback(sub.feedback || '');
  };

  const submitGrade = async (e) => {
    e.preventDefault();
    try {
      const scoreInt = gradeValue === '' ? 0 : parseInt(gradeValue, 10);
      await apiFetch(`/student/submissions/${gradingSubmission.id}/grade`, {
        method: 'POST',
        body: JSON.stringify({ grade: scoreInt, feedback: gradingFeedback })
      });
      addToast('Grade saved!', 'success');
      setGradingSubmission(null);
      loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted">Loading Lesson Workspace...</div>;
  }

  if (!lesson) {
    return <div className="p-8 text-center text-muted">Lesson not found.</div>;
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '60px' }}>
      
      {/* Header Area */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <span className="chip" style={{ fontSize: '11px', textTransform: 'uppercase', marginBottom: '8px', display: 'inline-block' }}>
            {course?.title}
          </span>
          <h2 style={{ margin: 0, fontWeight: 'bold' }}>{lesson.title} - Workspace</h2>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={() => navigate('course-detail', { courseId })}>
            ← Back
          </button>
          <button className="btn btn-primary" onClick={() => { addToast('Lesson changes finalized!', 'success'); navigate('course-detail', { courseId }); }}>
            Save Lesson
          </button>
        </div>
      </div>

      <div className="stat-card" style={{ padding: '24px', marginBottom: '32px' }}>
        <h4 style={{ fontWeight: 'bold', marginBottom: '16px' }}>Lesson Details</h4>
        <p className="text-muted" style={{ fontSize: '14px', lineHeight: '1.6' }}>{lesson.description}</p>
        {lesson.videoUrl && (
          <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🎥</span>
            <span style={{ fontSize: '13px' }}>Video attached: <a href={lesson.videoUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-blue)' }}>{lesson.videoUrl}</a></span>
          </div>
        )}
      </div>

      {/* Workspace Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Left Column: Quizzes & Assignments */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Lesson Quiz Section */}
          <div className="stat-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ fontWeight: 'bold', margin: 0 }}>Lesson Quiz</h4>
              {activeQuiz ? (
                <button className="btn btn-secondary btn-sm" onClick={openQuizTitleForm}>Edit Title</button>
              ) : (
                <button className="btn btn-primary btn-sm" onClick={openQuizTitleForm}>Create Quiz</button>
              )}
            </div>
            
            {activeQuiz ? (
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                <h5 style={{ fontWeight: 'bold', marginBottom: '16px', color: 'var(--accent-blue)' }}>{activeQuiz.title || 'Untitled Quiz'}</h5>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Questions</span>
                  <button className="btn btn-primary btn-sm" onClick={() => openQuestionForm()}>➕ Add Question</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(!activeQuiz.questions || activeQuiz.questions.length === 0) ? (
                    <div className="text-muted text-xs text-center py-4">No questions added yet.</div>
                  ) : activeQuiz.questions.map((q, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '8px', alignItems: 'center', border: '1px solid var(--glass-border)' }}>
                      <div>
                        <span style={{ fontSize: '14px', fontWeight: 'bold', display: 'block' }}>Q{idx + 1}. {q.text}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                          Correct Option: {q.options?.find(o => o.correct)?.text || 'None'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button className="btn btn-secondary btn-sm" onClick={() => openQuestionForm(idx)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteQuestion(idx)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-muted text-xs text-center py-4">No quiz created for this lesson yet.</div>
            )}
          </div>

          {/* Assignments Section */}
          <div className="stat-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h4 style={{ fontWeight: 'bold', margin: 0 }}>Assignments & Tasks</h4>
              <button className="btn btn-primary btn-sm" onClick={() => openAssignmentForm()}>➕ Add Assignment</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {assignments.length === 0 ? (
                <div className="text-muted text-xs text-center py-4">No assignments created for this lesson yet.</div>
              ) : assignments.map(a => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '8px', alignItems: 'center', border: '1px solid var(--glass-border)' }}>
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', display: 'block' }}>{a.title}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Max Score: {a.maxScore || 100}</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn btn-secondary btn-sm" onClick={() => openAssignmentForm(a)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteAssignment(a.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Grading Queue */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="stat-card" style={{ padding: '24px', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h4 style={{ fontWeight: 'bold', margin: 0 }}>Grading Queue</h4>
            </div>
            <p className="text-sm text-muted mb-4">Review and grade student submissions for assignments in this specific lesson.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {studentSubmissions.length === 0 ? (
                <div className="text-muted text-xs text-center py-8" style={{ border: '1px dashed var(--glass-border)', borderRadius: '8px' }}>
                  No pending submissions for this lesson.
                </div>
              ) : studentSubmissions.map(sub => {
                const assignment = assignments.find(a => a.id === sub.assignmentId);
                return (
                  <div key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '8px', alignItems: 'center', border: '1px solid var(--glass-border)' }}>
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: 'bold', display: 'block' }}>{sub.studentName}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Assignment: {assignment?.title || `#${sub.assignmentId}`}</span>
                      
                      <div style={{ marginTop: '6px' }}>
                        <span className="chip" style={{ fontSize: '10px', display: 'inline-block', background: sub.grade != null ? 'rgba(34,197,94,0.15)' : undefined, color: sub.grade != null ? '#22c55e' : undefined }}>{sub.grade != null ? `Graded (${sub.grade})` : 'Pending Review'}</span>
                        {sub.submissionUrl && (
                          <a href={sub.submissionUrl} download style={{ display: 'inline-block', fontSize: '12px', color: 'var(--accent-blue)', textDecoration: 'none', marginLeft: '12px' }}>
                            📁 Download Work
                          </a>
                        )}
                      </div>
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={() => openGradingModal(sub)}>
                      {sub.grade != null ? 'Update Grade' : 'Grade'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Lesson Q&A Discussion Board */}
      <div style={{ marginTop: '32px' }}>
        <DiscussionBoard courseId={courseId} lessonId={lesson.id} user={user} addToast={addToast} />
      </div>

      {/* ─── MODALS ─── */}

      {/* Quiz Title Modal */}
      {showQuizTitleModal && (
        <div className="modal-overlay" style={{ display: 'flex' }} onClick={() => setShowQuizTitleModal(false)}>
          <div className="modal" style={{ width: '450px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{activeQuiz ? 'Edit Quiz Title' : 'Create Quiz'}</h3>
              <button className="modal-close" onClick={() => setShowQuizTitleModal(false)}>✕</button>
            </div>
            <form onSubmit={handleQuizTitleSubmit}>
              <div className="form-group mb-4">
                <label className="form-label">Quiz Title *</label>
                <input className="form-input" value={quizTitle} onChange={e => setQuizTitle(e.target.value)} placeholder="e.g. Lesson 1 Quiz" required />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" className="btn btn-secondary" onClick={() => setShowQuizTitleModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Title</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Question Add/Edit Modal */}
      {showQuestionModal && (
        <div className="modal-overlay" style={{ display: 'flex' }} onClick={() => setShowQuestionModal(false)}>
          <div className="modal" style={{ width: '450px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingQuestionIndex !== null ? 'Edit Question' : 'Add Question'}</h3>
              <button className="modal-close" onClick={() => setShowQuestionModal(false)}>✕</button>
            </div>
            <form onSubmit={handleQuestionSubmit}>
              <div className="form-group mb-3">
                <label className="form-label">Question Text *</label>
                <input className="form-input" value={questionForm.text} onChange={e => setQuestionForm(prev => ({ ...prev, text: e.target.value }))} required />
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Option A *</label>
                <input className="form-input" value={questionForm.optionA} onChange={e => setQuestionForm(prev => ({ ...prev, optionA: e.target.value }))} required />
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Option B *</label>
                <input className="form-input" value={questionForm.optionB} onChange={e => setQuestionForm(prev => ({ ...prev, optionB: e.target.value }))} required />
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Option C *</label>
                <input className="form-input" value={questionForm.optionC} onChange={e => setQuestionForm(prev => ({ ...prev, optionC: e.target.value }))} required />
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Option D *</label>
                <input className="form-input" value={questionForm.optionD} onChange={e => setQuestionForm(prev => ({ ...prev, optionD: e.target.value }))} required />
              </div>
              <div className="form-group mb-4">
                <label className="form-label">Correct Option *</label>
                <select className="form-input" value={questionForm.correctOption} onChange={e => setQuestionForm(prev => ({ ...prev, correctOption: e.target.value }))} required>
                  <option value="A">Option A</option>
                  <option value="B">Option B</option>
                  <option value="C">Option C</option>
                  <option value="D">Option D</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" className="btn btn-secondary" onClick={() => setShowQuestionModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Question</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assignment Add/Edit Modal */}
      {showAssignmentModal && (
        <div className="modal-overlay" style={{ display: 'flex' }} onClick={() => setShowAssignmentModal(false)}>
          <div className="modal" style={{ width: '600px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingAssignmentId ? 'Edit Assignment' : 'Add Assignment'}</h3>
              <button className="modal-close" onClick={() => setShowAssignmentModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAssignmentSubmit}>
              <div className="form-group mb-3">
                <label className="form-label">Assignment Title *</label>
                <input className="form-input" value={assignmentForm.title} onChange={e => setAssignmentForm(prev => ({ ...prev, title: e.target.value }))} required />
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Objective</label>
                <textarea className="form-input" rows="2" value={assignmentForm.objective} onChange={e => setAssignmentForm(prev => ({ ...prev, objective: e.target.value }))}></textarea>
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Instructions</label>
                <textarea className="form-input" rows="4" value={assignmentForm.instructions} onChange={e => setAssignmentForm(prev => ({ ...prev, instructions: e.target.value }))}></textarea>
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Submission Requirements</label>
                <textarea className="form-input" rows="2" value={assignmentForm.submissionRequirements} onChange={e => setAssignmentForm(prev => ({ ...prev, submissionRequirements: e.target.value }))}></textarea>
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Evaluation Criteria</label>
                <textarea className="form-input" rows="2" value={assignmentForm.evaluationCriteria} onChange={e => setAssignmentForm(prev => ({ ...prev, evaluationCriteria: e.target.value }))}></textarea>
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Expected Learning Outcome</label>
                <textarea className="form-input" rows="2" value={assignmentForm.expectedLearningOutcome} onChange={e => setAssignmentForm(prev => ({ ...prev, expectedLearningOutcome: e.target.value }))}></textarea>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="mb-4">
                <div className="form-group">
                  <label className="form-label">Total Marks (Max Score) *</label>
                  <input type="number" className="form-input" value={assignmentForm.maxScore} onChange={e => setAssignmentForm(prev => ({ ...prev, maxScore: parseInt(e.target.value) || 100 }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Submission Deadline</label>
                  <input type="datetime-local" className="form-input" value={assignmentForm.dueDate} onChange={e => setAssignmentForm(prev => ({ ...prev, dueDate: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAssignmentModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grading Submit Modal */}
      {gradingSubmission && (
        <div className="modal-overlay" style={{ display: 'flex' }} onClick={() => setGradingSubmission(null)}>
          <div className="modal" style={{ width: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Grade Work ({gradingSubmission.studentName})</h3>
              <button className="modal-close" onClick={() => setGradingSubmission(null)}>✕</button>
            </div>
            <form onSubmit={submitGrade}>
              <div className="form-group mb-3">
                <label className="form-label">Score</label>
                <input type="number" min="0" className="form-input" value={gradeValue} onChange={e => setGradeValue(e.target.value)} required />
              </div>
              {gradingSubmission.submissionUrl && (
                <div className="form-group mb-3" style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                  <label className="form-label">Student Submission</label>
                  <a href={gradingSubmission.submissionUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <span>📄</span> View Submitted File
                  </a>
                </div>
              )}
              <div className="form-group mb-4">
                <label className="form-label">Grading Feedback</label>
                <textarea className="form-input" rows="3" placeholder="Provide feedback notes..." value={gradingFeedback} onChange={e => setGradingFeedback(e.target.value)}></textarea>
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" className="btn btn-secondary" onClick={() => setGradingSubmission(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Grade</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="modal-overlay open" onClick={() => setDeleteTarget(null)} style={{ zIndex: 1000 }}>
          <div className="modal" style={{ width: '400px', textAlign: 'center', padding: '32px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 16px 0', width: '100%', textAlign: 'center' }}>
              Delete {deleteTarget.type === 'QUESTION' ? 'Question' : 'Assignment'}
            </h3>
            <div style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '15px' }}>
              Are you sure you want to delete this {deleteTarget.type === 'QUESTION' ? 'question' : 'assignment'}? This action cannot be undone.
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={confirmDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
