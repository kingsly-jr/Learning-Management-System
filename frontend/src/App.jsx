import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.jsx';
import NotificationBell from './components/NotificationBell.jsx';
import LandingPage from './pages/LandingPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import CourseDetail from './pages/CourseDetail.jsx';
import LessonWorkspace from './pages/LessonWorkspace.jsx';
import StudentLessonView from './pages/StudentLessonView.jsx';
import MyCourses from './pages/MyCourses.jsx';
import AdminCourses from './pages/AdminCourses.jsx';
import AdminUsers from './pages/AdminUsers.jsx';
import AdminAddInstructor from './pages/AdminAddInstructor.jsx';
import AdminAddStudent from './pages/AdminAddStudent.jsx';
import PublicRegister from './pages/PublicRegister.jsx';
import CategoriesPage from './pages/CategoriesPage.jsx';
import StudentMyLearning from './pages/StudentMyLearning.jsx';
import AdminPayments from './pages/AdminPayments.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import InstructorLogin from './pages/InstructorLogin.jsx';
import PaymentSuccess from './pages/PaymentSuccess.jsx';
import StudentProfile from './pages/StudentProfile.jsx';
import { apiFetch } from './utils/api.js';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('lms_token') || null);
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('lms_user');
    return raw ? JSON.parse(raw) : null;
  });

  // State-based router with URL sync on load
  const [currentPage, setCurrentPage] = useState(() => {
    let path = window.location.pathname;
    if (path.endsWith('/') && path.length > 1) path = path.slice(0, -1);
    
    if (path === '/admin') return 'admin-users';
    if (path === '/instructor') return 'my-courses';
    return 'dashboard';
  });
  const [currentParams, setCurrentParams] = useState({});
  const [navigationHistory, setNavigationHistory] = useState([currentPage]);

  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState([]);

  // Public Landing Page Tab
  const [publicTab, setPublicTab] = useState('home'); // 'home' or 'courses'

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const login = (jwtToken, userDetails) => {
    localStorage.setItem('lms_token', jwtToken);
    localStorage.setItem('lms_user', JSON.stringify(userDetails));
    setToken(jwtToken);
    setUser(userDetails);
    addToast(`Welcome back, ${userDetails.username}! 👋`, 'success');
    setCurrentPage('dashboard');
    setNavigationHistory(['dashboard']);
  };

  const logout = () => {
    localStorage.removeItem('lms_token');
    localStorage.removeItem('lms_user');
    setToken(null);
    setUser(null);
    setCurrentPage('dashboard');
    setNavigationHistory(['dashboard']);
    setPublicTab('home');
    addToast('Signed out successfully.', 'info');
  };

  const navigate = (pageId, params = {}) => {
    setCurrentPage(pageId);
    setCurrentParams(params);
    setNavigationHistory(prev => {
      if (prev[prev.length - 1] === pageId) return prev;
      return [...prev, pageId];
    });

    // Sync URL with state
    let newPath = '/';
    if (pageId.startsWith('admin-')) newPath = '/admin';
    else if (pageId === 'instructor-students' || pageId === 'create-course' || pageId === 'my-courses') {
      if (user?.role === 'INSTRUCTOR') newPath = '/instructor';
    }
    window.history.pushState({}, '', newPath);

    // Scroll view to top automatically on page transitions
    window.scrollTo(0, 0);
  };

  const goBack = () => {
    if (navigationHistory.length <= 1) return;
    const history = [...navigationHistory];
    history.pop(); // Remove current page
    const prevPage = history[history.length - 1];
    setNavigationHistory(history);
    setCurrentPage(prevPage);
  };

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const data = await apiFetch('/notifications');
      setNotifications(data || []);
    } catch (_) {}
  };

  useEffect(() => {
    if (token) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [token]);

  // Click outside to close notification bell dropdown
  useEffect(() => {
    const handleOutsideClick = () => setShowNotifDropdown(false);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const renderContent = () => {
    if (!token) {
      let path = window.location.pathname;
      if (path.endsWith('/') && path.length > 1) path = path.slice(0, -1);

      if (path === '/admin') {
        return <AdminLogin login={login} addToast={addToast} />;
      }
      if (path === '/instructor') {
        return <InstructorLogin login={login} addToast={addToast} />;
      }
      if (currentPage === 'course-detail') {
        return <CourseDetail courseId={currentParams.courseId} currentParams={currentParams} user={null} navigate={navigate} addToast={addToast} fetchNotifications={() => {}} />;
      }
      if (currentPage === 'register') {
        return <PublicRegister navigate={navigate} addToast={addToast} setAuthTab={() => {}} setShowAuthModal={() => {}} />;
      }
      return (
        <LandingPage 
          login={login} 
          addToast={addToast} 
          publicTab={publicTab} 
          setPublicTab={setPublicTab} 
          navigate={navigate}
        />
      );
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard currentPage={currentPage} user={user} navigate={navigate} addToast={addToast} />;
      case 'student-profile':
        return <StudentProfile user={user} navigate={navigate} addToast={addToast} />;
      case 'course-detail':
        return <CourseDetail courseId={currentParams.courseId} currentParams={currentParams} user={user} navigate={navigate} addToast={addToast} fetchNotifications={fetchNotifications} />;
      case 'lesson-workspace':
        return <LessonWorkspace courseId={currentParams.courseId} lessonId={currentParams.lessonId} user={user} navigate={navigate} addToast={addToast} />;
      case 'student-lesson-view':
        return <StudentLessonView courseId={currentParams.courseId} lessonId={currentParams.lessonId} user={user} navigate={navigate} addToast={addToast} />;
      case 'my-learning':
        return <StudentMyLearning user={user} navigate={navigate} addToast={addToast} />;
      case 'catalog':
        return <Dashboard currentPage="catalog" user={user} navigate={navigate} addToast={addToast} />;
      case 'certificates':
        return <Dashboard currentPage="certificates" user={user} navigate={navigate} addToast={addToast} />;
      case 'my-courses':
      case 'create-course':
      case 'edit-course':
      case 'instructor-students':
        return <MyCourses view={currentPage} course={currentParams.course} navigate={navigate} addToast={addToast} />;
      case 'admin-courses':
        return <AdminCourses currentParams={currentParams} navigate={navigate} addToast={addToast} fetchNotifications={fetchNotifications} />;
      case 'admin-users':
        return <AdminUsers filterRole={currentParams.filterRole || 'STUDENT'} navigate={navigate} addToast={addToast} />;
      case 'admin-add-instructor':
        return <AdminAddInstructor navigate={navigate} addToast={addToast} editMode={false} />;
      case 'admin-edit-instructor':
        return <AdminAddInstructor navigate={navigate} addToast={addToast} editMode={true} instructorId={currentParams.instructorId} />;
      case 'admin-view-instructor':
        return <AdminAddInstructor navigate={navigate} addToast={addToast} editMode={true} readOnly={true} instructorId={currentParams.instructorId} />;
      case 'admin-add-student':
        return <AdminAddStudent navigate={navigate} addToast={addToast} />;
      case 'admin-cats':
        return <CategoriesPage navigate={navigate} addToast={addToast} />;
      case 'admin-payments':
        return <AdminPayments navigate={navigate} addToast={addToast} />;
      case 'payment-success':
        return <PaymentSuccess navigate={navigate} />;
      default:
        return <Dashboard currentPage={currentPage} user={user} navigate={navigate} addToast={addToast} />;
    }
  };

  const isHomeOrNotLoggedIn = !token;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Toast alerts */}
      <div className="toast-container" id="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span>{t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️'}</span>
            <div>{t.message}</div>
          </div>
        ))}
      </div>

      {isHomeOrNotLoggedIn ? (
        renderContent()
      ) : (
        <div id="app-shell" className="visible" style={{ flex: 1, display: 'flex' }}>
          
          <Sidebar user={user} currentPage={currentPage} currentParams={currentParams} navigate={navigate} logout={logout} />

          <div className="main-content">
            <header className="topbar">
              <div className="topbar-title">
                {navigationHistory.length > 1 && (
                  <button className="btn btn-secondary btn-sm" id="back-btn" onClick={goBack} style={{ display: 'inline-flex', padding: '6px 12px', fontSize: '12px', marginRight: '16px' }}>
                    ← Back
                  </button>
                )}
                <h2 style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                  {currentPage === 'dashboard' ? 'Learning Dashboard' : 
                   currentPage === 'course-detail' ? 'Course Workspace' : 
                   currentPage === 'lesson-workspace' ? 'Lesson Workspace' : 
                   currentPage === 'admin-users' ? (currentParams.filterRole === 'INSTRUCTOR' ? 'Instructors Management' : 'Students Management') :
                   currentPage.replace('-', ' ').toUpperCase()}
                </h2>
              </div>
              <div className="topbar-actions">
                <NotificationBell 
                  notifications={notifications} 
                  showNotifDropdown={showNotifDropdown}
                  setShowNotifDropdown={setShowNotifDropdown}
                  fetchNotifications={fetchNotifications}
                  navigate={navigate}
                  user={user}
                  addToast={addToast}
                />
              </div>
            </header>

            <main className="page-content" id="page-content">
              {renderContent()}
            </main>
          </div>
        </div>
      )}
    </div>
  );
}
