import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api.js';
import CertificateGenerator from '../components/CertificateGenerator.jsx';

export default function StudentMyLearning({ user, navigate, addToast }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [certEnrollment, setCertEnrollment] = useState(null); // null = hidden

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const list = await apiFetch('/student/courses');
        setCourses(list || []);
      } catch (err) {
        addToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <div className="loading-overlay" style={{ position: 'relative', height: '100px' }}><div className="spinner"></div></div>;
  }

  return (
    <div>
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <h3>My Enrolled Courses ({courses.length})</h3>
      </div>

      {courses.length === 0 ? (
        <div className="empty-state" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>No Courses Yet</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>You haven't enrolled in any courses yet. Explore the catalog to get started!</p>
          <button className="btn btn-primary" onClick={() => navigate('catalog')}>Browse Course Catalog</button>
        </div>
      ) : (
        <div className="courses-grid">
          {courses.map(c => {
            const progress = c.progressPercentage || 0;
            const isCompleted = progress >= 100;

            return (
              <div key={c.id} className="course-card" style={{ cursor: 'pointer' }} onClick={() => navigate('course-detail', { courseId: c.id })}>
                <div className="course-thumb">
                  {c.thumbnailUrl ? <img src={c.thumbnailUrl} alt={c.title} /> : <div className="course-thumb-placeholder">📖</div>}
                  <span
                    className={`course-badge ${isCompleted ? 'badge-published' : 'badge-draft'}`}
                    style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase' }}
                  >
                    {isCompleted ? '✅ Completed' : 'In Progress'}
                  </span>
                </div>
                <div className="course-body">
                  <div className="course-category">{c.categoryName || 'Uncategorized'}</div>
                  <div className="course-title">{c.title}</div>
                  <div className="course-instructor" style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    👨‍🏫 {c.instructorName || 'Unknown Instructor'}
                  </div>

                  {/* Progress Bar */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Progress</span>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: isCompleted ? '#22c55e' : 'var(--accent-blue)' }}>{Math.round(progress)}%</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${progress}%`,
                        height: '100%',
                        background: isCompleted ? '#22c55e' : 'var(--grad-primary)',
                        borderRadius: '3px',
                        transition: 'width 0.5s ease'
                      }}></div>
                    </div>
                  </div>

                  <button
                    className={`btn ${isCompleted ? 'btn-secondary' : 'btn-primary'} btn-sm btn-full`}
                    style={{ marginBottom: isCompleted ? '8px' : '0' }}
                    onClick={(e) => { e.stopPropagation(); navigate('course-detail', { courseId: c.courseId || c.id }); }}
                  >
                    {isCompleted ? '🏅 Review Course' : '▶ Continue Learning'}
                  </button>

                  {isCompleted && (
                    <button
                      className="btn btn-primary btn-sm btn-full"
                      style={{
                        background: 'linear-gradient(135deg, #c8960c, #f5c518)',
                        color: '#000',
                        fontWeight: '700',
                        border: 'none',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCertEnrollment(c);
                      }}
                    >
                      🎓 Download Certificate
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Certificate Modal */}
      {certEnrollment && (
        <CertificateGenerator
          enrollment={certEnrollment}
          user={user}
          onClose={() => setCertEnrollment(null)}
        />
      )}
    </div>
  );
}
