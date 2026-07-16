import React, { useState } from 'react';
import { apiFetch } from '../utils/api.js';

export default function StudentDashboardMock({ user, stats, dashboardData, myCourses, catalog, navigate, enrollInCourse, addToast }) {
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
  const activeCourse = myCourses.length > 0
    ? [...myCourses].sort((a, b) => {
        const aProg = a.progressPercentage || 0;
        const bProg = b.progressPercentage || 0;
        if (aProg === 100 && bProg !== 100) return 1;
        if (bProg === 100 && aProg !== 100) return -1;
        return bProg - aProg;
      })[0]
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '40px' }}>
      
      {/* Welcome Banner */}
      <div style={{ background: 'var(--grad-primary)', padding: '2px', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ background: 'var(--bg-secondary)', padding: '32px', borderRadius: 'calc(var(--radius-lg) - 2px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>Welcome back, {user.username}! 👋</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Ready to crush your learning goals today?</p>
          </div>
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <div>
              <div style={{ fontSize: '14px', color: 'var(--accent-cyan)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Level</div>
              <div style={{ fontSize: '36px', fontWeight: '800' }}>Scholar</div>
            </div>
            <button 
              onClick={() => setShowFeedbackModal(true)}
              style={{
                background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)',
                padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                transition: 'var(--transition)'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            >
              💬 Give Feedback
            </button>
          </div>
        </div>
      </div>

      {/* 8 Stats Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>📚</div>
          <div className="stat-value">{stats?.totalEnrolledCourses || 0}</div>
          <div className="stat-label">Active Courses</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>✅</div>
          <div className="stat-value">{stats?.completedCourses || 0}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#eab308' }}>🏅</div>
          <div className="stat-value">{stats?.certificatesEarned || 0}</div>
          <div className="stat-label">Certificates</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>⏱️</div>
          <div className="stat-value">{stats?.learningHours ? stats.learningHours.toFixed(1) : '0'}h</div>
          <div className="stat-label">Learning Hours</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>✨</div>
          <div className="stat-value">{stats?.totalXp ? stats.totalXp.toLocaleString() : '0'}</div>
          <div className="stat-label">Total XP</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>🔥</div>
          <div className="stat-value">{stats?.currentStreak || 0} Days</div>
          <div className="stat-label">Current Streak</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(14, 165, 233, 0.15)', color: '#0ea5e9' }}>📝</div>
          <div className="stat-value">{stats?.averageQuizScore ? stats.averageQuizScore.toFixed(0) : '0'}%</div>
          <div className="stat-label">Avg Quiz Score</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e' }}>🎯</div>
          <div className="stat-value">{(stats?.learningHours || 0).toFixed(1)}/5</div>
          <div className="stat-label">Weekly Goal (hrs)</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
        
        {/* Left Column (Takes up 2/3 space roughly if wide enough) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', gridColumn: '1 / -1', '@media (minWidth: 1024px)': { gridColumn: 'span 2' } }}>
          
          {/* Continue Learning (Large Hero Card) */}
          {activeCourse ? (
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: '32px', border: '1px solid var(--glass-border)', display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: '1', minWidth: '300px' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--accent-purple)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
                  {activeCourse.progressPercentage === 100 ? 'COMPLETED' : 'RESUME LEARNING'}
                </div>
                <h2 style={{ fontSize: '28px', marginBottom: '8px', fontWeight: '700' }}>{activeCourse.title}</h2>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>👨‍🏫 Instructed by: {activeCourse.instructorName || 'Unknown Instructor'}</div>
                <div className="progress-bar-wrap" style={{ marginBottom: '24px' }}>
                  <div className="progress-label" style={{ marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Course Progress</span>
                    <strong>{Math.round(activeCourse.progressPercentage || 0)}%</strong>
                  </div>
                  <div className="progress-bar" style={{ height: '8px', background: 'var(--bg-primary)' }}>
                    <div className="progress-fill" style={{ width: `${activeCourse.progressPercentage || 0}%`, background: 'var(--accent-purple)' }}></div>
                  </div>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('course-detail', { courseId: activeCourse.id })} style={{ padding: '12px 32px', fontSize: '15px' }}>
                  {activeCourse.progressPercentage === 100 ? '🏅 Review Course' : '▶ Continue Learning'}
                </button>
              </div>
              {activeCourse.thumbnailUrl && (
                <div style={{ flex: '0 0 250px', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                  <img src={activeCourse.thumbnailUrl} alt={activeCourse.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
                </div>
              )}
            </div>
          ) : (
            <div className="empty-state" style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)' }}>
              <h3>No Active Courses</h3>
              <p>Check out the recommended courses below to get started!</p>
            </div>
          )}

          {/* Recommended Courses */}
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Recommended For You</h3>
            <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px' }}>
              {catalog.slice(0, 3).map(c => (
                <div key={c.id} className="course-card" style={{ minWidth: '280px', flex: '0 0 280px' }}>
                  <div className="course-thumb">
                    {c.thumbnailUrl ? <img src={c.thumbnailUrl} alt={c.title} /> : <div className="course-thumb-placeholder">📚</div>}
                  </div>
                  <div className="course-body">
                    <div className="course-title" style={{ fontSize: '16px' }}>{c.title}</div>
                    <div className="course-price" style={{ fontSize: '14px', marginBottom: '16px' }}>₹{(c.price || 0).toFixed(2)}</div>
                    <button className="btn btn-primary btn-sm btn-full" onClick={() => navigate('course-detail', { courseId: c.id })}>View Details</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline & Assignments */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px' }}>
            {/* Assignments & Quizzes */}
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: '24px', border: '1px solid var(--glass-border)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Pending Assignments</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {dashboardData?.pendingAssignments && dashboardData.pendingAssignments.length > 0 ? (
                  dashboardData.pendingAssignments.map(a => (
                    <div key={a.id} style={{ padding: '12px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid #f59e0b' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{a.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{a.lessonTitle}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-muted text-sm">No pending assignments! 🎉</div>
                )}
              </div>
            </div>

            {/* Recent Activity Timeline */}
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: '24px', border: '1px solid var(--glass-border)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Recent Activity</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
                <div style={{ position: 'absolute', left: '7px', top: '10px', bottom: '10px', width: '2px', background: 'var(--glass-border)' }}></div>
                {dashboardData?.recentActivity && dashboardData.recentActivity.length > 0 ? (
                  dashboardData.recentActivity.map(act => (
                    <div key={act.id} style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 1 }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#22c55e', marginTop: '2px' }}></div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{act.actionType}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{act.description} • {new Date(act.timestamp).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-muted text-sm" style={{ paddingLeft: '24px' }}>No recent activity.</div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (Sidebar Widgets) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Learning Streak + Weekly Goal */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: '24px', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '24px' }}>Weekly Goal</h3>
            <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto', borderRadius: '50%', background: 'conic-gradient(#3b82f6 40%, var(--bg-primary) 0)' }}>
              <div style={{ position: 'absolute', inset: '10px', background: 'var(--bg-secondary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>2h</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>of 5h</div>
              </div>
            </div>
            <p style={{ marginTop: '16px', fontSize: '14px', color: 'var(--text-muted)' }}>Keep going! You're on a 4-day streak! 🔥</p>
          </div>

          {/* Upcoming Live Classes */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: '24px', border: '1px solid var(--glass-border)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }}></span>
              Live Classes
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {dashboardData?.upcomingClasses && dashboardData.upcomingClasses.length > 0 ? (
                dashboardData.upcomingClasses.map(lc => (
                  <div key={lc.id} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>{lc.title}</div>
                    <div style={{ fontSize: '12px', color: '#3b82f6', marginBottom: '8px' }}>{new Date(lc.scheduledAt).toLocaleDateString()} ({new Date(lc.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {lc.endTime ? new Date(lc.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '?'}) • {lc.instructorName}</div>
                    <button className="btn btn-secondary btn-sm btn-full" onClick={() => window.open(lc.zoomLink, '_blank')}>Join Zoom</button>
                  </div>
                ))
              ) : (
                <div className="text-muted text-sm">No live classes scheduled.</div>
              )}
            </div>
          </div>

          {/* Leaderboard */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: '24px', border: '1px solid var(--glass-border)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>🏆 Leaderboard</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {dashboardData?.leaderboard && dashboardData.leaderboard.length > 0 ? (
                dashboardData.leaderboard.map((lb, index) => (
                  <div key={lb.username} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', background: lb.isCurrentUser ? 'var(--bg-primary)' : index === 0 ? 'rgba(234, 179, 8, 0.1)' : 'transparent', borderRadius: 'var(--radius-sm)', border: lb.isCurrentUser ? '1px solid #3b82f6' : 'none' }}>
                    <div style={{ fontWeight: 'bold', color: index === 0 ? '#eab308' : lb.isCurrentUser ? '#3b82f6' : 'var(--text-muted)' }}>#{index + 1}</div>
                    <div style={{ flex: 1, fontSize: '14px' }}>{lb.username} {lb.isCurrentUser ? '(You)' : ''}</div>
                    <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{(lb.xp || 0).toLocaleString()} XP</div>
                  </div>
                ))
              ) : (
                <div className="text-muted text-sm">No leaderboard data yet.</div>
              )}
            </div>
          </div>

        </div>

      </div>
      <style>{`
        @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.5); } 100% { opacity: 1; transform: scale(1); } }
      `}</style>
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
              We value your feedback! Let us know how we can improve your learning experience.
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
