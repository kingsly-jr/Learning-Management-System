import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api.js';

export default function StudentProfile({ user, navigate, addToast }) {
  const [formData, setFormData] = useState({
    id: user?.id || '',
    username: user?.username || '',
    email: user?.email || '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    highestQualification: '',
    college: '',
    course: '',
    department: '',
    thumbnailUrl: '',
    bio: '',
    preferredLanguage: 'English',
    joinedOn: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      // Use existing /users/profile endpoint
      const data = await apiFetch('/users/profile');
      setFormData(prev => ({
        ...prev,
        ...data,
        password: '', // Clear password field
        confirmPassword: ''
      }));
    } catch (err) {
      console.error(err);
      addToast('Failed to load profile details: ' + err.message, 'error');
    } finally {
      setInitialLoad(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataObj = new FormData();
    formDataObj.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formDataObj
      });
      if (!response.ok) throw new Error('File upload failed');
      const data = await response.json();
      
      setFormData(prev => ({ ...prev, [fieldName]: data.url }));
      addToast('File uploaded successfully', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      return addToast('Passwords do not match', 'error');
    }
    
    setLoading(true);
    try {
      const payload = { ...formData };
      
      if (!payload.password) {
        delete payload.password;
        delete payload.confirmPassword;
      }
      
      await apiFetch('/users/me/update', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      
      addToast('Profile updated successfully! ✅', 'success');
      loadProfile(); // reload to get any server-side formatting
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoad) {
    return (
      <div className="dashboard-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-content student-profile-page">
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <h3>My Profile</h3>
        <p style={{ color: 'var(--text-muted)' }}>Manage your personal details and account settings</p>
      </div>

      <div className="card" style={{ maxWidth: '800px', margin: '0', padding: '30px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Personal Information */}
          <section>
            <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              👤 Personal Information
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Profile Photo</label>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  {formData.thumbnailUrl ? (
                    <img src={formData.thumbnailUrl} alt="Profile" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
                      {formData.username ? formData.username[0].toUpperCase() : 'U'}
                    </div>
                  )}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input type="text" className="form-input" name="thumbnailUrl" value={formData.thumbnailUrl || ''} onChange={handleChange} placeholder="Image URL..." style={{ flex: 1 }} />
                      <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', margin: 0, display: 'flex', alignItems: 'center' }}>
                        Upload
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'thumbnailUrl')} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" className="form-input" name="fullName" value={formData.fullName || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Username</label>
                <input type="text" className="form-input" name="username" value={formData.username || ''} onChange={handleChange} required minLength="3" />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="text" className="form-input" name="phoneNumber" value={formData.phoneNumber || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input type="date" className="form-input" name="dateOfBirth" value={formData.dateOfBirth || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select className="form-input" name="gender" value={formData.gender || ''} onChange={handleChange}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>
          </section>

          {/* Education Information */}
          <section>
            <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🎓 Education Information
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label>Highest Qualification</label>
                <select className="form-input" name="highestQualification" value={formData.highestQualification || ''} onChange={handleChange}>
                  <option value="">Select Qualification</option>
                  <option value="High School">High School</option>
                  <option value="Bachelors">Bachelor's Degree</option>
                  <option value="Masters">Master's Degree</option>
                  <option value="PhD">Ph.D.</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>College/University</label>
                <input type="text" className="form-input" name="college" value={formData.college || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Course/Degree</label>
                <input type="text" className="form-input" name="course" value={formData.course || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input type="text" className="form-input" name="department" value={formData.department || ''} onChange={handleChange} />
              </div>
            </div>
          </section>

          {/* About */}
          <section>
            <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📝 About
            </h4>
            <div className="form-group">
              <label>Short Bio</label>
              <textarea className="form-input" name="bio" value={formData.bio || ''} onChange={handleChange} rows="3" placeholder="Tell us about yourself..." maxLength="300"></textarea>
              <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--text-muted)' }}>{(formData.bio || '').length}/300</div>
            </div>
          </section>

          {/* Preferences */}
          <section>
            <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⚙️ Preferences
            </h4>
            <div className="form-group">
              <label>Preferred Language</label>
              <input type="text" className="form-input" name="preferredLanguage" value={formData.preferredLanguage || ''} onChange={handleChange} style={{ maxWidth: '380px' }} />
            </div>
          </section>

          {/* Account & Security */}
          <section>
            <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🔒 Account & Security
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label>Change Password (Leave blank to keep current)</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? 'text' : 'password'} className="form-input" name="password" value={formData.password} onChange={handleChange} minLength="6" style={{ width: '100%', paddingRight: '40px' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showConfirmPassword ? 'text' : 'password'} className="form-input" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required={!!formData.password} minLength="6" style={{ width: '100%', paddingRight: '40px' }} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>
                    {showConfirmPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Read-Only Details */}
          <section>
            <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📌 Account Details (Read-Only)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div><strong>Email Address:</strong> <span style={{ color: 'var(--text-muted)', marginLeft: '5px' }}>{formData.email}</span></div>
              <div><strong>Student ID:</strong> <span style={{ color: 'var(--text-muted)', marginLeft: '5px' }}>#{formData.id}</span></div>
              <div style={{ gridColumn: '1 / -1' }}><strong>Registration Date:</strong> <span style={{ color: 'var(--text-muted)', marginLeft: '5px' }}>{formData.joinedOn ? new Date(formData.joinedOn).toLocaleDateString() : 'N/A'}</span></div>
            </div>
          </section>

          <div className="flex gap-2" style={{ justifyContent: 'flex-end', marginTop: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => { loadProfile(); navigate('catalog'); }}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : '💾 Save Changes'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
