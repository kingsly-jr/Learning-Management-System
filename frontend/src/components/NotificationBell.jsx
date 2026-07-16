import React from 'react';
import { apiFetch } from '../utils/api.js';

export default function NotificationBell({ 
  notifications, 
  showNotifDropdown, 
  setShowNotifDropdown, 
  fetchNotifications,
  navigate,
  user,
  addToast
}) {
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setShowNotifDropdown(prev => !prev);
    if (!showNotifDropdown) {
      fetchNotifications();
    }
  };

  const formatTimeAgo = (dateStr) => {
    try {
      const date = new Date(dateStr);
      const seconds = Math.floor((new Date() - date) / 1000);
      if (seconds < 60) return 'Just now';
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch (_) {
      return 'Recently';
    }
  };

  const markAllRead = async (e) => {
    e.stopPropagation();
    try {
      await apiFetch('/notifications/mark-read', { method: 'POST' });
      fetchNotifications();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleNotifClick = async (e, notif) => {
    e.stopPropagation();
    try {
      await apiFetch(`/notifications/${notif.id}/read`, { method: 'POST' });
      setShowNotifDropdown(false);
      fetchNotifications();
      if (notif.courseId) {
        if (user.role === 'ADMIN') {
          navigate('course-detail', { courseId: notif.courseId });
        } else if (user.role === 'INSTRUCTOR') {
          navigate('my-courses');
        } else if (user.role === 'STUDENT' || user.role === 'GRADUATE') {
          navigate('course-detail', { courseId: notif.courseId });
        }
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="notification-bell-container" style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={toggleDropdown}>
      <span style={{ fontSize: '20px', color: 'var(--text-secondary)' }}>🔔</span>
      {unreadCount > 0 && (
        <span className="notification-badge" id="notification-badge" style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '10px', fontWeight: 'bold', lineHeight: '1' }}>
          {unreadCount}
        </span>
      )}

      {showNotifDropdown && (
        <div className="notification-dropdown" id="notification-dropdown" style={{ display: 'block', position: 'absolute', top: '35px', right: 0, width: '320px', background: '#13152a', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', zIndex: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--glass-border)', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)' }}>Notifications</span>
            <button className="btn btn-link btn-xs" onClick={markAllRead} style={{ fontSize: '11px', padding: 0, textDecoration: 'none', color: 'var(--accent-blue)', background: 'none', border: 'none', cursor: 'pointer' }}>
              Mark all as read
            </button>
          </div>
          <div id="notification-items" style={{ maxHeight: '280px', overflowY: 'auto', padding: '6px' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>No notifications</div>
            ) : (
              notifications.map(n => {
                const itemStyle = n.isRead ? 
                  { padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '13px', color: 'var(--text-muted)', cursor: 'pointer', transition: 'background 0.2s' } :
                  { padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '13px', color: 'var(--text-primary)', fontWeight: '600', background: 'rgba(255,255,255,0.03)', cursor: 'pointer', transition: 'background 0.2s' };

                return (
                  <div 
                    key={n.id} 
                    className="notification-item" 
                    style={itemStyle} 
                    onClick={(e) => handleNotifClick(e, n)}
                  >
                    <div style={{ marginBottom: '4px' }}>{n.message}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formatTimeAgo(n.createdAt)}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
