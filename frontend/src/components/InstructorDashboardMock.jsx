import React, { useState } from 'react';
import { apiFetch } from '../utils/api.js';

export default function InstructorDashboardMock({ user, dashboardData, myCourses, navigate, addToast, reloadData }) {
  const { stats, upcomingClasses, leaderboard, pendingGrading } = dashboardData || {};

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackContent, setFeedbackContent] = useState('');

  const submitFeedback = async () => {
    if (!feedbackContent.trim()) {
      if (addToast) addToast('Feedback cannot be empty', 'error');
      else alert('Feedback cannot be empty');
      return;
    }
    try {
      await apiFetch('/feedbacks', {
        method: 'POST',
        body: JSON.stringify({ content: feedbackContent })
      });
      if (addToast) addToast('Feedback submitted successfully!', 'success');
      else alert('Feedback submitted successfully!');
      setShowFeedbackModal(false);
      setFeedbackContent('');
    } catch (err) {
      if (addToast) addToast(err.message, 'error');
      else alert(err.message);
    }
  };

  // Live Class Form State
  const [showLiveClassForm, setShowLiveClassForm] = useState(false);
  const [liveClassForm, setLiveClassForm] = useState({
    title: '',
    courseId: '',
    date: '',
    startTime: '',
    endTime: '',
    zoomLink: ''
  });

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!liveClassForm.courseId) {
      addToast('Please enter a valid Course ID', 'error');
      return;
    }
    try {
      const startDateTime = new Date(`${liveClassForm.date}T${liveClassForm.startTime}`);
      const endDateTime = new Date(`${liveClassForm.date}T${liveClassForm.endTime}`);
      
      if (endDateTime <= startDateTime) {
        addToast('End time must be after start time', 'error');
        return;
      }

      await apiFetch('/instructor/live-classes', {
        method: 'POST',
        body: JSON.stringify({
          title: liveClassForm.title,
          zoomLink: liveClassForm.zoomLink,
          scheduledAt: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          courseId: parseInt(liveClassForm.courseId)
        })
      });
      addToast('Live Class Scheduled!', 'success');
      setShowLiveClassForm(false);
      setLiveClassForm({ title: '', courseId: '', date: '', startTime: '', endTime: '', zoomLink: '' });
      if (reloadData) reloadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const [classToDelete, setClassToDelete] = useState(null);

  const handleDeleteLiveClass = async (classId) => {
    try {
      await apiFetch(`/instructor/live-classes/${classId}`, {
        method: 'DELETE'
      });
      addToast('Live Class Deleted', 'success');
      setClassToDelete(null);
      if (reloadData) reloadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '40px' }}>
      
      {/* ─── HEADER ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Instructor Dashboard</h2>
        <button 
          onClick={() => setShowFeedbackModal(true)}
          style={{
            background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)',
            padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
            transition: 'var(--transition)'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(59,130,246,0.1)'}
        >
          💬 Give Feedback
        </button>
      </div>

      {/* ─── QUICK STATS ─── */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => navigate('my-courses')} style={{ cursor: 'pointer', background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(37,99,235,0.05))', border: '1px solid rgba(59,130,246,0.2)' }}>
          <div className="stat-icon">📚</div>
          <div className="stat-value">{stats?.totalCourses || 0}</div>
          <div className="stat-label">Published Courses</div>
        </div>
        <div className="stat-card" onClick={() => navigate('instructor-students')} style={{ cursor: 'pointer', background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(22,163,74,0.05))', border: '1px solid rgba(34,197,94,0.2)' }}>
          <div className="stat-icon">👥</div>
          <div className="stat-value">{stats?.totalEnrollments || 0}</div>
          <div className="stat-label">Total Enrollments</div>
        </div>
        <div className="stat-card" onClick={() => addToast('Detailed earnings page coming soon!', 'info')} style={{ cursor: 'pointer', background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(147,51,234,0.05))', border: '1px solid rgba(168,85,247,0.2)' }}>
          <div className="stat-icon">📈</div>
          <div className="stat-value">₹{(stats?.totalRevenue || 0).toFixed(2)}</div>
          <div className="stat-label">Total Earnings</div>
        </div>
        <div className="stat-card" onClick={() => document.getElementById('needs-grading')?.scrollIntoView({ behavior: 'smooth' })} style={{ cursor: 'pointer', background: 'linear-gradient(135deg, rgba(234,179,8,0.1), rgba(202,138,4,0.05))', border: '1px solid rgba(234,179,8,0.2)' }}>
          <div className="stat-icon">📝</div>
          <div className="stat-value">{pendingGrading?.length || 0}</div>
          <div className="stat-label">Pending Grading</div>
        </div>
        <div className="stat-card" onClick={() => { navigate('my-courses'); addToast('Check your courses to answer student questions', 'info'); }} style={{ cursor: 'pointer', background: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(220,38,38,0.05))', border: '1px solid rgba(239,68,68,0.2)' }}>
          <div className="stat-icon" style={{ animation: (stats?.unansweredQuestions || 0) > 0 ? 'pulse 2s infinite' : 'none' }}>💬</div>
          <div className="stat-value" style={{ color: (stats?.unansweredQuestions || 0) > 0 ? '#ef4444' : 'inherit' }}>{stats?.unansweredQuestions || 0}</div>
          <div className="stat-label">Unanswered Questions</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        
        {/* ─── LIVE CLASSES MANAGER ─── */}
        <div className="stat-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Upcoming Live Classes</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowLiveClassForm(!showLiveClassForm)}>
              {showLiveClassForm ? 'Cancel' : '➕ Schedule'}
            </button>
          </div>

          {showLiveClassForm && (
            <form onSubmit={handleScheduleSubmit} style={{ background: 'var(--bg-elevated)', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
              <div className="form-group mb-2">
                <label className="form-label" style={{ fontSize: '12px' }}>Topic / Title</label>
                <input className="form-input" style={{ padding: '6px 12px', fontSize: '13px' }} required value={liveClassForm.title} onChange={e => setLiveClassForm({...liveClassForm, title: e.target.value})} placeholder="e.g. Weekly Q&A" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }} className="mb-2">
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '12px' }}>Course</label>
                  <select 
                    className="form-input" 
                    style={{ padding: '6px 12px', fontSize: '13px' }} 
                    required 
                    value={liveClassForm.courseId} 
                    onChange={e => setLiveClassForm({...liveClassForm, courseId: e.target.value})}
                  >
                    <option value="">Select a course...</option>
                    {myCourses?.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '12px' }}>Date</label>
                  <input type="date" className="form-input" style={{ padding: '6px 12px', fontSize: '13px' }} required value={liveClassForm.date} onChange={e => setLiveClassForm({...liveClassForm, date: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '12px' }}>Start Time</label>
                  <input type="time" className="form-input" style={{ padding: '6px 12px', fontSize: '13px' }} required value={liveClassForm.startTime} onChange={e => setLiveClassForm({...liveClassForm, startTime: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '12px' }}>End Time</label>
                  <input type="time" className="form-input" style={{ padding: '6px 12px', fontSize: '13px' }} required value={liveClassForm.endTime} onChange={e => setLiveClassForm({...liveClassForm, endTime: e.target.value})} />
                </div>
              </div>
              <div className="form-group mb-3">
                <label className="form-label" style={{ fontSize: '12px' }}>Zoom / Meet Link</label>
                <input type="url" className="form-input" style={{ padding: '6px 12px', fontSize: '13px' }} required value={liveClassForm.zoomLink} onChange={e => setLiveClassForm({...liveClassForm, zoomLink: e.target.value})} placeholder="https://zoom.us/j/..." />
              </div>
              <button type="submit" className="btn btn-primary btn-sm btn-full">Save Class</button>
            </form>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto', maxHeight: '300px' }}>
            {(!upcomingClasses || upcomingClasses.length === 0) && !showLiveClassForm ? (
              <div className="empty-state text-sm" style={{ padding: '20px' }}>No upcoming classes scheduled.</div>
            ) : (
              upcomingClasses?.map((lc) => (
                <div key={lc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #a855f7' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>{lc.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{lc.courseName} • {new Date(lc.scheduledAt).toLocaleDateString()} ({new Date(lc.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {lc.endTime ? new Date(lc.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '?'})</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <a href={lc.zoomLink} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">Host</a>
                    <button onClick={() => setClassToDelete(lc.id)} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', borderColor: 'rgba(239,68,68,0.2)', color: '#ef4444' }} title="Delete Class">
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ─── PENDING GRADING ─── */}
        <div id="needs-grading" className="stat-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>Needs Grading</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto', maxHeight: '400px' }}>
            {!pendingGrading || pendingGrading.length === 0 ? (
              <div className="empty-state text-sm" style={{ padding: '20px' }}>All caught up! No pending assignments.</div>
            ) : (
              pendingGrading.map(sub => (
                <div key={sub.id} style={{ background: 'var(--bg-elevated)', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #eab308' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>{sub.studentName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Submitted on {new Date(sub.submittedAt).toLocaleDateString()}</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {sub.submissionUrl && <a href={sub.submissionUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ fontSize: '11px', padding: '4px 8px' }}>View Link</a>}
                    <button className="btn btn-primary btn-sm" style={{ fontSize: '11px', padding: '4px 8px' }} onClick={() => navigate('lesson-workspace', { courseId: sub.courseId, lessonId: sub.lessonId })}>Grade Now</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ─── STUDENT LEADERBOARD ─── */}
      <div className="stat-card">
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>My Students Leaderboard</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {!leaderboard || leaderboard.length === 0 ? (
            <div className="empty-state text-sm">No students found.</div>
          ) : (
            leaderboard.map((lb, index) => (
              <div key={lb.username} style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-elevated)', padding: '12px 16px', borderRadius: '8px' }}>
                <div style={{ fontWeight: 'bold', width: '30px', color: index === 0 ? '#eab308' : index === 1 ? '#9ca3af' : index === 2 ? '#b45309' : 'var(--text-muted)' }}>#{index + 1}</div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{lb.username}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{(lb.xp || 0).toLocaleString()} XP</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* ─── DELETE MODAL ─── */}
      {classToDelete && (
        <div className="modal-overlay open" onClick={() => setClassToDelete(null)} style={{ zIndex: 1000 }}>
          <div className="modal" style={{ width: '400px', textAlign: 'center', padding: '32px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 16px 0', width: '100%', textAlign: 'center' }}>Delete Live Class</h3>
            <div style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '15px' }}>
              Are you sure you want to delete this live class? This action cannot be undone.
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => setClassToDelete(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => handleDeleteLiveClass(classToDelete)}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{
            background: 'var(--bg-secondary)', padding: '24px', borderRadius: '12px',
            width: '100%', maxWidth: '500px', border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '20px' }}>Give Feedback</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>
              We value your feedback! Let us know how we can improve the platform.
            </p>
            <textarea
              value={feedbackContent}
              onChange={(e) => setFeedbackContent(e.target.value)}
              placeholder="Type your feedback here..."
              style={{
                width: '100%', height: '120px', padding: '12px', borderRadius: '8px',
                background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff', fontSize: '14px', resize: 'vertical', marginBottom: '16px'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => setShowFeedbackModal(false)}
                className="btn btn-secondary"
              >Cancel</button>
              <button 
                onClick={submitFeedback}
                className="btn btn-primary"
              >Submit Feedback</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
