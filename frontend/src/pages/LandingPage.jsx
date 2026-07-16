import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api.js';

export default function LandingPage({ login, addToast, publicTab, setPublicTab, navigate }) {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [instructorsList, setInstructorsList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  
  // Auth Modal States
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState('login');
  
  const [selectedCategoryId, setSelectedCategoryId] = useState(null); // 'login' or 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [regRole, setRegRole] = useState('STUDENT'); // 'STUDENT' or 'GRADUATE'
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // FAQ Accordion State
  const [activeFaq, setActiveFaq] = useState(null);

  // Active Nav Link State
  const [activeNav, setActiveNav] = useState('home');

  // Testimonial Slide State
  const [testimonialSlide, setTestimonialSlide] = useState(0);

  // Seeding endpoint loading helper
  const [seeding, setSeeding] = useState(false);

  const loadData = async () => {
    try {
      const [coursesList, catsList, instList] = await Promise.all([
        apiFetch('/courses/public'),
        apiFetch('/categories'),
        apiFetch('/users/public/instructors')
      ]);
      const catsWithCount = (catsList || []).map(cat => ({
        ...cat,
        courseCount: (coursesList || []).filter(c => c.categoryId === cat.id).length
      }));
      setCourses(coursesList || []);
      setCategories(catsWithCount);
      setInstructorsList(instList || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
    const searchParams = new URLSearchParams(window.location.search);
    let shouldClearUrl = false;
    if (searchParams.get('login') === 'true') {
      setAuthTab('login');
      setShowAuthModal(true);
      shouldClearUrl = true;
    } else if (searchParams.get('register') === 'true') {
      setAuthTab('register');
      setShowAuthModal(true);
      shouldClearUrl = true;
    }
    
    if (shouldClearUrl) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      if (['home', 'courses', 'instructors', 'about'].includes(hash)) {
        setPublicTab(hash);
        if (hash !== 'courses') {
          setSearchQuery('');
          setSelectedCategoryId(null);
        }
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    if (window.location.hash) handleHashChange();
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const switchPublicTab = (tab) => {
    window.scrollTo(0, 0);
    if (window.location.hash !== `#${tab}`) {
      window.location.hash = tab;
    }
    setPublicTab(tab);
  };

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSuggestions([]);
      return;
    }
    const filtered = courses.filter(c => 
      c.published && (
        c.title.toLowerCase().includes(val.toLowerCase()) ||
        c.description?.toLowerCase().includes(val.toLowerCase()) ||
        (c.categoryName || '').toLowerCase().includes(val.toLowerCase())
      )
    ).slice(0, 5);
    setSuggestions(filtered);
  };

  const executeSearch = (q) => {
    setSearchQuery(q);
    setSelectedCategoryId(null);
    setSuggestions([]);
    switchPublicTab('courses');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('login-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Signing in…'; }
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      if (data.role === 'ADMIN') {
        throw new Error('Access denied. Administrators must login from the /admin portal.');
      }
      if (data.role === 'INSTRUCTOR') {
        throw new Error('Access denied. Instructors must login from the /instructor portal.');
      }
      setShowAuthModal(false);
      login(data.token, { username: data.username, email: data.email, role: data.role });
    } catch (err) {
      addToast(err.message || 'Login failed', 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Sign In'; }
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }
    const btn = document.getElementById('register-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Creating…'; }
    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password, role: regRole })
      });
      addToast('Registration successful! Please log in.', 'success');
      setAuthTab('login');
      setPassword('');
    } catch (err) {
      addToast(err.message || 'Registration failed', 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Sign Up'; }
    }
  };

  const seedData = async () => {
    setSeeding(true);
    try {
      await apiFetch('/seed-data-now');
      addToast('Demo database seeded successfully! 🚀', 'success');
      loadData();
    } catch (err) {
      addToast('Failed to trigger seeding', 'error');
    } finally {
      setSeeding(false);
    }
  };

  const toggleFaq = (index) => {
    setActiveFaq(prev => prev === index ? null : index);
  };

  const filteredCatalog = courses.filter(c => {
    if (!c.published) return false;
    if (selectedCategoryId) {
      return c.categoryId === selectedCategoryId;
    }
    if (searchQuery) {
      return c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             (c.categoryName || '').toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <div id="public-shell">
      {/* Header */}
      <header className="public-navbar">
        <a href="#" className="public-logo" onClick={() => switchPublicTab('home')}>
          <div className="logo-icon" style={{ width: '32px', height: '32px', fontSize: '16px', background: 'var(--grad-primary)', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginRight: '6px' }}>🎓</div>
          LearnSphere
        </a>
        <nav className="public-nav-links">
          <button className={`public-nav-link ${publicTab === 'home' && activeNav === 'home' ? 'active' : ''}`} onClick={() => { setActiveNav('home'); switchPublicTab('home'); window.scrollTo({top: 0, behavior: 'smooth'}); }}>Home</button>
          <button className={`public-nav-link ${publicTab === 'home' && activeNav === 'categories' ? 'active' : ''}`} onClick={() => {
            setActiveNav('categories');
            switchPublicTab('home');
            setTimeout(() => {
              const el = document.getElementById('categories-sec');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}>Categories</button>
          <button className={`public-nav-link ${publicTab === 'courses' ? 'active' : ''}`} onClick={() => {
            setActiveNav('courses');
            setSearchQuery('');
            setSelectedCategoryId(null);
            switchPublicTab('courses');
          }}>Courses</button>
          <button className={`public-nav-link ${publicTab === 'home' && activeNav === 'instructors' ? 'active' : ''}`} onClick={() => {
            setActiveNav('instructors');
            switchPublicTab('home');
            setTimeout(() => {
              const el = document.getElementById('instructors-sec');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}>Instructors</button>
          <button className={`public-nav-link ${publicTab === 'home' && activeNav === 'about' ? 'active' : ''}`} onClick={() => {
            setActiveNav('about');
            switchPublicTab('home');
            setTimeout(() => {
              const el = document.getElementById('about-sec');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}>About</button>
          <button className={`public-nav-link ${publicTab === 'home' && activeNav === 'contact' ? 'active' : ''}`} onClick={() => {
            setActiveNav('contact');
            switchPublicTab('home');
            setTimeout(() => {
              const el = document.getElementById('contact-sec');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}>Contact</button>
        </nav>
        <div className="public-nav-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => { setAuthTab('login'); setShowAuthModal(true); }}>Login</button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('register')}>Register</button>
        </div>
      </header>

      <main>
        {publicTab === 'home' ? (
          <div>
            {/* HERO SECTION */}
            <div className="public-container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px', alignItems: 'center' }}>
                <div>
                  <h1 className="hero-title" style={{ textAlign: 'left', fontSize: '52px', marginBottom: '24px' }}>Learn Skills That<br />Shape Your Future</h1>
                  <p className="hero-subtitle" style={{ textAlign: 'left', margin: '0 0 32px 0', maxWidth: '540px' }}>
                    Master Java, Spring Boot, Web Development, Artificial Intelligence, Cloud Computing, SQL, and more through expert-led courses designed for career growth.
                  </p>
                  
                  {/* Search bar with suggestions */}
                  <div className="search-suggestions-wrap" style={{ maxWidth: '500px', marginBottom: '32px' }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Search your favorite course..." 
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && executeSearch(searchQuery)}
                      style={{ borderRadius: '8px 0 0 8px' }} 
                    />
                    <button className="btn btn-primary" onClick={() => executeSearch(searchQuery)} style={{ borderRadius: '0 8px 8px 0' }}>Search</button>
                    {suggestions.length > 0 && (
                      <div className="search-suggestions active" id="search-suggestions">
                        {suggestions.map(c => (
                          <div 
                            key={c.id} 
                            className="search-suggestion-item" 
                            onClick={() => executeSearch(c.title)}
                          >
                            🔍 {c.title}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex gap-3 mb-3" style={{ flexWrap: 'wrap' }}>
                    <button className="btn btn-primary" onClick={() => switchPublicTab('courses')}>Explore Courses</button>
                    <button className="btn btn-secondary" onClick={() => addToast('Watch demo video is offline.', 'info')}>Watch Demo</button>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-3 mt-3" style={{ flexWrap: 'wrap' }}>
                    <span style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>⭐⭐⭐⭐⭐ 4.9 Rating</span>
                    <span className="text-muted">|</span>
                    <span><strong>12,000+</strong> Students</span>
                    <span className="text-muted">|</span>
                    <span><strong>250+</strong> Courses</span>
                    <span className="text-muted">|</span>
                    <span><strong>45+</strong> Instructors</span>
                  </div>
                </div>

                {/* Right column: Dashboard previews */}
                <div style={{ position: 'relative', height: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ position: 'absolute', width: '340px', height: '340px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(79, 70, 229, 0.12) 0%, transparent 70%)', zIndex: 0 }}></div>
                  
                  <div className="float-card-1" style={{ position: 'absolute', top: '30px', left: '10px', width: '200px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '18px', zIndex: 2, backdropFilter: 'blur(10px)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--accent-green)', fontWeight: 'bold', marginBottom: '6px' }}>COURSE IN PROGRESS</div>
                    <h4 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '4px' }}>Java Masterclass</h4>
                    <div style={{ fontSize: '13px', color: 'var(--accent-amber)', marginBottom: '8px' }}>★★★★★</div>
                    <div className="flex items-center justify-between text-sm text-muted">
                      <span>1,245 Students</span>
                      <span>8 Weeks</span>
                    </div>
                  </div>

                  <div className="float-card-2" style={{ position: 'absolute', bottom: '40px', right: '20px', width: '180px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '16px', zIndex: 2, backdropFilter: 'blur(10px)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--accent-purple)', fontWeight: 'bold', marginBottom: '6px' }}>TRENDING</div>
                    <h4 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '4px' }}>Spring Boot</h4>
                    <div style={{ fontSize: '13px', color: 'var(--accent-amber)', marginBottom: '8px' }}>★★★★☆</div>
                    <div className="text-sm text-muted">890 Students</div>
                  </div>

                  <div className="float-card-3" style={{ position: 'absolute', top: '150px', right: '0px', width: '190px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '16px', zIndex: 2, backdropFilter: 'blur(10px)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '24px' }}>🏅</span>
                      <div>
                        <h4 style={{ fontSize: '13px', fontWeight: 'bold' }}>Certificate Earned</h4>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Java Developer</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CATEGORIES SECTION */}
            <div style={{ background: 'var(--bg-secondary)', padding: '80px 0' }} id="categories-sec">
              <div className="public-container">
                <div className="section-header" style={{ textAlign: 'center', marginBottom: '50px' }}>
                  <h3>Popular Categories</h3>
                  <p className="text-muted" style={{ marginTop: '6px' }}>Excellence in trending digital domains</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                  {categories.map(cat => (
                    <div key={cat.id} className="stat-card" style={{ padding: '24px', textAlign: 'center', cursor: 'pointer' }} onClick={() => { setSelectedCategoryId(cat.id); switchPublicTab('courses'); }}>
                      {cat.thumbnailUrl ? (
                        <div style={{ marginBottom: '12px' }}>
                          <img src={cat.thumbnailUrl} alt={cat.name} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                        </div>
                      ) : (
                        <div style={{ fontSize: '32px', marginBottom: '12px' }}>{cat.icon || '🏷️'}</div>
                      )}
                      <h4 style={{ marginBottom: '6px' }}>{cat.name}</h4>
                      <p className="text-sm text-muted">{cat.courseCount || 0} Courses</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* POPULAR COURSES SECTION */}
            <div style={{ padding: '80px 0' }} id="popular-courses-sec">
              <div className="public-container">
                <div className="section-header" style={{ textAlign: 'center', marginBottom: '50px' }}>
                  <h3>Courses</h3>
                  <p className="text-muted" style={{ marginTop: '6px' }}>Top picks from our expert instructors</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                  {courses.slice(0, 6).map(c => (
                    <div key={c.id} className="stat-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                      <div className="course-thumb" style={{ marginBottom: '16px', borderRadius: '8px', overflow: 'hidden' }}>
                        {c.thumbnailUrl ? <img src={c.thumbnailUrl} alt={c.title} style={{ width: '100%', height: '150px', objectFit: 'cover' }} /> : <div className="course-thumb-placeholder" style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', fontSize: '32px' }}>📚</div>}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span className="chip" style={{ fontSize: '10px', textTransform: 'uppercase' }}>{c.categoryName || 'Uncategorized'}</span>
                        <span style={{ fontWeight: 'bold', color: 'var(--accent-blue)' }}>₹{(c.price || 0).toFixed(2)}</span>
                      </div>
                      <h4 style={{ fontWeight: 'bold', marginBottom: '8px' }}>{c.title}</h4>
                      <p className="text-sm text-muted" style={{ flex: 1, marginBottom: '16px' }}>{c.subtitle || c.description?.substring(0, 80) + '...'}</p>
                      <button className="btn btn-primary btn-full btn-sm" onClick={() => switchPublicTab('courses')}>View Course</button>
                    </div>
                  ))}
                  {courses.length === 0 && (
                     <div className="empty-state" style={{ gridColumn: '1 / -1' }}>No popular courses available at the moment.</div>
                  )}
                </div>
                {courses.length > 0 && (
                  <div style={{ textAlign: 'center', marginTop: '40px' }}>
                    <button className="btn btn-secondary" onClick={() => switchPublicTab('courses')}>Browse All Courses</button>
                  </div>
                )}
              </div>
            </div>

            {/* TESTIMONIALS SECTION */}
            <div style={{ padding: '80px 0' }}>
              <div className="public-container">
                <div className="section-header" style={{ textAlign: 'center', marginBottom: '50px' }}>
                  <h3>What Our Learners Say</h3>
                  <p className="text-muted" style={{ marginTop: '6px' }}>Real reviews from real career transformations</p>
                </div>
                
                <div className="testimonial-slider" style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
                  <div className="carousel-inner">
                    {testimonialSlide === 0 && (
                      <div className="carousel-slide active">
                        <p style={{ fontSize: '18px', fontStyle: 'italic', marginBottom: '24px', lineHeight: '1.6' }}>
                          "Switching careers was daunting, but the Java and Spring Boot curriculum gave me the practical knowledge I needed to pass technical rounds. I got hired as a developer within 4 months!"
                        </p>
                        <h4 style={{ fontWeight: 'bold' }}>Amit Sharma</h4>
                        <span className="text-sm text-muted">Software Engineer, Cognizant</span>
                      </div>
                    )}
                    {testimonialSlide === 1 && (
                      <div className="carousel-slide active">
                        <p style={{ fontSize: '18px', fontStyle: 'italic', marginBottom: '24px', lineHeight: '1.6' }}>
                          "The platform is gorgeous and extremely simple to navigate. The React masterclass module helped me structure code professionally. I highly recommend LearnSphere!"
                        </p>
                        <h4 style={{ fontWeight: 'bold' }}>Sneha Patel</h4>
                        <span className="text-sm text-muted">Frontend Developer, TCS</span>
                      </div>
                    )}
                    {testimonialSlide === 2 && (
                      <div className="carousel-slide active">
                        <p style={{ fontSize: '18px', fontStyle: 'italic', marginBottom: '24px', lineHeight: '1.6' }}>
                          "I love the grading feedback. Unlike other static tutorial sites, the assignment validation and instructor reviews kept me accountable. Top tier material!"
                        </p>
                        <h4 style={{ fontWeight: 'bold' }}>John Doe</h4>
                        <span className="text-sm text-muted">Full Stack Intern</span>
                      </div>
                    )}
                  </div>
                  <div className="carousel-dots" style={{ marginTop: '24px' }}>
                    <span className={`carousel-dot ${testimonialSlide === 0 ? 'active' : ''}`} onClick={() => setTestimonialSlide(0)}></span>
                    <span className={`carousel-dot ${testimonialSlide === 1 ? 'active' : ''}`} onClick={() => setTestimonialSlide(1)}></span>
                    <span className={`carousel-dot ${testimonialSlide === 2 ? 'active' : ''}`} onClick={() => setTestimonialSlide(2)}></span>
                  </div>
                </div>
              </div>
            </div>

            {/* INSTRUCTORS SECTION */}
            <div style={{ background: 'var(--bg-secondary)', padding: '80px 0' }} id="instructors-sec">
              <div className="public-container">
                <div className="section-header" style={{ textAlign: 'center', marginBottom: '50px' }}>
                  <h3>Meet Our Expert Instructors</h3>
                  <p className="text-muted" style={{ marginTop: '6px' }}>Industry-certified leaders sharing operational experience</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
                  {instructorsList.map(inst => (
                    <div key={inst.id} className="stat-card" style={{ padding: '24px', textAlign: 'center' }}>
                      {inst.thumbnailUrl ? (
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 16px', overflow: 'hidden' }}>
                          <img src={inst.thumbnailUrl} alt={inst.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ) : (
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#71717A', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 16px', textTransform: 'uppercase' }}>
                          {inst.username.substring(0, 2)}
                        </div>
                      )}
                      <h4 style={{ marginBottom: '4px' }}>{inst.username}</h4>
                      <p className="text-sm text-warning" style={{ fontWeight: 'bold', marginBottom: '8px' }}>Platform Instructor</p>
                      <p className="text-xs text-muted" style={{ wordBreak: 'break-all' }}>Contact: {inst.email}</p>
                    </div>
                  ))}
                  {instructorsList.length === 0 && (
                    <div className="text-muted" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>No instructors available yet.</div>
                  )}
                </div>
              </div>
            </div>

            {/* ABOUT SECTION */}
            <div style={{ padding: '80px 0' }} id="about-sec">
              <div className="public-container">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '32px', marginBottom: '20px' }}>Empowering Student-Instructor Collaborations</h3>
                    <p className="text-muted" style={{ lineHeight: '1.7', marginBottom: '24px' }}>
                      LearnSphere LMS brings world-class curriculum right to your device. We prioritize rich user experience, interactive quiz sheets, and grading mechanisms to help instructors and students track learning outcomes transparently.
                    </p>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', padding: 0 }}>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: 'var(--accent-green)' }}>✓</span> Role-Based Dashboard Interfaces</li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: 'var(--accent-green)' }}>✓</span> Instant PDF Certificate Generators</li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: 'var(--accent-green)' }}>✓</span> Task-Focused Notifications Flow</li>
                    </ul>
                  </div>
                  <div style={{ background: 'var(--bg-secondary)', padding: '40px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)' }}>
                    <h4 style={{ marginBottom: '16px', fontWeight: 'bold' }}>Why Choose LearnSphere?</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div className="flex gap-3">
                        <span style={{ fontSize: '24px' }}>🚀</span>
                        <div>
                          <h5 style={{ fontWeight: 'bold' }}>Expert Guidance</h5>
                          <p className="text-xs text-muted mt-1">Our instructors are seasoned programmers who review your project files manually.</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <span style={{ fontSize: '24px' }}>📋</span>
                        <div>
                          <h5 style={{ fontWeight: 'bold' }}>Structured Lessons</h5>
                          <p className="text-xs text-muted mt-1">Every course has clean progressive video modules, quizzes, and file submissions.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ SECTION */}
            <div style={{ background: 'var(--bg-secondary)', padding: '80px 0' }} id="faq-sec">
              <div className="public-container">
                <div style={{ textAlign: 'center', marginBottom: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '32px', fontWeight: 'bold' }}>Frequently Asked Questions</h3>
                  <p className="text-muted" style={{ marginTop: '10px', fontSize: '18px' }}>Got questions? We've got answers.</p>
                </div>
                <div className="faq-accordion" style={{ maxWidth: '800px', margin: '0 auto' }}>
                  {[
                    { q: 'How do I enroll in a course?', a: 'Click the "Explore Courses" button, choose any course from the catalog, and click "Enroll". If you don\'t have an account, you\'ll be prompted to register free as a student.' },
                    { q: 'Can I register as an instructor?', a: 'Yes! Instructors must register from the dedicated /instructor portal, where they can build courses, quizzes, and grade students.' },
                    { q: 'Is there a fee for getting a certificate?', a: 'No, certificate generation is free upon scoring 100% progress on all course lessons, assignments, and quizzes.' }
                  ].map((faq, idx) => (
                    <div key={idx} className={`faq-item ${activeFaq === idx ? 'active' : ''}`} style={{ border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '20px 24px', marginBottom: '16px', background: 'rgba(255,255,255,0.02)' }}>
                      <button className="faq-header" onClick={() => toggleFaq(idx)} style={{ width: '100%', background: 'none', border: 'none', color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
                        <span>{faq.q}</span>
                        <span>{activeFaq === idx ? '▼' : '▶'}</span>
                      </button>
                      {activeFaq === idx && (
                        <div className="faq-body" style={{ color: 'var(--text-muted)', fontSize: '15px', paddingTop: '16px', lineHeight: '1.6' }}>{faq.a}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CONTACT SECTION */}
            <div style={{ padding: '80px 0' }} id="contact-sec">
              <div className="public-container" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                <div className="section-header" style={{ marginBottom: '30px' }}>
                  <h3>Get In Touch</h3>
                  <p className="text-muted" style={{ marginTop: '6px' }}>Contact our support team for help</p>
                </div>
                <div style={{ background: 'var(--bg-secondary)', padding: '30px', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                  <p style={{ marginBottom: '16px' }}>✉️ Email: <strong>support@learnsphere.com</strong></p>
                  <p style={{ marginBottom: '16px' }}>📞 Phone: <strong>+91 98765 43210</strong></p>
                  <p>📍 Location: <strong>Chennai, Tamil Nadu, India</strong></p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* COURSES TAB VIEW */
          <section id="pub-sec-courses" className="public-section active">
            <div className="public-container">
              <div className="section-header" style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Explore Our Public Catalog</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(selectedCategoryId || searchQuery) && (
                    <button className="btn btn-secondary btn-sm" onClick={() => switchPublicTab('home')}>← Back</button>
                  )}
                  {selectedCategoryId && (
                    <button className="btn btn-secondary btn-sm" onClick={() => setSelectedCategoryId(null)}>Clear Filter</button>
                  )}
                  {searchQuery && !selectedCategoryId && (
                    <button className="btn btn-secondary btn-sm" onClick={() => setSearchQuery('')}>Clear Search</button>
                  )}
                </div>
              </div>
              <div id="public-courses-grid" className="courses-grid">
                {filteredCatalog.length === 0 ? (
                  <div className="empty-state">No courses assigned yet.</div>
                ) : (
                  filteredCatalog.map(c => (
                    <div key={c.id} className="course-card">
                      <div className="course-thumb">
                        {c.thumbnailUrl ? <img src={c.thumbnailUrl} alt={c.title} /> : <div className="course-thumb-placeholder">📚</div>}
                        <span className="course-badge badge-published">Published</span>
                      </div>
                      <div className="course-body">
                        <div className="course-category">{c.categoryName || 'Uncategorized'}</div>
                        <div className="course-title">{c.title}</div>
                        <div className="course-instructor">by {c.instructorName || '—'}</div>
                        <div className="course-price">₹{(c.price || 0).toFixed(2)}</div>
                        <div className="course-footer" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => navigate('course-detail', { courseId: c.id })}>View Details</button>
                          <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => { setAuthTab('login'); setShowAuthModal(true); }}>Enroll</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer style={{ background: '#060608', borderTop: '1px solid var(--glass-border)', padding: '80px 24px 40px', color: 'var(--text-secondary)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1.2fr', gap: '40px' }} id="footer-grid">
          <div>
            <a href="#" className="public-logo" onClick={() => switchPublicTab('home')} style={{ marginBottom: '20px', display: 'inline-block' }}>
              <div className="logo-icon" style={{ width: '32px', height: '32px', fontSize: '16px', background: 'var(--grad-primary)', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginRight: '6px' }}>🎓</div>
              LearnSphere
            </a>
            <p className="text-sm text-muted" style={{ lineHeight: '1.6', marginBottom: '20px' }}>
              LearnSphere LMS is a modern, comprehensive learning management platform offering top-tier training for students, instructors, and teams.
            </p>
            <div className="flex gap-2">
              <a href="#" className="btn btn-secondary btn-sm" style={{ width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>GH</a>
              <a href="#" className="btn btn-secondary btn-sm" style={{ width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>LI</a>
              <a href="#" className="btn btn-secondary btn-sm" style={{ width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>FB</a>
              <a href="#" className="btn btn-secondary btn-sm" style={{ width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>IG</a>
            </div>
          </div>

          <div>
            <h4 style={{ color: 'var(--text-primary)', fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', fontWeight: 'bold', marginBottom: '20px' }}>Quick Links</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', padding: 0 }}>
              <li><a href="#" onClick={() => switchPublicTab('home')} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</a></li>
              <li><a href="#" onClick={() => {
                switchPublicTab('home');
                setTimeout(() => {
                  const el = document.getElementById('categories-sec');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Categories</a></li>
              <li><a href="#" onClick={() => switchPublicTab('courses')} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Courses</a></li>
              <li><a href="#" onClick={() => {
                switchPublicTab('home');
                setTimeout(() => {
                  const el = document.getElementById('about-sec');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>About</a></li>
              <li><a href="#" onClick={() => {
                switchPublicTab('home');
                setTimeout(() => {
                  const el = document.getElementById('contact-sec');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Contact</a></li>
              <li><a href="#" onClick={() => {
                switchPublicTab('home');
                setTimeout(() => {
                  const el = document.getElementById('faq-sec');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'var(--text-primary)', fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', fontWeight: 'bold', marginBottom: '20px' }}>Popular Courses</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: 'var(--text-muted)', padding: 0 }}>
              <li>Java Full Stack</li>
              <li>Spring Boot Rest APIs</li>
              <li>React Single Page Apps</li>
              <li>Relational Database SQL</li>
              <li>Python for Automation</li>
              <li>Artificial Intelligence</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'var(--text-primary)', fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', fontWeight: 'bold', marginBottom: '20px' }}>Contact</h4>
            <p className="text-sm text-muted" style={{ lineHeight: '1.6', marginBottom: '12px' }}>✉️ support@learnsphere.com</p>
            <p className="text-sm text-muted" style={{ lineHeight: '1.6', marginBottom: '12px' }}>📞 +91 98765 43210</p>
            <p className="text-sm text-muted" style={{ lineHeight: '1.6' }}>📍 Chennai, Tamil Nadu, India</p>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '40px auto 0', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
          © 2026 LearnSphere. All rights reserved.
        </div>
      </footer>

      {/* Floating Buttons */}
      <button className="back-to-top visible" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ color: '#000' }}>▲</button>
      <button className="chat-support-btn" onClick={() => addToast('Chat support is offline. Email us at support@learnsphere.com', 'info')}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>

      {/* Auth Modal Overlay */}
      {showAuthModal && (
        <div className="modal-overlay" style={{ display: 'flex' }} onClick={() => setShowAuthModal(false)}>
          <div className="modal" style={{ width: '400px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{authTab === 'login' ? 'Welcome Back' : 'Join LearnSphere'}</h3>
              <button className="modal-close" onClick={() => setShowAuthModal(false)}>✕</button>
            </div>
            
            <div className="auth-tabs" style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', marginBottom: '20px' }}>
              <button className={`auth-tab ${authTab === 'login' ? 'active' : ''}`} style={{ flex: 1, padding: '12px', background: 'none', border: 'none', color: authTab === 'login' ? 'var(--accent-blue)' : 'var(--text-muted)', borderBottom: authTab === 'login' ? '2px solid var(--accent-blue)' : 'none', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setAuthTab('login')}>Sign In</button>
              <button className={`auth-tab ${authTab === 'register' ? 'active' : ''}`} style={{ flex: 1, padding: '12px', background: 'none', border: 'none', color: authTab === 'register' ? 'var(--accent-blue)' : 'var(--text-muted)', borderBottom: authTab === 'register' ? '2px solid var(--accent-blue)' : 'none', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setAuthTab('register')}>Register</button>
            </div>

            {authTab === 'login' ? (
              <form onSubmit={handleLoginSubmit}>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Username</label>
                  <input type="text" className="form-input" placeholder="Enter your username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div className="form-group" style={{ marginBottom: '20px', position: 'relative' }}>
                  <label className="form-label">Password</label>
                  <input type={showPassword ? 'text' : 'password'} className="form-input" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ paddingRight: '40px' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '38px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px' }}>
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                <button type="submit" className="btn btn-primary btn-full" id="login-btn">Sign In</button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit}>
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label">Username</label>
                  <input type="text" className="form-input" placeholder="Choose a username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" placeholder="yourname@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="form-group" style={{ marginBottom: '12px', position: 'relative' }}>
                  <label className="form-label">Password</label>
                  <input type={showPassword ? 'text' : 'password'} className="form-input" placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ paddingRight: '40px' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '38px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px' }}>
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                <div className="form-group" style={{ marginBottom: '12px', position: 'relative' }}>
                  <label className="form-label">Confirm Password</label>
                  <input type={showPassword ? 'text' : 'password'} className="form-input" placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required style={{ paddingRight: '40px' }} />
                </div>
                <button type="submit" className="btn btn-primary btn-full" id="register-btn" style={{ marginTop: '20px' }}>Sign Up</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
