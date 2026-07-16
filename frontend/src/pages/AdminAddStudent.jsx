import React, { useState } from 'react';
import { apiFetch } from '../utils/api.js';
import StudentRegistrationForm from '../components/StudentRegistrationForm.jsx';

export default function AdminAddStudent({ navigate, addToast }) {
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
      await apiFetch('/users', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      addToast('Student created successfully', 'success');
      navigate('admin-users', { filterRole: 'STUDENT' });
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-student-page">
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <h3>Add New Student</h3>
      </div>
      <StudentRegistrationForm 
        onSubmit={handleSubmit} 
        loading={loading} 
        onCancel={() => navigate('admin-users', { filterRole: 'STUDENT' })} 
      />
    </div>
  );
}
