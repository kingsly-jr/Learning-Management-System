import React, { useState } from 'react';

export default function StudentRegistrationForm({ onSubmit, loading, onCancel }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
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
    areasOfInterest: '',
    agreedToTerms: false,
    agreedToPrivacy: false
  });

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
      alert('File uploaded successfully');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="card" style={{ maxWidth: '800px', margin: '0 auto', padding: '30px' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* Personal Information */}
        <section>
          <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px' }}>Personal Information</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label>Full Name *</label>
              <input type="text" className="form-input" name="fullName" value={formData.fullName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Username *</label>
              <input type="text" className="form-input" name="username" value={formData.username} onChange={handleChange} required minLength="3" />
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
              <label>Date of Birth</label>
              <input type="date" className="form-input" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select className="form-input" name="gender" value={formData.gender} onChange={handleChange}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>
        </section>

        {/* Account Information */}
        <section>
          <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px' }}>Account Information</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label>Password *</label>
              <input type="password" className="form-input" name="password" value={formData.password} onChange={handleChange} required minLength="6" />
            </div>
            <div className="form-group">
              <label>Confirm Password *</label>
              <input type="password" className="form-input" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required minLength="6" />
            </div>
          </div>
        </section>

        {/* Education Information */}
        <section>
          <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px' }}>Education Information</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label>Highest Qualification</label>
              <select className="form-input" name="highestQualification" value={formData.highestQualification} onChange={handleChange}>
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
              <input type="text" className="form-input" name="college" value={formData.college} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Course</label>
              <input type="text" className="form-input" name="course" value={formData.course} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Department</label>
              <input type="text" className="form-input" name="department" value={formData.department} onChange={handleChange} />
            </div>
          </div>
        </section>

        {/* Profile Information */}
        <section>
          <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px' }}>Profile Information</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
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
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Short Bio</label>
              <textarea className="form-input" name="bio" value={formData.bio} onChange={handleChange} rows="3" placeholder="Tell us about yourself..." maxLength="300"></textarea>
              <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--text-muted)' }}>{formData.bio.length}/300</div>
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section>
          <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px' }}>Preferences (Optional)</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label>Preferred Learning Language</label>
              <input type="text" className="form-input" name="preferredLanguage" value={formData.preferredLanguage} onChange={handleChange} placeholder="e.g. English, Spanish" />
            </div>
            <div className="form-group">
              <label>Areas of Interest</label>
              <input type="text" className="form-input" name="areasOfInterest" value={formData.areasOfInterest} onChange={handleChange} placeholder="Programming, AI, Web Dev..." />
            </div>
          </div>
        </section>

        {/* Agreement */}
        <section>
          <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px' }}>Agreement</h4>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ margin: 0, fontWeight: 'normal', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input type="checkbox" name="agreedToTerms" checked={formData.agreedToTerms} onChange={handleChange} required />
              I agree to the Terms & Conditions.
            </label>
            <label style={{ margin: 0, fontWeight: 'normal', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input type="checkbox" name="agreedToPrivacy" checked={formData.agreedToPrivacy} onChange={handleChange} required />
              I agree to the Privacy Policy.
            </label>
          </div>
        </section>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '10px' }}>
          {onCancel && (
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
          )}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </div>
      </form>
    </div>
  );
}
