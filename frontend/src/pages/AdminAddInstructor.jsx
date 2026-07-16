import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api.js';

export default function AdminAddInstructor({ navigate, addToast, editMode, readOnly, instructorId }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phoneNumber: '',
    professionalTitle: '',
    experienceYears: '0-1',
    highestQualification: 'B.Tech',
    skills: '',
    portfolioUrl: '',
    governmentId: '',
    resumeUrl: '',
    thumbnailUrl: '',
    interestedCategories: '',
    bio: '',
    preferredLanguage: 'English',
    agreedToTerms: false
  });
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (editMode && instructorId) {
      setLoading(true);
      apiFetch('/users').then(users => {
        const user = users.find(u => u.id === parseInt(instructorId));
        if (user) {
          setFormData(prev => ({
            ...prev,
            ...user,
            password: '', // Don't pre-fill password for security, let them leave blank to not change
            confirmPassword: '',
            agreedToTerms: true // They already agreed when created
          }));
        }
      }).catch(err => {
        addToast('Failed to load instructor data', 'error');
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [editMode, instructorId, addToast]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
      
      setFormData(prev => ({
        ...prev,
        [fieldName]: data.url
      }));
      addToast('File uploaded successfully', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editMode && formData.password !== formData.confirmPassword) {
      return addToast('Passwords do not match', 'error');
    }
    if (editMode && formData.password && formData.password !== formData.confirmPassword) {
      return addToast('Passwords do not match', 'error');
    }
    if (!formData.agreedToTerms) {
      return addToast('You must agree to the terms', 'error');
    }
    
    setLoading(true);
    try {
      const payload = {
        ...formData,
        role: 'INSTRUCTOR'
      };
      
      if (editMode) {
        // If password is blank in edit mode, remove it so we don't update it to blank
        if (!payload.password) {
          delete payload.password;
          delete payload.confirmPassword;
        }
        await apiFetch(`/users/${instructorId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        addToast('Instructor updated successfully', 'success');
      } else {
        await apiFetch('/users', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        addToast('Instructor created successfully', 'success');
      }
      navigate('admin-users', { filterRole: 'INSTRUCTOR' });
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-instructor-page">
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <h3>{readOnly ? 'View Instructor' : (editMode ? 'Edit Instructor' : 'Add New Instructor')}</h3>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('admin-users', { filterRole: 'INSTRUCTOR' })}>
          {readOnly ? 'Back' : 'Cancel'}
        </button>
      </div>

      <div className="card" style={{ maxWidth: '800px', margin: '0 auto', padding: '30px' }}>
        {readOnly ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <section>
              <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px' }}>Basic Information</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div><strong>Username:</strong> {formData.username}</div>
                <div><strong>Full Name:</strong> {formData.fullName || 'N/A'}</div>
                <div><strong>Email Address:</strong> {formData.email}</div>
                <div><strong>Phone Number:</strong> {formData.phoneNumber || 'N/A'}</div>
              </div>
            </section>
            
            <section>
              <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px' }}>Professional Information</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div><strong>Professional Title:</strong> {formData.professionalTitle || 'N/A'}</div>
                <div><strong>Years of Experience:</strong> {formData.experienceYears || 'N/A'}</div>
                <div><strong>Highest Qualification:</strong> {formData.highestQualification || 'N/A'}</div>
                <div><strong>LinkedIn / Portfolio URL:</strong> {formData.portfolioUrl ? <a href={formData.portfolioUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)' }}>{formData.portfolioUrl}</a> : 'N/A'}</div>
                <div style={{ gridColumn: '1 / -1' }}><strong>Skills / Expertise:</strong> {formData.skills || 'N/A'}</div>
              </div>
            </section>

            <section>
              <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px' }}>Identity & Verification</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div><strong>Government ID Number:</strong> {formData.governmentId || 'N/A'}</div>
                <div><strong>Resume/CV:</strong> {formData.resumeUrl ? <a href={formData.resumeUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)' }}>View Document</a> : 'N/A'}</div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <strong>Profile Photo:</strong>
                  {formData.thumbnailUrl ? (
                    <div style={{ marginTop: '10px' }}>
                      <img src={formData.thumbnailUrl} alt="Profile" style={{ width: '100px', height: '100px', borderRadius: '8px', objectFit: 'cover' }} />
                    </div>
                  ) : ' N/A'}
                </div>
              </div>
            </section>

            <section>
              <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px' }}>Profile & Bio</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{ gridColumn: '1 / -1' }}><strong>Interested Categories:</strong> {formData.interestedCategories || 'N/A'}</div>
                <div><strong>Preferred Language:</strong> {formData.preferredLanguage || 'N/A'}</div>
                <div style={{ gridColumn: '1 / -1' }}><strong>Bio:</strong> <p style={{ marginTop: '10px', whiteSpace: 'pre-wrap', color: 'var(--text-muted)' }}>{formData.bio || 'N/A'}</p></div>
              </div>
            </section>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {/* Basic Information */}
          <section>
            <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px' }}>Basic Information</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label>Username *</label>
                <input type="text" className="form-input" name="username" value={formData.username} onChange={handleChange} required minLength="3" />
              </div>
              <div className="form-group">
                <label>Full Name *</label>
                <input type="text" className="form-input" name="fullName" value={formData.fullName} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input type="email" className="form-input" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input type="text" className="form-input" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Password {editMode ? '(Leave blank to keep current)' : '*'}</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? 'text' : 'password'} className="form-input" name="password" value={formData.password} onChange={handleChange} required={!editMode} minLength="6" style={{ width: '100%', paddingRight: '40px' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Confirm Password {editMode ? '' : '*'}</label>
                <div style={{ position: 'relative' }}>
                  <input type={showConfirmPassword ? 'text' : 'password'} className="form-input" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required={!editMode && !!formData.password} minLength="6" style={{ width: '100%', paddingRight: '40px' }} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>
                    {showConfirmPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Professional Information */}
          <section>
            <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px' }}>Professional Information</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label>Professional Title (e.g. Java Developer)</label>
                <input type="text" className="form-input" name="professionalTitle" value={formData.professionalTitle} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Years of Experience</label>
                <select className="form-input" name="experienceYears" value={formData.experienceYears} onChange={handleChange}>
                  <option value="0-1">0-1</option>
                  <option value="1-3">1-3</option>
                  <option value="3-5">3-5</option>
                  <option value="5+">5+</option>
                </select>
              </div>
              <div className="form-group">
                <label>Highest Qualification</label>
                <select className="form-input" name="highestQualification" value={formData.highestQualification} onChange={handleChange}>
                  <option value="B.Tech">B.Tech</option>
                  <option value="M.Tech">M.Tech</option>
                  <option value="MCA">MCA</option>
                  <option value="BCA">BCA</option>
                  <option value="B.Sc">B.Sc</option>
                  <option value="Ph.D">Ph.D</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>LinkedIn / Portfolio URL</label>
                <input type="url" className="form-input" name="portfolioUrl" value={formData.portfolioUrl} onChange={handleChange} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Skills / Expertise (Comma-separated)</label>
                <input type="text" className="form-input" name="skills" value={formData.skills} onChange={handleChange} placeholder="e.g. React, Node.js, Python" />
              </div>
            </div>
          </section>

          {/* Identity & Verification */}
          <section>
            <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px' }}>Identity & Verification</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label>Government ID Number</label>
                <input type="text" className="form-input" name="governmentId" value={formData.governmentId} onChange={handleChange} placeholder="Optional for dev" />
              </div>
              <div className="form-group">
                <label>Resume/CV (URL or Upload PDF/DOC)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" className="form-input" name="resumeUrl" value={formData.resumeUrl} onChange={handleChange} placeholder="https://..." style={{ flex: 1 }} />
                  <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', margin: 0, display: 'flex', alignItems: 'center' }}>
                    Upload
                    <input type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'resumeUrl')} />
                  </label>
                </div>
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Profile Photo (URL or Upload Image)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" className="form-input" name="thumbnailUrl" value={formData.thumbnailUrl} onChange={handleChange} placeholder="https://..." style={{ flex: 1 }} />
                  <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', margin: 0, display: 'flex', alignItems: 'center' }}>
                    Upload
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'thumbnailUrl')} />
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Teaching Information */}
          <section>
            <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px' }}>Teaching Information</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label>Categories Interested to Teach</label>
                <input type="text" className="form-input" name="interestedCategories" value={formData.interestedCategories} onChange={handleChange} placeholder="e.g. Programming, Design" />
              </div>
              <div className="form-group">
                <label>Preferred Course Language</label>
                <input type="text" className="form-input" name="preferredLanguage" value={formData.preferredLanguage} onChange={handleChange} placeholder="e.g. English, Spanish" />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Short Bio / About Me</label>
                <textarea className="form-input" name="bio" value={formData.bio} onChange={handleChange} rows="3" placeholder="Tell us about yourself..." maxLength="300"></textarea>
                <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--text-muted)' }}>{formData.bio.length}/300</div>
              </div>
            </div>
          </section>

          {/* Agreement */}
          <section>
            <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px' }}>Agreements</h4>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input type="checkbox" id="agreedToTerms" name="agreedToTerms" checked={formData.agreedToTerms} onChange={handleChange} required />
              <label htmlFor="agreedToTerms" style={{ margin: 0, fontWeight: 'normal' }}>
                I agree to the instructor terms and conditions and confirm that the information provided is correct.
              </label>
            </div>
          </section>

            <div className="flex gap-2" style={{ justifyContent: 'flex-end', marginTop: '20px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('admin-users', { filterRole: 'INSTRUCTOR' })}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : (editMode ? '💾 Save Changes' : '➕ Create Instructor')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
