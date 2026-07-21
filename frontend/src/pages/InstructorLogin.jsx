import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api.js';

export default function InstructorLogin({ login, addToast }) {
  const [tab, setTab] = useState('login'); // 'login' or 'register'
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [instructorsList, setInstructorsList] = useState([]);

  useEffect(() => {
    apiFetch('/auth/instructors')
      .then(data => setInstructorsList(data))
      .catch(err => console.error("Could not load instructors", err));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: username.trim(), password })
      });

      if (data.role !== 'INSTRUCTOR') {
        throw new Error('Access denied. This login is restricted to instructors.');
      }

      login(data.token, {
        username: data.username,
        email: data.email,
        role: data.role
      });
      window.history.pushState({}, '', '/instructor');
    } catch (err) {
      setError(err.message || 'Login failed');
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password,
          role: 'INSTRUCTOR'
        })
      });

      login(data.token, {
        username: data.username,
        email: data.email,
        role: data.role
      });
      window.history.pushState({}, '', '/instructor');
    } catch (err) {
      setError(err.message || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div id="auth-screen">
      <div className="auth-box" style={{ margin: 'auto' }}>
        <div className="auth-logo">
          <span className="logo-icon">👨‍🏫</span>
          <h1>Instructor Portal</h1>
          <p>Teach & Manage Courses on LearnSphere</p>
        </div>

        <div className="auth-tabs">
          <button 
            className={`auth-tab ${tab === 'login' ? 'active' : ''}`} 
            onClick={() => { setTab('login'); setError(''); }}
          >
            Sign In
          </button>
          <button 
            className={`auth-tab ${tab === 'register' ? 'active' : ''}`} 
            onClick={() => { setTab('register'); setError(''); }}
          >
            Register
          </button>
        </div>

        {error && <div className="toast-error" style={{ marginBottom: '20px', padding: '10px', borderRadius: '4px' }}>{error}</div>}

        {tab === 'login' ? (
          <form onSubmit={handleLogin} style={{ width: '100%' }}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input 
                className="form-input" 
                type="text" 
                placeholder="Enter username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required 
                autoComplete="username" 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                className="form-input" 
                type="password" 
                placeholder="Enter password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                autoComplete="current-password" 
              />
            </div>
            <button className="btn btn-primary btn-full" type="submit" disabled={loading} style={{ marginTop: '10px' }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} style={{ width: '100%' }}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input 
                className="form-input" 
                type="text" 
                placeholder="Choose a username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                className="form-input" 
                type="email" 
                placeholder="your@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                className="form-input" 
                type="password" 
                placeholder="At least 6 characters" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
            <button className="btn btn-primary btn-full" type="submit" disabled={loading} style={{ marginTop: '10px' }}>
              {loading ? 'Registering…' : 'Create Instructor Account'}
            </button>
          </form>
        )}


        <a href="/" className="text-muted" style={{ display: 'block', marginTop: '24px', textAlign: 'center', fontSize: '13px', textDecoration: 'none' }}>
          ← Back to Homepage
        </a>
      </div>
    </div>
  );
}
