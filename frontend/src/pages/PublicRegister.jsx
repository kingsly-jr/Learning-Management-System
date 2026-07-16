import React, { useState } from 'react';
import { apiFetch } from '../utils/api.js';
import StudentRegistrationForm from '../components/StudentRegistrationForm.jsx';

export default function PublicRegister({ navigate, addToast, setAuthTab, setShowAuthModal }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    if (formData.password !== formData.confirmPassword) {
      return addToast('Passwords do not match', 'error');
    }
    
    setLoading(true);
    try {
      const payload = {
        ...formData,
        role: 'STUDENT'
      };
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      addToast('Registration successful! Please log in.', 'success');
      navigate('home');
      setAuthTab('login');
      setShowAuthModal(true);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="public-register-page" style={{ paddingTop: '80px', paddingBottom: '40px', background: 'var(--bg-color)', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Join LearnSphere</h2>
        <p style={{ color: 'var(--text-muted)' }}>Start your learning journey today</p>
      </div>

      <StudentRegistrationForm 
        onSubmit={handleSubmit} 
        loading={loading} 
        onCancel={() => navigate('home')} 
      />
    </div>
  );
}
