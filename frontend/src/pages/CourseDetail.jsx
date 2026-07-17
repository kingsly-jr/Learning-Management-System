import React, { useState, useEffect } from 'react';
import { apiFetch, esc } from '../utils/api.js';
import DiscussionBoard from '../components/DiscussionBoard.jsx';

export default function CourseDetail({ courseId, currentParams, user, navigate, addToast, fetchNotifications }) {
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [assignments, setAssignments] = useState([]);

  // Course administration / builder modals
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [lessonForm, setLessonForm] = useState({ title: '', videoUrl: '', description: '', sequenceOrder: 0 });
  const [editingLessonId, setEditingLessonId] = useState(null);
  
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [showAboutModal, setShowAboutModal] = useState(false);
  


  // Loading
  const [loading, setLoading] = useState(true);

  const loadCourseData = async () => {
    if (!courseId || courseId === 'undefined') return;
    setLoading(true);
    try {
      const data = await apiFetch(`/courses/${courseId}`);
      setCourse(data);

      const [lessonsList, quizzesList, assignmentsList] = await Promise.all([
        apiFetch(`/courses/${courseId}/lessons`),
        apiFetch(`/courses/${courseId}/quizzes`),
        apiFetch(`/courses/${courseId}/assignments`)
      ]);
      setLessons(lessonsList || []);
      setQuizzes(quizzesList || []);
      setAssignments(assignmentsList || []);

      if (user && (user.role === 'STUDENT' || user.role === 'GRADUATE')) {
        try {
          const activeEnroll = await apiFetch(`/student/enrollments/course/${courseId}`);
          setEnrollment(activeEnroll);
        } catch (e) {
          setEnrollment(null);
        }
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourseData();
  }, [courseId, user]);

  useEffect(() => {
    // Scroll removed since we now use conditional rendering (separate tabs)
  }, [loading, currentParams]);

  const [localView, setLocalView] = useState('modules');

  useEffect(() => {
    if (currentParams?.scrollTo) {
      setLocalView(currentParams.scrollTo);
    }
  }, [currentParams]);

  const activeView = localView;



  const openLessonForm = (lesson = null) => {
    if (lesson) {
      setEditingLessonId(lesson.id);
      setLessonForm({ title: lesson.title, videoUrl: lesson.videoUrl || '', description: lesson.description || '', sequenceOrder: lesson.sequenceOrder || 0 });
    } else {
      setEditingLessonId(null);
      setLessonForm({ title: '', videoUrl: '', description: '', sequenceOrder: lessons.length });
    }
    setShowLessonModal(true);
  };

  const handleLessonSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLessonId) {
        await apiFetch(`/courses/${courseId}/lessons/${editingLessonId}`, { method: 'PUT', body: JSON.stringify(lessonForm) });
        addToast('Lesson updated.', 'info');
      } else {
        await apiFetch(`/courses/${courseId}/lessons`, { method: 'POST', body: JSON.stringify(lessonForm) });
        addToast('Lesson added.', 'success');
      }
      setShowLessonModal(false);
      loadCourseData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const deleteLesson = (id) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiFetch(`/courses/${courseId}/lessons/${deleteTarget}`, { method: 'DELETE' });
      addToast('Lesson deleted.', 'info');
      loadCourseData();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setDeleteTarget(null);
    }
  };


  // ─── GENERATE CERTIFICATE ───
  const downloadCertificate = async () => {
    try {
      // Direct GET download triggers browser context popup
      window.open(`/api/student/courses/${courseId}/certificate`, '_blank');
      addToast('Certificate generated successfully! 🏅', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // ─── RAZORPAY INTEGRATION ───
  const handleEnrollment = async () => {
    try {
      if (!course.price || course.price <= 0) {
        // Free course
        await apiFetch(`/student/courses/${courseId}/enroll`, { method: 'POST' });
        addToast('Enrolled successfully!', 'success');
        loadCourseData();
        return;
      }

      // Paid course
      const data = await apiFetch(`/payments/create-order/${courseId}`, { method: 'POST' });
      if (!data.orderId) throw new Error("Failed to create order");

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: course.price * 100,
        currency: "INR",
        name: "LearnSphere LMS",
        description: `Enroll in ${course.title}`,
        order_id: data.orderId,
        handler: async function (response) {
          try {
            await apiFetch(`/payments/verify-payment`, {
              method: 'POST',
              body: JSON.stringify(response)
            });
            navigate('payment-success');
          } catch (err) {
            addToast('Payment verification failed: ' + err.message, 'error');
          }
        },
        prefill: {
          name: user?.username,
          email: user?.email,
        },
        theme: {
          color: "#3b82f6"
        }
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        addToast(response.error.description, 'error');
      });
      rzp.open();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  if (loading) {
    return <div className="loading-overlay" style={{ position: 'relative', height: '100px' }}><div className="spinner"></div></div>;
  }

  const isInstructor = user?.role === 'INSTRUCTOR';
  const isAdmin = user?.role === 'ADMIN';
  const isEnrolled = Boolean(enrollment);

  return (
    <div>
      {/* Guest Back Button (only shown if not in dashboard shell) */}
      {!user && (
        <div style={{ padding: '20px 40px', background: 'var(--bg-elevated)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => { window.location.href = '/'; }}>
            ← Back to Catalog
          </button>
        </div>
      )}

      {/* Compact Course Details Header */}
      <div className="stat-card mb-4" style={{ padding: '24px', display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span className="chip" style={{ fontSize: '10px', textTransform: 'uppercase', padding: '4px 8px' }}>
              {course.categoryName || 'Uncategorized'}
            </span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>👨‍🏫 {course.instructorName || '—'}</span>
            <span style={{ fontSize: '13px', color: 'var(--accent-green)', fontWeight: 'bold' }}>{course.price > 0 ? `₹${course.price.toFixed(2)}` : 'Free'}</span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>📚 {lessons.length} Modules</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 8px 0' }}>{course.title}</h1>
          <p className="text-muted" style={{ fontSize: '14px', margin: 0 }}>{course.subtitle}</p>
        </div>

        <div style={{ flex: '1', minWidth: '300px', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-secondary)' }}>About this Course</h3>
          <p style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--text-muted)', margin: 0 }}>{course.description || 'No description provided.'}</p>
        </div>
      </div>

        {/* Action Buttons Container */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
          {/* Guest User Actions */}
          {!user && (
            <button className="btn btn-primary" onClick={() => { addToast('Please register to enroll.', 'info'); window.location.href='/?register=true'; }}>
              Enroll Now to Start Learning
            </button>
          )}

          {/* Student Actions */}
          {user && (user.role === 'STUDENT' || user.role === 'GRADUATE') && (
            isEnrolled ? (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ color: '#22c55e', fontWeight: '600', padding: '8px 16px', background: 'rgba(34,197,94,0.1)', borderRadius: '8px', border: '1px solid rgba(34,197,94,0.2)' }}>
                  ✓ You are enrolled
                </span>
                {enrollment?.progressPercentage === 100 && (
                  <button className="btn btn-success" onClick={downloadCertificate}>
                    🏅 Download Certificate
                  </button>
                )}
              </div>
            ) : (
              <button className="btn btn-primary" onClick={handleEnrollment}>
                Enroll Now
              </button>
            )
          )}

          {/* Admin Actions */}
          {isAdmin && course.reviewStatus === 'PENDING' && (
            <div className="flex gap-2">
              <button className="btn btn-success" onClick={() => apiFetch(`/courses/${courseId}/approve`, { method: 'POST' }).then(() => { addToast('Approved!', 'success'); loadCourseData(); fetchNotifications(); })}>Approve Course</button>
              <button className="btn btn-danger" onClick={() => apiFetch(`/courses/${courseId}/reject`, { method: 'POST' }).then(() => { addToast('Rejected!', 'info'); loadCourseData(); fetchNotifications(); })}>Reject Course</button>
            </div>
          )}
        </div>

      {/* Navigation Tabs - Removed per new lesson-centric flow */}
      
      {/* Main Course Syllabus & Actions split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '28px' }}>
        {/* Left Side: Lessons / Syllabus */}
        <div>
          {/* Modules View */}
          <React.Fragment>
            <div id="modules" className="section-header">
            <h3>Course Modules ({lessons.length} lessons)</h3>
            {isInstructor && (
              <button className="btn btn-secondary btn-sm" onClick={() => openLessonForm()}>➕ Add Lesson</button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} className="mb-4">
            {lessons.length === 0 ? (
              <div className="empty-state">No lessons uploaded yet.</div>
            ) : (
              lessons.map((lesson, index) => {
                const isCompleted = enrollment?.completedLessonIds?.includes(lesson.id);
                let isLocked = false;
                if (isEnrolled && !isCompleted && !isInstructor && !isAdmin) {
                   for (let i = 0; i < index; i++) {
                      if (!enrollment?.completedLessonIds?.includes(lessons[i].id)) {
                          isLocked = true;
                          break;
                      }
                   }
                }
                const canOpen = isEnrolled && (!isLocked || isInstructor || isAdmin);

                return (
                  <div key={lesson.id} className="stat-card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: isLocked ? 0.6 : 1 }}>
                    <div style={{ cursor: (!isLocked && !isInstructor && !isAdmin) ? 'pointer' : 'default', flex: 1, paddingRight: '16px' }} onClick={() => (!isLocked && !isInstructor && !isAdmin) && navigate('student-lesson-view', { courseId, lessonId: lesson.id })}>
                      <h4 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '6px' }}>
                        {isCompleted && <span style={{ color: '#22c55e', marginRight: '6px' }}>✓</span>}
                        {isLocked && <span style={{ marginRight: '6px' }}>🔒</span>}
                        {lesson.title}
                      </h4>
                      {lesson.description && (
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {lesson.description}
                        </p>
                      )}
                      {lesson.videoUrl && <span className="text-xs text-muted" style={{ display: 'inline-block', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '12px' }}>📹 Video Included</span>}
                    </div>
                    <div className="flex gap-2">
                      {isInstructor && (
                        <React.Fragment>
                          <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); navigate('lesson-workspace', { courseId, lessonId: lesson.id }); }}>Manage Lesson</button>
                          <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); openLessonForm(lesson); }}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={(e) => { e.stopPropagation(); deleteLesson(lesson.id); }}>Delete</button>
                        </React.Fragment>
                      )}
                      {isAdmin && (
                        <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); navigate('lesson-workspace', { courseId, lessonId: lesson.id }); }}>View Details</button>
                      )}
                      {!user ? (
                        <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); addToast('Please register to enroll in this course and start learning.', 'info'); window.location.href='/?register=true'; }}>Login to Enroll</button>
                      ) : !isEnrolled && !isInstructor && !isAdmin ? (
                        <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); addToast('Please enroll in the course to access lessons.', 'info'); }}>Enroll to Unlock</button>
                      ) : (
                        !isLocked && isEnrolled && !isInstructor && !isAdmin && (
                          isCompleted ? (
                            <span style={{ color: '#22c55e', fontSize: '13px', fontWeight: 'bold', padding: '6px 12px', background: 'rgba(34,197,94,0.1)', borderRadius: '6px' }}>✓ Lesson Completed</span>
                          ) : (
                            <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); navigate('student-lesson-view', { courseId, lessonId: lesson.id }); }}>Start Lesson</button>
                          )
                        )
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          </React.Fragment>
        </div>


      </div>

      {/* Lesson Add/Edit Modal */}
      {showLessonModal && (
        <div className="modal-overlay" style={{ display: 'flex' }} onClick={() => setShowLessonModal(false)}>
          <div className="modal" style={{ width: '450px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingLessonId ? 'Edit Lesson' : 'Add Lesson'}</h3>
              <button className="modal-close" onClick={() => setShowLessonModal(false)}>✕</button>
            </div>
            <form onSubmit={handleLessonSubmit}>
              <div className="form-group mb-3">
                <label className="form-label">Lesson Title *</label>
                <input className="form-input" value={lessonForm.title} onChange={e => setLessonForm(prev => ({ ...prev, title: e.target.value }))} required />
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Video URL</label>
                <input className="form-input" placeholder="e.g. https://youtube.com/..." value={lessonForm.videoUrl} onChange={e => setLessonForm(prev => ({ ...prev, videoUrl: e.target.value }))} />
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Written Content</label>
                <textarea className="form-input" rows="4" value={lessonForm.description} onChange={e => setLessonForm(prev => ({ ...prev, description: e.target.value }))}></textarea>
              </div>
              <div className="form-group mb-4">
                <label className="form-label">Order Index</label>
                <input type="number" className="form-input" value={lessonForm.sequenceOrder} onChange={e => setLessonForm(prev => ({ ...prev, sequenceOrder: parseInt(e.target.value) || 0 }))} />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" className="btn btn-secondary" onClick={() => setShowLessonModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Lesson</button>
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
              Delete Lesson
            </h3>
            <div style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '15px' }}>
              Are you sure you want to delete this lesson permanently? This action cannot be undone.
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
