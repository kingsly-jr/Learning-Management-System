import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';

export default function Sidebar({ user, currentPage, currentParams, navigate, logout }) {
  const { username, role } = user;
  const [firstCourseId, setFirstCourseId] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    // Fetch profile to get thumbnail url
    apiFetch('/users/profile')
      .then(data => {
        if (data && data.thumbnailUrl) {
          setAvatarUrl(data.thumbnailUrl);
        }
      }).catch(() => {});

    if (role === 'INSTRUCTOR') {
      apiFetch('/courses').then(data => {
        if (data && data.length > 0) {
          setFirstCourseId(data[0].id);
        }
      }).catch(() => {});
    }
  }, [role]);

  const getNavLinks = () => {
    const common = [{
      label: 'General',
      items: [{ id: 'dashboard', icon: '🏠', text: 'Dashboard' }]
    }];

    if (role === 'ADMIN') return [...common, {
      label: 'Administration',
      items: [
        { id: 'admin-users',        icon: '👥', text: 'Students' },
        { id: 'admin-instructors',  icon: '👨‍🏫', text: 'Instructors' },
        { id: 'admin-courses',      icon: '📚', text: 'All Courses' },
        { id: 'admin-cats',         icon: '🏷️', text: 'Categories' },
        { id: 'admin-payments',     icon: '💳', text: 'Payments' },
      ]
    }];

    if (role === 'INSTRUCTOR') return [...common, {
      label: 'Teaching',
      items: [
        { 
          id: 'my-courses', 
          icon: '📖', 
          text: 'My Courses'
        },
        { id: 'instructor-students', icon: '👥', text: 'Students' },
      ]
    }];

    // STUDENT
    return [...common, {
      label: 'Learning',
      items: [
        { id: 'catalog',      icon: '🛒', text: 'Course Catalog' },
        { id: 'my-learning',  icon: '📖', text: 'My Learning' },
        { id: 'certificates', icon: '🏅', text: 'Certificates' },
      ]
    }];
  };

  const handleNavClick = (itemId) => {
    if (itemId === 'admin-users') {
      navigate('admin-users', { filterRole: 'STUDENT' });
    } else if (itemId === 'admin-instructors') {
      navigate('admin-users', { filterRole: 'INSTRUCTOR' });
    } else {
      navigate(itemId);
    }
  };

  return (
    <nav className="sidebar" id="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">🎓</div>
          <h2>LearnSphere</h2>
        </div>
      </div>

      <div 
        className={`sidebar-user ${role === 'STUDENT' ? 'cursor-pointer' : ''}`} 
        id="sidebar-user" 
        onClick={() => { if (role === 'STUDENT') navigate('student-profile'); }}
        style={role === 'STUDENT' ? { cursor: 'pointer', transition: 'background-color 0.2s' } : {}}
        onMouseEnter={(e) => { if (role === 'STUDENT') e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
        onMouseLeave={(e) => { if (role === 'STUDENT') e.currentTarget.style.backgroundColor = 'transparent'; }}
      >
        <div className="flex items-center gap-3">
          <div className="user-avatar" id="user-avatar" style={{ overflow: 'hidden' }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              username[0].toUpperCase()
            )}
          </div>
          <div className="user-info">
            <div className="name truncate" id="sidebar-username">{username}</div>
            <span className={`role-badge ${role.toLowerCase()}`} id="sidebar-role-badge">{role}</span>
          </div>
        </div>
      </div>

      <div className="sidebar-nav" id="sidebar-nav">
        {getNavLinks().map((section, idx) => (
          <React.Fragment key={idx}>
            <div className="nav-section-label">{section.label}</div>
            {section.items.map(item => (
              item.submenu ? (
                <div key={item.id} className="nav-item-dropdown group" style={{ position: 'relative' }}>
                  <button 
                    className={`nav-item ${currentPage === 'my-courses' ? 'active' : ''}`}
                    onClick={() => handleNavClick(item.submenu[0].id)}
                  >
                    <span className="nav-icon">{item.icon}</span> {item.text}
                  </button>
                  <div 
                    className="dropdown-menu" 
                    style={{ 
                      position: 'absolute', 
                      left: '95%', 
                      top: '0', 
                      background: 'var(--bg-card)', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '8px', 
                      padding: '8px 0',
                      minWidth: '200px',
                      zIndex: 1000,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                      display: 'none'
                    }}
                  >
                    {item.submenu.map(subItem => (
                      <div 
                        key={subItem.id} 
                        style={{ padding: '10px 16px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '14px', transition: 'all 0.2s' }}
                        onClick={(e) => {
                           e.stopPropagation();
                           handleNavClick(subItem.id);
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                      >
                        {subItem.text}
                      </div>
                    ))}
                  </div>
                  <style>{`
                    .nav-item-dropdown:hover .dropdown-menu { display: block !important; }
                  `}</style>
                </div>
              ) : (
                <button 
                  key={item.id}
                  className={`nav-item ${
                    (currentPage !== 'admin-users' && currentPage === item.id) || 
                    (currentPage === 'admin-users' && item.id === 'admin-users' && currentParams?.filterRole !== 'INSTRUCTOR') ||
                    (currentPage === 'admin-users' && item.id === 'admin-instructors' && currentParams?.filterRole === 'INSTRUCTOR') 
                    ? 'active' : ''
                  }`}
                  onClick={() => handleNavClick(item.id)}
                >
                  <span className="nav-icon">{item.icon}</span> {item.text}
                </button>
              )
            ))}
          </React.Fragment>
        ))}
      </div>

      <div className="sidebar-footer">
        <button className="btn btn-secondary btn-full btn-sm" onClick={() => setShowLogoutConfirm(true)} id="logout-btn">
          🚪 Sign Out
        </button>
      </div>

      {showLogoutConfirm && (
        <div className="modal-overlay open" onClick={() => setShowLogoutConfirm(false)} style={{ zIndex: 1000 }}>
          <div className="modal" style={{ width: '400px', textAlign: 'center', padding: '32px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 16px 0', width: '100%', textAlign: 'center' }}>Sign Out</h3>
            <div style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '15px' }}>
              Are you sure you want to sign out of the website?
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => { setShowLogoutConfirm(false); logout(); }}>Yes, Sign Out</button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
