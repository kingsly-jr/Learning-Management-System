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
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (editMode && instructorId) {
      setLoading(true);
      apiFetch('/users').then(users => {
        const user = users.find(u => u.id === parseInt(instructorId) && u.role === 'INSTRUCTOR');
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

  const validateField = (name, value, currentFormData) => {
    let error = '';
    const trimmed = typeof value === 'string' ? value.trim() : value;

    switch (name) {
      case 'fullName':
        if (!trimmed) error = 'Full Name is required.';
        else if (trimmed.length < 3) error = 'Minimum 3 characters required.';
        else if (trimmed.length > 100) error = 'Maximum 100 characters allowed.';
        else if (!/^[A-Za-z\s\-']+$/.test(trimmed)) error = 'Only letters, spaces, hyphens, and apostrophes allowed.';
        else if (/\s{2,}/.test(trimmed)) error = 'Multiple consecutive spaces are not allowed.';
        break;
      case 'username':
        if (!trimmed) error = 'Username is required.';
        else if (trimmed.length < 4) error = 'Minimum 4 characters required.';
        else if (trimmed.length > 30) error = 'Maximum 30 characters allowed.';
        else if (!/^[A-Za-z0-9_]+$/.test(trimmed)) error = 'Only letters, numbers, and underscores allowed.';
        break;
      case 'email':
        if (!trimmed) error = 'Email is required.';
        else if (trimmed.length > 255) error = 'Maximum 255 characters allowed.';
        else if (!/^[A-Za-z0-9._%+-]+@gmail\.com$/.test(trimmed)) error = 'Please enter a valid @gmail.com address.';
        break;
      case 'phoneNumber':
        if (!trimmed) error = 'Phone Number is required.';
        else if (!/^\d{10}$/.test(trimmed)) error = 'Phone Number must be exactly 10 digits.';
        break;
      case 'password':
        if (!editMode && !trimmed) error = 'Password is required.';
        else if (trimmed && trimmed.length < 8) error = 'Minimum 8 characters required.';
        else if (trimmed && trimmed.length > 64) error = 'Maximum 64 characters allowed.';
        else if (trimmed && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/.test(trimmed)) {
          error = 'Must contain uppercase, lowercase, number, and special character.';
        } else if (trimmed && /\s/.test(trimmed)) {
          error = 'Spaces are not allowed.';
        }
        break;
      case 'confirmPassword':
        if (!editMode && !trimmed) error = 'Confirm Password is required.';
        else if (trimmed !== currentFormData.password) error = 'Passwords do not match.';
        break;
      case 'professionalTitle':
        if (trimmed && trimmed.length > 100) error = 'Maximum 100 characters allowed.';
        else if (trimmed && !/^[A-Za-z0-9\s\-()]+$/.test(trimmed)) error = 'Only letters, numbers, spaces, hyphens, and parentheses allowed.';
        break;
      case 'portfolioUrl':
      case 'resumeUrl':
      case 'thumbnailUrl':
        if (trimmed && !/^https:\/\//.test(trimmed)) error = 'Must begin with https://';
        break;
      case 'skills':
        if (trimmed) {
          const skillList = trimmed.split(',').map(s => s.trim()).filter(Boolean);
          if (skillList.length > 30) error = 'Maximum 30 skills allowed.';
          else if (skillList.some(s => s.length > 50)) error = 'Each skill maximum 50 characters.';
          else if (!/^[A-Za-z0-9\s,+#\-.]+$/.test(trimmed)) error = 'Contains invalid characters.';
        }
        break;
      case 'governmentId':
        if (trimmed && trimmed.length > 30) error = 'Maximum 30 characters allowed.';
        else if (trimmed && !/^[A-Za-z0-9]+$/.test(trimmed)) error = 'Only letters and numbers allowed.';
        break;
      case 'bio':
        if (trimmed && trimmed.length > 300) error = 'Maximum 300 characters allowed.';
        else if (trimmed && (/<[^>]*>/g.test(trimmed) || /javascript:/i.test(trimmed) || /(SELECT|INSERT|UPDATE|DELETE|DROP|UNION)/i.test(trimmed))) {
          error = 'Invalid characters detected.';
        }
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Prevent completely invalid keystrokes for specific fields
    if (name === 'fullName' && /[^A-Za-z\s\-']/.test(value)) return;
    if (name === 'phoneNumber' && /[^\d]/.test(value)) return;
    if (name === 'username' && /[^A-Za-z0-9_]/.test(value)) return;
    if (name === 'governmentId' && /[^A-Za-z0-9]/.test(value)) return;

    let newVal = type === 'checkbox' ? checked : value;

    if (type === 'text' || type === 'email' || type === 'password' || type === 'textarea') {
      newVal = value.trimStart(); // Trimming leading spaces immediately
    }

    setFormData(prev => {
      const nextData = { ...prev, [name]: newVal };
      if (touched[name]) {
        setErrors(errs => ({ ...errs, [name]: validateField(name, newVal, nextData) }));
      }
      if (name === 'password' && touched.confirmPassword) {
        setErrors(errs => ({ ...errs, confirmPassword: validateField('confirmPassword', nextData.confirmPassword, nextData) }));
      }
      return nextData;
    });
  };

  const handleBlur = (e) => {
    const { name, value, type } = e.target;
    let finalValue = value;
    if (type === 'text' || type === 'email' || type === 'password' || type === 'textarea') {
      finalValue = value.trim();
      setFormData(prev => ({ ...prev, [name]: finalValue }));
    }
    
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({
      ...prev,
      [name]: validateField(name, finalValue, formData)
    }));
  };

  const getPasswordStrength = () => {
    const pw = formData.password;
    if (!pw) return null;
    let strength = 0;
    if (pw.length >= 8) strength++;
    if (/(?=.*[a-z])(?=.*[A-Z])/.test(pw)) strength++;
    if (/\d/.test(pw)) strength++;
    if (/[@$!%*?&]/.test(pw)) strength++;

    if (strength <= 2) return { text: 'Weak', color: '#ef4444' };
    if (strength === 3) return { text: 'Medium', color: '#eab308' };
    return { text: 'Strong', color: '#22c55e' };
  };

  const validateAll = (data) => {
    const newErrors = {};
    Object.keys(data).forEach(key => {
      const err = validateField(key, data[key], data);
      if (err) newErrors[key] = err;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    if (!validateAll(formData)) {
      return addToast('Please fix the errors before submitting', 'error');
    }

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
                <label>Username <span style={{color: '#ef4444'}}>*</span></label>
                <input type="text" className={`form-input ${touched.username && errors.username ? 'is-invalid' : ''}`} style={touched.username && errors.username ? { borderColor: '#ef4444' } : {}} name="username" value={formData.username} onChange={handleChange} onBlur={handleBlur} required minLength="4" />
                {touched.username && errors.username && <div style={{color: '#ef4444', fontSize: '12px', marginTop: '4px'}}>{errors.username}</div>}
              </div>
              <div className="form-group">
                <label>Full Name <span style={{color: '#ef4444'}}>*</span></label>
                <input type="text" className={`form-input ${touched.fullName && errors.fullName ? 'is-invalid' : ''}`} style={touched.fullName && errors.fullName ? { borderColor: '#ef4444' } : {}} name="fullName" value={formData.fullName} onChange={handleChange} onBlur={handleBlur} required />
                {touched.fullName && errors.fullName && <div style={{color: '#ef4444', fontSize: '12px', marginTop: '4px'}}>{errors.fullName}</div>}
              </div>
              <div className="form-group">
                <label>Email Address <span style={{color: '#ef4444'}}>*</span></label>
                <input type="email" className={`form-input ${touched.email && errors.email ? 'is-invalid' : ''}`} style={touched.email && errors.email ? { borderColor: '#ef4444' } : {}} name="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} required />
                {touched.email && errors.email && <div style={{color: '#ef4444', fontSize: '12px', marginTop: '4px'}}>{errors.email}</div>}
              </div>
              <div className="form-group">
                <label>Phone Number <span style={{color: '#ef4444'}}>*</span></label>
                <input type="text" className={`form-input ${touched.phoneNumber && errors.phoneNumber ? 'is-invalid' : ''}`} style={touched.phoneNumber && errors.phoneNumber ? { borderColor: '#ef4444' } : {}} name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} onBlur={handleBlur} required />
                {touched.phoneNumber && errors.phoneNumber && <div style={{color: '#ef4444', fontSize: '12px', marginTop: '4px'}}>{errors.phoneNumber}</div>}
              </div>
              <div className="form-group">
                <label>Password {editMode ? '(Leave blank to keep current)' : <span style={{color: '#ef4444'}}>*</span>}</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? 'text' : 'password'} className={`form-input ${touched.password && errors.password ? 'is-invalid' : ''}`} style={{ width: '100%', paddingRight: '40px', ...(touched.password && errors.password ? { borderColor: '#ef4444' } : {}) }} name="password" value={formData.password} onChange={handleChange} onBlur={handleBlur} required={!editMode} minLength="8" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {touched.password && errors.password && <div style={{color: '#ef4444', fontSize: '12px', marginTop: '4px'}}>{errors.password}</div>}
                {getPasswordStrength() && !errors.password && (
                  <div style={{ marginTop: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, height: '4px', backgroundColor: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: getPasswordStrength().text === 'Weak' ? '33%' : getPasswordStrength().text === 'Medium' ? '66%' : '100%', backgroundColor: getPasswordStrength().color, transition: 'all 0.3s' }}></div>
                    </div>
                    <span style={{ color: getPasswordStrength().color, fontWeight: '500' }}>{getPasswordStrength().text}</span>
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Confirm Password {editMode ? '' : <span style={{color: '#ef4444'}}>*</span>}</label>
                <div style={{ position: 'relative' }}>
                  <input type={showConfirmPassword ? 'text' : 'password'} className={`form-input ${touched.confirmPassword && errors.confirmPassword ? 'is-invalid' : ''}`} style={{ width: '100%', paddingRight: '40px', ...(touched.confirmPassword && errors.confirmPassword ? { borderColor: '#ef4444' } : {}) }} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} onBlur={handleBlur} required={!editMode && !!formData.password} minLength="8" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>
                    {showConfirmPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {touched.confirmPassword && errors.confirmPassword && <div style={{color: '#ef4444', fontSize: '12px', marginTop: '4px'}}>{errors.confirmPassword}</div>}
              </div>
            </div>
          </section>

          {/* Professional Information */}
          <section>
            <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px' }}>Professional Information</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label>Professional Title (e.g. Java Developer)</label>
                <input type="text" className={`form-input ${touched.professionalTitle && errors.professionalTitle ? 'is-invalid' : ''}`} style={touched.professionalTitle && errors.professionalTitle ? { borderColor: '#ef4444' } : {}} name="professionalTitle" value={formData.professionalTitle} onChange={handleChange} onBlur={handleBlur} />
                {touched.professionalTitle && errors.professionalTitle && <div style={{color: '#ef4444', fontSize: '12px', marginTop: '4px'}}>{errors.professionalTitle}</div>}
              </div>
              <div className="form-group">
                <label>Years of Experience</label>
                <select className={`form-input ${touched.experienceYears && errors.experienceYears ? 'is-invalid' : ''}`} style={touched.experienceYears && errors.experienceYears ? { borderColor: '#ef4444' } : {}} name="experienceYears" value={formData.experienceYears} onChange={handleChange} onBlur={handleBlur}>
                  <option value="0-1">0-1</option>
                  <option value="1-3">1-3</option>
                  <option value="3-5">3-5</option>
                  <option value="5-10">5-10</option>
                  <option value="10+">10+</option>
                </select>
                {touched.experienceYears && errors.experienceYears && <div style={{color: '#ef4444', fontSize: '12px', marginTop: '4px'}}>{errors.experienceYears}</div>}
              </div>
              <div className="form-group">
                <label>Highest Qualification</label>
                <select className={`form-input ${touched.highestQualification && errors.highestQualification ? 'is-invalid' : ''}`} style={touched.highestQualification && errors.highestQualification ? { borderColor: '#ef4444' } : {}} name="highestQualification" value={formData.highestQualification} onChange={handleChange} onBlur={handleBlur}>
                  <option value="Diploma">Diploma</option>
                  <option value="Bachelor's Degree">Bachelor's Degree</option>
                  <option value="Master's Degree">Master's Degree</option>
                  <option value="M.Tech">M.Tech</option>
                  <option value="MCA">MCA</option>
                  <option value="MBA">MBA</option>
                  <option value="PhD">PhD</option>
                  <option value="Other">Other</option>
                </select>
                {touched.highestQualification && errors.highestQualification && <div style={{color: '#ef4444', fontSize: '12px', marginTop: '4px'}}>{errors.highestQualification}</div>}
              </div>
              <div className="form-group">
                <label>LinkedIn / Portfolio URL</label>
                <input type="url" className={`form-input ${touched.portfolioUrl && errors.portfolioUrl ? 'is-invalid' : ''}`} style={touched.portfolioUrl && errors.portfolioUrl ? { borderColor: '#ef4444' } : {}} name="portfolioUrl" value={formData.portfolioUrl} onChange={handleChange} onBlur={handleBlur} />
                {touched.portfolioUrl && errors.portfolioUrl && <div style={{color: '#ef4444', fontSize: '12px', marginTop: '4px'}}>{errors.portfolioUrl}</div>}
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Skills / Expertise (Comma-separated)</label>
                <input type="text" className={`form-input ${touched.skills && errors.skills ? 'is-invalid' : ''}`} style={touched.skills && errors.skills ? { borderColor: '#ef4444' } : {}} name="skills" value={formData.skills} onChange={handleChange} onBlur={handleBlur} placeholder="e.g. React, Node.js, Python" />
                {touched.skills && errors.skills && <div style={{color: '#ef4444', fontSize: '12px', marginTop: '4px'}}>{errors.skills}</div>}
              </div>
            </div>
          </section>

          {/* Identity & Verification */}
          <section>
            <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px' }}>Identity & Verification</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label>Government ID Number</label>
                <input type="text" className={`form-input ${touched.governmentId && errors.governmentId ? 'is-invalid' : ''}`} style={touched.governmentId && errors.governmentId ? { borderColor: '#ef4444' } : {}} name="governmentId" value={formData.governmentId} onChange={handleChange} onBlur={handleBlur} placeholder="Optional for dev" />
                {touched.governmentId && errors.governmentId && <div style={{color: '#ef4444', fontSize: '12px', marginTop: '4px'}}>{errors.governmentId}</div>}
              </div>
              <div className="form-group">
                <label>Resume/CV (URL or Upload PDF/DOC)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" className={`form-input ${touched.resumeUrl && errors.resumeUrl ? 'is-invalid' : ''}`} style={{ flex: 1, ...(touched.resumeUrl && errors.resumeUrl ? { borderColor: '#ef4444' } : {}) }} name="resumeUrl" value={formData.resumeUrl} onChange={handleChange} onBlur={handleBlur} placeholder="https://..." />
                  <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', margin: 0, display: 'flex', alignItems: 'center' }}>
                    Upload
                    <input type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'resumeUrl')} />
                  </label>
                </div>
                {touched.resumeUrl && errors.resumeUrl && <div style={{color: '#ef4444', fontSize: '12px', marginTop: '4px'}}>{errors.resumeUrl}</div>}
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Profile Photo (URL or Upload Image)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" className={`form-input ${touched.thumbnailUrl && errors.thumbnailUrl ? 'is-invalid' : ''}`} style={{ flex: 1, ...(touched.thumbnailUrl && errors.thumbnailUrl ? { borderColor: '#ef4444' } : {}) }} name="thumbnailUrl" value={formData.thumbnailUrl} onChange={handleChange} onBlur={handleBlur} placeholder="https://..." />
                  <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', margin: 0, display: 'flex', alignItems: 'center' }}>
                    Upload
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'thumbnailUrl')} />
                  </label>
                </div>
                {touched.thumbnailUrl && errors.thumbnailUrl && <div style={{color: '#ef4444', fontSize: '12px', marginTop: '4px'}}>{errors.thumbnailUrl}</div>}
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
                <select className="form-input" name="preferredLanguage" value={formData.preferredLanguage} onChange={handleChange} onBlur={handleBlur}>
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Mandarin">Mandarin</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Short Bio / About Me</label>
                <textarea className={`form-input ${touched.bio && errors.bio ? 'is-invalid' : ''}`} style={{ height: '100px', resize: 'vertical', ...(touched.bio && errors.bio ? { borderColor: '#ef4444' } : {}) }} name="bio" value={formData.bio} onChange={handleChange} onBlur={handleBlur} placeholder="Tell us about yourself..." maxLength="300" />
                <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {formData.bio ? formData.bio.length : 0}/300
                </div>
                {touched.bio && errors.bio && <div style={{color: '#ef4444', fontSize: '12px', marginTop: '4px'}}>{errors.bio}</div>}
              </div>
            </div>
          </section>

          {/* Agreements */}
          <section>
            <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px' }}>Agreements</h4>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontWeight: 'normal' }}>
                <input type="checkbox" name="agreedToTerms" checked={formData.agreedToTerms} onChange={handleChange} style={{ marginTop: '4px' }} disabled={editMode} />
                <span>I agree to the instructor terms and conditions and confirm that the information provided is correct. <span style={{color: '#ef4444'}}>*</span></span>
              </label>
            </div>
          </section>

          <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('admin-users', { filterRole: 'INSTRUCTOR' })} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || (Object.values(errors).some(err => !!err)) || !formData.agreedToTerms}>
              {loading ? 'Processing...' : (editMode ? '💾 Save Changes' : '✨ Create Instructor')}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
