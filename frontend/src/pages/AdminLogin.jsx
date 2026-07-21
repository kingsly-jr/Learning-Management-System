import React, { useState } from 'react';
import { apiFetch } from '../utils/api.js';

export default function AdminLogin({ login, addToast }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: username.trim(),
          password: password
        })
      });

      if (!data || data.role !== 'ADMIN') {
        throw new Error('Access denied. This login is restricted to administrators.');
      }

      // Instead of manual localStorage and reload, use the app's login handler
      login(data.token, {
        username: data.username,
        email: data.email,
        role: data.role
      });
      
      // Update URL to stay on admin path
      window.history.pushState({}, '', '/admin');

    } catch (err) {
      setError(err.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div id="auth-screen">
      <div className="auth-box" style={{ margin: 'auto' }}>
        <div className="auth-logo">
          <span className="logo-icon">🛡️</span>
          <h1>Admin Portal</h1>
          <p>LearnSphere Administration</p>
        </div>

        {error && <div className="toast-error" style={{ marginBottom: '20px', padding: '10px', borderRadius: '4px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div className="form-group">
            <label className="form-label">Admin Username</label>
            <input 
              className="form-input" 
              type="text" 
              placeholder="Enter admin username" 
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
              placeholder="Enter admin password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              autoComplete="current-password" 
            />
          </div>
          <button className="btn btn-primary btn-full" type="submit" disabled={loading} style={{ marginTop: '10px' }}>
            {loading ? 'Signing in…' : 'Sign In as Admin'}
          </button>
        </form>


        <a href="/" className="text-muted" style={{ display: 'block', marginTop: '24px', textAlign: 'center', fontSize: '13px', textDecoration: 'none' }}>
          ← Back to Homepage
        </a>
      </div>
    </div>
  );
}
