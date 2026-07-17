import React, { useState } from 'react';
import { apiFetch } from '../utils/api.js';

export default function AdminDashboardMock({ stats, users, courses, categories, activities, notifications, feedbacks, navigate, addToast, reloadData }) {
  const [notifList, setNotifList] = useState(notifications || []);
  const [feedbackList, setFeedbackList] = useState(feedbacks || []);
  const [replyText, setReplyText] = useState({});
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'COURSE' | 'CATEGORY', id: number }

  // ── Data prep ──
  const publishedCourses = courses?.filter(c => c.published) || [];
  const draftCourses = courses?.filter(c => !c.published && c.reviewStatus !== 'PENDING') || [];
  const newestUsers = [...(users || [])].sort((a, b) => b.id - a.id).slice(0, 5);
  const latestCourses = [...(courses || [])].sort((a, b) => b.id - a.id).slice(0, 5);
  const latestCategories = [...(categories || [])].sort((a, b) => b.id - a.id).slice(0, 5);
  const recentActivities = (activities || []).slice(0, 8);

  // Category distribution
  const categoryMap = {};
  (courses || []).forEach(c => {
    const cat = c.categoryName || 'Uncategorized';
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });
  const categoryEntries = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);
  const maxCategoryCount = categoryEntries.length > 0 ? categoryEntries[0][1] : 1;

  // User distribution
  const studentCount = (users || []).filter(u => u.role === 'STUDENT').length;
  const instructorCount = (users || []).filter(u => u.role === 'INSTRUCTOR').length;
  const adminCount = (users || []).filter(u => u.role === 'ADMIN').length;
  const totalUsers = studentCount + instructorCount + adminCount;

  const categoryColors = [
    '#3b82f6', '#22c55e', '#a855f7', '#eab308', '#ef4444',
    '#06b6d4', '#ec4899', '#f97316', '#14b8a6', '#8b5cf6',
    '#64748b', '#e11d48',
  ];

  // ── Handlers ──
  const deleteCourse = (id) => {
    setDeleteTarget({ type: 'COURSE', id });
  };

  const deleteCategory = (id) => {
    setDeleteTarget({ type: 'CATEGORY', id });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'COURSE') {
        await apiFetch(`/courses/${deleteTarget.id}`, { method: 'DELETE' });
        addToast('Course deleted successfully', 'success');
      } else if (deleteTarget.type === 'CATEGORY') {
        await apiFetch(`/categories/${deleteTarget.id}`, { method: 'DELETE' });
        addToast('Category deleted successfully', 'success');
      }
      reloadData();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  const markNotifRead = async (id) => {
    try {
      await apiFetch(`/notifications/${id}/read`, { method: 'POST' });
      setNotifList(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) { addToast(err.message, 'error'); }
  };

  const clearAllNotifs = async () => {
    try {
      await apiFetch('/notifications/clear-all', { method: 'DELETE' });
      setNotifList([]);
      addToast('All notifications cleared', 'success');
    } catch (err) { addToast(err.message, 'error'); }
  };

  const markFeedbackRead = async (id) => {
    try {
      await apiFetch(`/feedbacks/${id}/read`, { method: 'POST' });
      setFeedbackList(prev => prev.map(f => f.id === id ? { ...f, isRead: true } : f));
    } catch (err) { addToast(err.message, 'error'); }
  };

  const submitReply = async (id) => {
    const content = replyText[id];
    if (!content || !content.trim()) return;
    
    try {
      await apiFetch(`/feedbacks/${id}/reply`, { 
        method: 'POST',
        body: JSON.stringify({ replyContent: content })
      });
      addToast('Reply sent successfully', 'success');
      setFeedbackList(prev => prev.map(f => f.id === id ? { ...f, isRead: true } : f));
      setReplyingTo(null);
      setReplyText(prev => ({ ...prev, [id]: '' }));
    } catch (err) { addToast(err.message, 'error'); }
  };


  const markAllRead = async () => {
    try {
      await apiFetch('/notifications/mark-read', { method: 'POST' });
      setNotifList(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) { addToast(err.message, 'error'); }
  };

  // ── Helpers ──
  const roleBadge = (role) => {
    const styles = {
      STUDENT: { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa', text: 'Student' },
      INSTRUCTOR: { bg: 'rgba(34,197,94,0.15)', color: '#4ade80', text: 'Instructor' },
      ADMIN: { bg: 'rgba(168,85,247,0.15)', color: '#c084fc', text: 'Admin' },
    };
    const s = styles[role] || styles.STUDENT;
    return (
      <span style={{ background: s.bg, color: s.color, fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {s.text}
      </span>
    );
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const activityIcon = (type) => {
    const icons = {
      COURSE_CREATED: '📗', COURSE_DRAFTED: '📝', COURSE_DELETED: '🗑️',
      COURSE_APPROVED: '✅', COURSE_REJECTED: '❌',
      CATEGORY_CREATED: '🏷️', CATEGORY_DELETED: '🗑️',
      USER_JOINED: '👤', ENROLLMENT: '🎓',
    };
    return icons[type] || '📋';
  };

  const notifIcon = (type) => {
    const icons = {
      COURSE_SUBMITTED: '📤', COURSE_APPROVED: '✅', COURSE_REJECTED: '❌',
    };
    return icons[type] || '🔔';
  };

  const statusBadge = (course) => {
    const label = course.reviewStatus === 'APPROVED' ? 'Published' : course.reviewStatus === 'PENDING' ? 'Pending' : course.reviewStatus === 'REJECTED' ? 'Rejected' : 'Draft';
    const colors = {
      APPROVED: { bg: 'rgba(34,197,94,0.15)', color: '#4ade80' },
      PENDING: { bg: 'rgba(234,179,8,0.15)', color: '#facc15' },
      REJECTED: { bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
      DRAFT: { bg: 'rgba(113,113,122,0.15)', color: '#a1a1aa' },
    };
    const c = colors[course.reviewStatus] || colors.DRAFT;
    return (
      <span style={{ background: c.bg, color: c.color, fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', textTransform: 'uppercase' }}>
        {label}
      </span>
    );
  };

  // ── Shared styles ──
  const cardStyle = {
    background: 'var(--bg-card)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--radius-md)',
    padding: '24px',
  };
  const cardHeaderStyle = {
    fontSize: '15px', fontWeight: 700, marginBottom: '16px',
    display: 'flex', alignItems: 'center', gap: '10px',
  };
  const iconBoxStyle = (bg) => ({
    width: '32px', height: '32px', borderRadius: '8px',
    background: bg, display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '15px', flexShrink: 0,
  });
  const smallBtnStyle = (bg, color) => ({
    background: bg, color: color, border: 'none', borderRadius: '6px',
    padding: '4px 10px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
    transition: 'var(--transition)',
  });

  // ── Stat cards ──
  const statCards = [
    {
      icon: '👥', value: stats?.totalStudents || 0, label: 'Total Students',
      gradient: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(37,99,235,0.05))',
      border: 'rgba(59,130,246,0.3)', iconBg: 'rgba(59,130,246,0.15)',
      onClick: () => navigate('admin-users', { filterRole: 'STUDENT' }),
    },
    {
      icon: '👨‍🏫', value: stats?.totalInstructors || 0, label: 'Instructors',
      gradient: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(22,163,74,0.05))',
      border: 'rgba(34,197,94,0.3)', iconBg: 'rgba(34,197,94,0.15)',
      onClick: () => navigate('admin-users', { filterRole: 'INSTRUCTOR' }),
    },
    {
      icon: '📚', value: stats?.totalCourses || 0, label: 'Courses',
      gradient: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(147,51,234,0.05))',
      border: 'rgba(168,85,247,0.3)', iconBg: 'rgba(168,85,247,0.15)',
      onClick: () => navigate('admin-courses'),
    },
    {
      icon: '🏷️', value: stats?.totalCategories || 0, label: 'Categories',
      gradient: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(8,145,178,0.05))',
      border: 'rgba(6,182,212,0.3)', iconBg: 'rgba(6,182,212,0.15)',
      onClick: () => navigate('admin-cats'),
    },
  ];

  // ── Quick Actions ──
  const quickActions = [
    { icon: '➕', label: 'Create Course', desc: 'Add a new course', bg: 'rgba(168,85,247,0.15)', color: '#c084fc', onClick: () => navigate('admin-courses', { openNewCourse: true }) },
    { icon: '🏷️', label: 'Create Category', desc: 'Add a new tag', bg: 'rgba(6,182,212,0.15)', color: '#22d3ee', onClick: () => navigate('admin-cats') },
    { icon: '👥', label: 'View Students', desc: 'Manage students', bg: 'rgba(59,130,246,0.15)', color: '#60a5fa', onClick: () => navigate('admin-users', { filterRole: 'STUDENT' }) },
    { icon: '👨‍🏫', label: 'View Instructors', desc: 'Manage instructors', bg: 'rgba(34,197,94,0.15)', color: '#4ade80', onClick: () => navigate('admin-users', { filterRole: 'INSTRUCTOR' }) },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>

      {/* ═══ ROW 1: STAT CARDS ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {statCards.map((card, i) => (
          <div key={i} className="stat-card" onClick={card.onClick} style={{
            cursor: 'pointer', background: card.gradient,
            border: `1px solid ${card.border}`, position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '12px',
              background: card.iconBg, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '20px', marginBottom: '14px',
            }}>{card.icon}</div>
            <div className="stat-value">{card.value}</div>
            <div className="stat-label">{card.label}</div>
          </div>
        ))}
      </div>

      {/* ═══ ROW 2: REVENUE CARDS ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
        {[
          { icon: '💰', value: `₹${(stats?.totalCourseSales || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, label: 'Total Sales', bg: 'rgba(234,179,8,0.15)', color: '#eab308' },
          { icon: '🏛️', value: `₹${(stats?.totalGstCollected || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, label: 'GST Collected', bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
          { icon: '📈', value: `₹${(stats?.totalNetRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, label: 'Net Revenue', bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
          { icon: '💼', value: `₹${(stats?.totalPlatformEarnings || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, label: 'Platform (80%)', bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
          { icon: '👨‍🏫', value: `₹${(stats?.totalInstructorPayout || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, label: 'Instructors (20%)', bg: 'rgba(139,92,246,0.15)', color: '#8b5cf6' },
        ].map((card, i) => (
          <div key={i} className="stat-card" style={{
            background: 'var(--bg-card)',
            border: `1px solid ${card.bg}`, position: 'relative', overflow: 'hidden', padding: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: card.bg, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '18px'
              }}>{card.icon}</div>
              <div className="stat-label" style={{ margin: 0 }}>{card.label}</div>
            </div>
            <div className="stat-value" style={{ fontSize: '20px', color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* ═══ MASONRY 2-COLUMN LAYOUT ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'stretch' }}>

        {/* ── LEFT COLUMN ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>

          {/* Quick Actions */}
          <div style={cardStyle}>
            <h3 style={cardHeaderStyle}>
              <span style={iconBoxStyle('rgba(234,179,8,0.15)')}>⚡</span>
              Quick Actions
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {quickActions.map((a, i) => (
                <div key={i} onClick={a.onClick} style={{
                  cursor: 'pointer', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px',
                  borderRadius: '10px', background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)', transition: 'var(--transition)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                >
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: a.bg, color: a.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>{a.icon}</div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{a.label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>{a.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Latest Courses */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ ...cardHeaderStyle, marginBottom: 0 }}>
                <span style={iconBoxStyle('rgba(168,85,247,0.15)')}>📚</span>
                Latest Courses
              </h3>
              <button onClick={() => navigate('admin-courses')} style={{ ...smallBtnStyle('rgba(255,255,255,0.06)', 'var(--text-secondary)'), fontSize: '12px' }}>View All →</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {latestCourses.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No courses yet.</div>
              ) : latestCourses.map(c => (
                <div key={c.id} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 12px', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{c.instructorName || '—'} • {c.categoryName || 'Uncategorized'}</div>
                  </div>
                  {statusBadge(c)}
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <button onClick={() => navigate('course-detail', { courseId: c.id })} style={smallBtnStyle('rgba(59,130,246,0.15)', '#60a5fa')}>View</button>
                    <button onClick={() => navigate('admin-courses')} style={smallBtnStyle('rgba(234,179,8,0.15)', '#facc15')}>Edit</button>
                    <button onClick={() => deleteCourse(c.id)} style={smallBtnStyle('rgba(239,68,68,0.15)', '#f87171')}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Course Distribution */}
          <div style={cardStyle}>
            <h3 style={cardHeaderStyle}>
              <span style={iconBoxStyle('rgba(168,85,247,0.15)')}>📊</span>
              Course Distribution
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {categoryEntries.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No course data available.</div>
              ) : categoryEntries.slice(0, 8).map(([cat, count], i) => (
                <div key={cat} onClick={() => navigate('admin-courses')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 500 }}>{cat}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>{count} course{count !== 1 ? 's' : ''}</span>
                  </div>
                  <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: '3px',
                      width: `${(count / maxCategoryCount) * 100}%`,
                      background: categoryColors[i % categoryColors.length],
                      transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activities */}
          <div style={{ ...cardStyle, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={cardHeaderStyle}>
              <span style={iconBoxStyle('rgba(234,179,8,0.15)')}>📋</span>
              Recent Activities
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, overflowY: 'auto' }}>
              {recentActivities.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No recent activities.</div>
              ) : recentActivities.map(a => (
                <div key={a.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '10px',
                  padding: '10px 12px', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                  cursor: a.targetType === 'COURSE' && a.targetId ? 'pointer' : 'default',
                }}
                onClick={() => {
                  if (a.targetType === 'COURSE' && a.targetId) navigate('course-detail', { courseId: a.targetId });
                  else if (a.targetType === 'CATEGORY') navigate('admin-cats');
                  else if (a.targetType === 'USER') navigate('admin-users');
                }}>
                  <div style={{ fontSize: '18px', flexShrink: 0, marginTop: '1px' }}>{activityIcon(a.actionType)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: 500, lineHeight: '1.4' }}>{a.description}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>{timeAgo(a.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>

          {/* Newest Members */}
          <div style={cardStyle}>
            <h3 style={cardHeaderStyle}>
              <span style={iconBoxStyle('rgba(59,130,246,0.15)')}>🧑‍💻</span>
              Newest Members
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {newestUsers.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No users found.</div>
              ) : newestUsers.map(u => (
                <div key={u.id} onClick={() => navigate('admin-users', { filterRole: u.role })} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '8px 12px', borderRadius: '8px', cursor: 'pointer',
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                  transition: 'var(--transition)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                >
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(168,85,247,0.3))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', fontWeight: 700, color: '#fff', flexShrink: 0, overflow: 'hidden',
                  }}>
                    {u.thumbnailUrl
                      ? <img src={u.thumbnailUrl} alt={u.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : u.username?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.username}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{u.email}</div>
                  </div>
                  {roleBadge(u.role)}
                </div>
              ))}
            </div>
          </div>

          {/* Latest Categories */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ ...cardHeaderStyle, marginBottom: 0 }}>
                <span style={iconBoxStyle('rgba(6,182,212,0.15)')}>🏷️</span>
                Latest Categories
              </h3>
              <button onClick={() => navigate('admin-cats')} style={{ ...smallBtnStyle('rgba(255,255,255,0.06)', 'var(--text-secondary)'), fontSize: '12px' }}>View All →</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {latestCategories.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No categories yet.</div>
              ) : latestCategories.map(cat => (
                <div key={cat.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{cat.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{cat.description || 'No description'}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <button onClick={() => navigate('admin-cats')} style={smallBtnStyle('rgba(234,179,8,0.15)', '#facc15')}>Edit</button>
                    <button onClick={() => deleteCategory(cat.id)} style={smallBtnStyle('rgba(239,68,68,0.15)', '#f87171')}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Distribution */}
          <div style={cardStyle}>
            <h3 style={cardHeaderStyle}>
              <span style={iconBoxStyle('rgba(34,197,94,0.15)')}>👥</span>
              User Distribution
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: 'Students', count: studentCount, color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', role: 'STUDENT' },
                { label: 'Instructors', count: instructorCount, color: '#22c55e', bg: 'rgba(34,197,94,0.15)', role: 'INSTRUCTOR' },
                { label: 'Admins', count: adminCount, color: '#a855f7', bg: 'rgba(168,85,247,0.15)', role: 'ADMIN' },
              ].map(r => (
                <div key={r.label} onClick={() => navigate('admin-users', { filterRole: r.role })} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: r.color }} />
                      <span style={{ fontSize: '13px', fontWeight: 500 }}>{r.label}</span>
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>{r.count} ({totalUsers > 0 ? Math.round((r.count / totalUsers) * 100) : 0}%)</span>
                  </div>
                  <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: '4px',
                      width: totalUsers > 0 ? `${(r.count / totalUsers) * 100}%` : '0%',
                      background: r.color,
                      transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
                    }} />
                  </div>
                </div>
              ))}
              {/* Summary */}
              <div style={{
                marginTop: '4px', padding: '12px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                display: 'flex', justifyContent: 'space-around', textAlign: 'center',
              }}>
                {[
                  { v: studentCount, l: 'Students', c: '#3b82f6' },
                  { v: instructorCount, l: 'Instructors', c: '#22c55e' },
                  { v: adminCount, l: 'Admins', c: '#a855f7' },
                ].map(s => (
                  <div key={s.l}>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: s.c, fontFamily: "'Space Grotesk', sans-serif" }}>{s.v}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ ...cardHeaderStyle, marginBottom: 0 }}>
                <span style={iconBoxStyle('rgba(239,68,68,0.15)')}>🔔</span>
                Notifications
                {notifList.filter(n => !n.isRead).length > 0 && (
                  <span style={{
                    background: 'rgba(239,68,68,0.9)', color: '#fff', fontSize: '10px', fontWeight: 700,
                    padding: '2px 7px', borderRadius: '10px', marginLeft: '4px',
                  }}>{notifList.filter(n => !n.isRead).length}</span>
                )}
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={markAllRead} style={smallBtnStyle('rgba(59,130,246,0.15)', '#60a5fa')}>Mark All Read</button>
                <button onClick={clearAllNotifs} style={smallBtnStyle('rgba(239,68,68,0.15)', '#f87171')}>Clear All</button>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '320px', overflowY: 'auto' }}>
              {notifList.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No notifications.</div>
              ) : notifList.map(n => (
                <div key={n.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '10px',
                  padding: '10px 12px', borderRadius: '8px',
                  background: n.isRead ? 'rgba(255,255,255,0.01)' : 'rgba(59,130,246,0.05)',
                  border: `1px solid ${n.isRead ? 'rgba(255,255,255,0.04)' : 'rgba(59,130,246,0.15)'}`,
                  cursor: 'pointer', opacity: n.isRead ? 0.7 : 1,
                  transition: 'var(--transition)',
                }}
                onClick={() => {
                  if (!n.isRead) markNotifRead(n.id);
                  if (n.courseId) navigate('course-detail', { courseId: n.courseId });
                }}>
                  <div style={{ fontSize: '18px', flexShrink: 0, marginTop: '1px' }}>{notifIcon(n.type)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: n.isRead ? 400 : 600, lineHeight: '1.4' }}>{n.message}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>
                      {n.senderUsername && <span>from {n.senderUsername} • </span>}
                      {timeAgo(n.createdAt)}
                    </div>
                  </div>
                  {!n.isRead && (
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', flexShrink: 0, marginTop: '5px' }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Feedback */}
          <div style={{ ...cardStyle, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={cardHeaderStyle}>
              <span style={iconBoxStyle('rgba(168,85,247,0.15)')}>💬</span>
              Recent Feedback
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' }}>
              {feedbackList.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No feedback yet.</div>
              ) : feedbackList.map(f => (
                <div key={f.id} style={{
                  display: 'flex', flexDirection: 'column', gap: '8px',
                  padding: '12px', borderRadius: '8px',
                  background: f.isRead ? 'rgba(255,255,255,0.01)' : 'rgba(168,85,247,0.05)',
                  border: `1px solid ${f.isRead ? 'rgba(255,255,255,0.04)' : 'rgba(168,85,247,0.2)'}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>{f.username}</div>
                      {roleBadge(f.userRole)}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{timeAgo(f.createdAt)}</div>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                    {f.content}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    {!f.isRead && (
                      <button onClick={() => markFeedbackRead(f.id)} style={smallBtnStyle('rgba(255,255,255,0.05)', '#fff')}>Mark as Read</button>
                    )}
                    <button onClick={() => setReplyingTo(replyingTo === f.id ? null : f.id)} style={smallBtnStyle('rgba(59,130,246,0.15)', '#60a5fa')}>
                      {replyingTo === f.id ? 'Cancel Reply' : 'Reply'}
                    </button>
                  </div>
                  
                  {replyingTo === f.id && (
                    <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                      <input 
                        type="text" 
                        placeholder="Type your reply..." 
                        value={replyText[f.id] || ''} 
                        onChange={(e) => setReplyText(prev => ({ ...prev, [f.id]: e.target.value }))}
                        style={{
                          flex: 1, padding: '8px 12px', borderRadius: '6px', 
                          border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)',
                          color: '#fff', fontSize: '12px'
                        }}
                      />
                      <button onClick={() => submitReply(f.id)} style={smallBtnStyle('#3b82f6', '#fff')}>Send</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pulse animation keyframe */}
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.4); }
        }
      `}</style>
      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="modal-overlay open" onClick={() => setDeleteTarget(null)} style={{ zIndex: 1000 }}>
          <div className="modal" style={{ width: '400px', textAlign: 'center', padding: '32px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 16px 0', width: '100%', textAlign: 'center' }}>
              Delete {deleteTarget.type === 'COURSE' ? 'Course' : 'Category'}
            </h3>
            <div style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '15px' }}>
              Are you sure you want to delete this {deleteTarget.type === 'COURSE' ? 'course' : 'category'}? This action cannot be undone.
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
