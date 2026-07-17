import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api.js';
import StudentDashboardMock from '../components/StudentDashboardMock.jsx';
import InstructorDashboardMock from '../components/InstructorDashboardMock.jsx';
import AdminDashboardMock from '../components/AdminDashboardMock.jsx';

export default function Dashboard({ user, navigate, addToast, currentPage = 'dashboard' }) {
  const [stats, setStats] = useState(null);
  const [myCourses, setMyCourses] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      if (user.role === 'INSTRUCTOR') {
        const [dashData, instructorCourses, instructorStats] = await Promise.all([
          apiFetch('/instructor/dashboard/data'),
          apiFetch('/courses'),
          apiFetch('/analytics/instructor').catch(() => ({}))
        ]);
        setDashboardData(dashData || {});
        setStats({ ...(dashData?.stats || {}), ...instructorStats });
        setMyCourses(instructorCourses || []);
      } else if (user.role === 'ADMIN') {
        const [usersList, coursesList, categoriesList, activitiesList, notificationsList, feedbacksList, adminStats] = await Promise.all([
          apiFetch('/users'),
          apiFetch('/courses'),
          apiFetch('/categories'),
          apiFetch('/admin/activities').catch(() => []),
          apiFetch('/notifications').catch(() => []),
          apiFetch('/feedbacks/recent').catch(() => []),
          apiFetch('/analytics/admin').catch(() => ({})),
        ]);
        const numStudents = usersList ? usersList.filter(u => u.role === 'STUDENT').length : 0;
        const numInstructors = usersList ? usersList.filter(u => u.role === 'INSTRUCTOR').length : 0;
        setStats({
          totalStudents: numStudents,
          totalInstructors: numInstructors,
          totalCourses: coursesList ? coursesList.length : 0,
          totalCategories: categoriesList ? categoriesList.length : 0,
          ...adminStats
        });
        setDashboardData({
          users: usersList || [],
          courses: coursesList || [],
          categories: categoriesList || [],
          activities: activitiesList || [],
          notifications: notificationsList || [],
          feedbacks: feedbacksList || [],
        });
      } else {
        // STUDENT / GRADUATE
        // Fetch each independently so one failure doesn't blank the whole dashboard
        let dashData = null;
        let enrolledList = [];
        let allCourses = [];

        try { dashData = await apiFetch('/student/dashboard/data'); } catch (e) { console.warn('Dashboard data fetch failed:', e.message); }
        try { enrolledList = await apiFetch('/student/courses') || []; } catch (e) { console.warn('Enrolled courses fetch failed:', e.message); }
        try { allCourses = await apiFetch('/courses') || []; } catch (e) { console.warn('All courses fetch failed:', e.message); }

        setDashboardData(dashData || {});
        setStats(dashData?.stats || {});
        setMyCourses(enrolledList);
        // Exclude enrolled or unpublished courses from search catalog recommendations
        const enrolledIds = enrolledList.map(c => c.id);
        const filteredCatalog = allCourses.filter(c => c.published && !enrolledIds.includes(c.id));
        setCatalog(filteredCatalog);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const enrollInCourse = async (courseId) => {
    try {
      await apiFetch(`/student/courses/${courseId}/enroll`, { method: 'POST' });
      addToast('Successfully enrolled in course! 🎓', 'success');
      loadDashboardData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  if (loading) {
    return <div className="loading-overlay" style={{ position: 'relative', height: '100px' }}><div className="spinner"></div></div>;
  }

  // ─── ADMIN DASHBOARD ───
  if (user.role === 'ADMIN') {
    return (
      <AdminDashboardMock
        stats={stats}
        users={dashboardData?.users || []}
        courses={dashboardData?.courses || []}
        categories={dashboardData?.categories || []}
        activities={dashboardData?.activities || []}
        notifications={dashboardData?.notifications || []}
        feedbacks={dashboardData?.feedbacks || []}
        navigate={navigate}
        addToast={addToast}
        reloadData={loadDashboardData}
      />
    );
  }

  // ─── INSTRUCTOR DASHBOARD ───
  if (user.role === 'INSTRUCTOR') {
    return (
      <InstructorDashboardMock 
        user={user} 
        dashboardData={dashboardData} 
        myCourses={myCourses}
        navigate={navigate} 
        addToast={addToast} 
        reloadData={loadDashboardData} 
      />
    );
  }


  // ─── STUDENT / GRADUATE LEARNING DASHBOARD ───
  return (
    <div>
      {currentPage === 'dashboard' && dashboardData && (
        <StudentDashboardMock 
          user={user} 
          stats={stats} 
          dashboardData={dashboardData}
          myCourses={myCourses} 
          catalog={catalog} 
          navigate={navigate} 
          enrollInCourse={enrollInCourse} 
        />
      )}
      {/* Fallback for catalog view if needed */}
      {currentPage === 'catalog' && (
        <>
          <div className="section-header" style={{ marginTop: '0' }}>
            <h3>Recommended For You ({catalog.length})</h3>
          </div>

          <div className="courses-grid">
            {catalog.length === 0 ? (
              <div className="empty-state" style={{ width: '100%' }}>No new courses available. Check back soon!</div>
            ) : (
              catalog.map(c => (
                <div key={c.id} className="course-card">
                  <div className="course-thumb">
                    {c.thumbnailUrl ? <img src={c.thumbnailUrl} alt={c.title} /> : <div className="course-thumb-placeholder">📚</div>}
                    <span className="course-badge badge-published" style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase' }}>
                      Available
                    </span>
                  </div>
                  <div className="course-body">
                    <div className="course-category">{c.categoryName || 'Uncategorized'}</div>
                    <div className="course-title">{c.title}</div>
                    <div className="course-instructor">Instructed by: {c.instructorName || '—'}</div>
                    <div className="course-price">₹{(c.price || 0).toFixed(2)}</div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                      <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => navigate('course-detail', { courseId: c.id })}>
                        👁️ View Details
                      </button>
                      <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => enrollInCourse(c.id)}>
                        💳 Enroll Now
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
