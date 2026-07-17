import React, { useState, useEffect } from 'react';

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

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Validate single field
  const validateField = (name, value, currentFormData = formData) => {
    let error = '';
    const trimmed = typeof value === 'string' ? value.trim() : value;
    
    switch (name) {
      case 'fullName':
        if (!trimmed) error = 'Full Name is required.';
        else if (trimmed.length < 3 || trimmed.length > 100) error = 'Full Name must be between 3 and 100 characters.';
        else if (/\s{2,}/.test(trimmed)) error = 'Multiple consecutive spaces are not allowed.';
        else if (!/^[A-Za-z\s\-']+$/.test(trimmed)) error = 'Only letters, spaces, hyphens, and apostrophes are allowed.';
        break;
      case 'username':
        if (!trimmed) error = 'Username is required.';
        else if (trimmed.length < 4 || trimmed.length > 30) error = 'Username must be between 4 and 30 characters.';
        else if (/\s/.test(trimmed)) error = 'Username cannot contain spaces.';
        else if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) error = 'Only letters, numbers, and underscores are allowed.';
        break;
      case 'email':
        if (!trimmed) error = 'Email is required.';
        else if (trimmed.length > 255) error = 'Maximum 255 characters allowed.';
        else if (!/^[A-Za-z0-9._%+-]+@gmail\.com$/.test(trimmed)) error = 'Please enter a valid @gmail.com address.';
        break;
      case 'phoneNumber':
        if (!trimmed) error = 'Phone Number is required.';
        else if (!/^\d{10}$/.test(trimmed)) error = 'Phone number must be exactly 10 digits.';
        break;
      case 'password':
        if (!trimmed) error = 'Password is required.';
        else if (trimmed.length < 8 || trimmed.length > 64) error = 'Password must be between 8 and 64 characters.';
        else if (/\s/.test(trimmed)) error = 'Password cannot contain spaces.';
        else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(trimmed)) error = 'Must contain uppercase, lowercase, number, and one of @$!%*?&.';
        else if (!/^[a-zA-Z0-9@$!%*?&]+$/.test(trimmed)) error = 'Password contains invalid special characters.';
        break;
      case 'confirmPassword':
        if (!trimmed) error = 'Confirm Password is required.';
        else if (trimmed !== currentFormData.password) error = 'Passwords do not match.';
        break;
      case 'college':
        if (trimmed && (trimmed.length < 2 || trimmed.length > 150)) error = 'Must be between 2 and 150 characters.';
        else if (trimmed && !/^[A-Za-z\s,.\-'()]+$/.test(trimmed)) error = 'Only letters and basic punctuation allowed.';
        break;
      case 'course':
        if (trimmed && trimmed.length > 100) error = 'Maximum 100 characters allowed.';
        else if (trimmed && !/^[A-Za-z\s\-]+$/.test(trimmed)) error = 'Only letters, spaces, and hyphens allowed.';
        break;
      case 'department':
        if (trimmed && trimmed.length > 100) error = 'Maximum 100 characters allowed.';
        else if (trimmed && !/^[A-Za-z\s\-]+$/.test(trimmed)) error = 'Only letters, spaces, and hyphens allowed.';
        break;
      case 'thumbnailUrl':
        if (trimmed && !/^https:\/\//.test(trimmed)) error = 'URL must start with https://';
        break;
      case 'bio':
        if (trimmed && trimmed.length > 300) error = 'Maximum 300 characters allowed.';
        else if (trimmed && /[<>]/.test(trimmed)) error = 'HTML tags are not allowed.';
        break;
      case 'dateOfBirth':
        if (trimmed) {
          const dob = new Date(trimmed);
          const today = new Date();
          let age = today.getFullYear() - dob.getFullYear();
          const m = today.getMonth() - dob.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
              age--;
          }
          if (dob > today) error = 'Future dates are not allowed.';
          else if (age < 13) error = 'Minimum age is 13 years.';
        }
        break;
    }
    return error;
  };

  const validateAll = (data) => {
    const newErrors = {};
    let isValid = true;
    
    // Check required fields
    ['fullName', 'username', 'email', 'phoneNumber', 'password', 'confirmPassword'].forEach(field => {
      const err = validateField(field, data[field], data);
      if (err) {
        newErrors[field] = err;
        isValid = false;
      }
    });

    // Check agreements
    if (!data.agreedToTerms) isValid = false;
    if (!data.agreedToPrivacy) isValid = false;

    setErrors(newErrors);
    setIsFormValid(isValid);
    return isValid;
  };

  useEffect(() => {
    validateAll(formData);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (['college', 'course', 'department'].includes(name) && /\d/.test(value)) {
      return; // Do not accept numbers for these fields
    }

    const finalValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: finalValue };
      const fieldError = validateField(name, finalValue, newData);
      setErrors(errs => ({ ...errs, [name]: fieldError }));
      return newData;
    });
  };

  const handleBlur = (e) => {
    const { name, value, type } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    if (type === 'text' || type === 'email' || type === 'password' || type === 'textarea') {
      const trimmed = value.trim();
      setFormData(prev => ({ ...prev, [name]: trimmed }));
    }
  };

  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit.");
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert("Only JPG, JPEG, PNG, and WEBP formats are allowed.");
      return;
    }

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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Mark all as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    if (validateAll(formData)) {
      onSubmit(formData);
    }
  };

  const pwStrength = getPasswordStrength();

  return (
    <div className="card" style={{ maxWidth: '800px', margin: '0 auto', padding: '30px' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* Personal Information */}
        <section>
          <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px' }}>Personal Information</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label>Full Name <span style={{color: '#ef4444'}}>*</span></label>
              <input type="text" className={`form-input ${touched.fullName && errors.fullName ? 'is-invalid' : ''}`} style={touched.fullName && errors.fullName ? { borderColor: '#ef4444' } : {}} name="fullName" value={formData.fullName} onChange={handleChange} onBlur={handleBlur} required />
              {touched.fullName && errors.fullName && <div style={{color: '#ef4444', fontSize: '12px', marginTop: '4px'}}>{errors.fullName}</div>}
            </div>
            <div className="form-group">
              <label>Username <span style={{color: '#ef4444'}}>*</span></label>
              <input type="text" className={`form-input ${touched.username && errors.username ? 'is-invalid' : ''}`} style={touched.username && errors.username ? { borderColor: '#ef4444' } : {}} name="username" value={formData.username} onChange={handleChange} onBlur={handleBlur} required minLength="3" />
              {touched.username && errors.username && <div style={{color: '#ef4444', fontSize: '12px', marginTop: '4px'}}>{errors.username}</div>}
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
              <label>Date of Birth</label>
              <input type="date" className={`form-input ${touched.dateOfBirth && errors.dateOfBirth ? 'is-invalid' : ''}`} style={touched.dateOfBirth && errors.dateOfBirth ? { borderColor: '#ef4444' } : {}} name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} onBlur={handleBlur} />
              {touched.dateOfBirth && errors.dateOfBirth && <div style={{color: '#ef4444', fontSize: '12px', marginTop: '4px'}}>{errors.dateOfBirth}</div>}
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select className="form-input" name="gender" value={formData.gender} onChange={handleChange} onBlur={handleBlur}>
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
              <label>Password <span style={{color: '#ef4444'}}>*</span></label>
              <input type="password" className={`form-input ${touched.password && errors.password ? 'is-invalid' : ''}`} style={touched.password && errors.password ? { borderColor: '#ef4444' } : {}} name="password" value={formData.password} onChange={handleChange} onBlur={handleBlur} required minLength="6" />
              {pwStrength && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                   <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Strength:</span>
                   <span style={{ fontSize: '12px', fontWeight: 'bold', color: pwStrength.color }}>{pwStrength.text}</span>
                </div>
              )}
              {touched.password && errors.password && <div style={{color: '#ef4444', fontSize: '12px', marginTop: '4px'}}>{errors.password}</div>}
            </div>
            <div className="form-group">
              <label>Confirm Password <span style={{color: '#ef4444'}}>*</span></label>
              <input type="password" className={`form-input ${touched.confirmPassword && errors.confirmPassword ? 'is-invalid' : ''}`} style={touched.confirmPassword && errors.confirmPassword ? { borderColor: '#ef4444' } : {}} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} onBlur={handleBlur} required minLength="6" />
              {touched.confirmPassword && errors.confirmPassword && <div style={{color: '#ef4444', fontSize: '12px', marginTop: '4px'}}>{errors.confirmPassword}</div>}
            </div>
          </div>
        </section>

        {/* Education Information */}
        <section>
          <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px' }}>Education Information</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label>Highest Qualification</label>
              <select className="form-input" name="highestQualification" value={formData.highestQualification} onChange={handleChange} onBlur={handleBlur}>
                <option value="">Select Qualification</option>
                <option value="SSLC">SSLC</option>
                <option value="HSC">HSC</option>
                <option value="Diploma">Diploma</option>
                <option value="Bachelor's Degree">Bachelor's Degree</option>
                <option value="Master's Degree">Master's Degree</option>
                <option value="PhD">PhD</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>College/University</label>
              <input type="text" className={`form-input ${touched.college && errors.college ? 'is-invalid' : ''}`} style={touched.college && errors.college ? { borderColor: '#ef4444' } : {}} name="college" value={formData.college} onChange={handleChange} onBlur={handleBlur} />
              {touched.college && errors.college && <div style={{color: '#ef4444', fontSize: '12px', marginTop: '4px'}}>{errors.college}</div>}
            </div>
            <div className="form-group">
              <label>Course</label>
              <input type="text" className={`form-input ${touched.course && errors.course ? 'is-invalid' : ''}`} style={touched.course && errors.course ? { borderColor: '#ef4444' } : {}} name="course" value={formData.course} onChange={handleChange} onBlur={handleBlur} />
              {touched.course && errors.course && <div style={{color: '#ef4444', fontSize: '12px', marginTop: '4px'}}>{errors.course}</div>}
            </div>
            <div className="form-group">
              <label>Department</label>
              <input type="text" className={`form-input ${touched.department && errors.department ? 'is-invalid' : ''}`} style={touched.department && errors.department ? { borderColor: '#ef4444' } : {}} name="department" value={formData.department} onChange={handleChange} onBlur={handleBlur} />
              {touched.department && errors.department && <div style={{color: '#ef4444', fontSize: '12px', marginTop: '4px'}}>{errors.department}</div>}
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
                <input type="text" className={`form-input ${touched.thumbnailUrl && errors.thumbnailUrl ? 'is-invalid' : ''}`} style={touched.thumbnailUrl && errors.thumbnailUrl ? { borderColor: '#ef4444', flex: 1 } : { flex: 1 }} name="thumbnailUrl" value={formData.thumbnailUrl} onChange={handleChange} onBlur={handleBlur} placeholder="https://..." />
                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', margin: 0, display: 'flex', alignItems: 'center' }}>
                  Upload
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/jpg" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'thumbnailUrl')} />
                </label>
              </div>
              {touched.thumbnailUrl && errors.thumbnailUrl && <div style={{color: '#ef4444', fontSize: '12px', marginTop: '4px'}}>{errors.thumbnailUrl}</div>}
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Short Bio</label>
              <textarea className={`form-input ${touched.bio && errors.bio ? 'is-invalid' : ''}`} style={touched.bio && errors.bio ? { borderColor: '#ef4444' } : {}} name="bio" value={formData.bio} onChange={handleChange} onBlur={handleBlur} rows="3" placeholder="Tell us about yourself..." maxLength="300"></textarea>
              <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--text-muted)' }}>{formData.bio.length}/300</div>
              {touched.bio && errors.bio && <div style={{color: '#ef4444', fontSize: '12px', marginTop: '4px'}}>{errors.bio}</div>}
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section>
          <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px' }}>Preferences (Optional)</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label>Preferred Learning Language</label>
              <select className="form-input" name="preferredLanguage" value={formData.preferredLanguage} onChange={handleChange} onBlur={handleBlur}>
                <option value="English">English</option>
                <option value="Tamil">Tamil</option>
                <option value="Hindi">Hindi</option>
                <option value="Telugu">Telugu</option>
                <option value="Malayalam">Malayalam</option>
                <option value="Kannada">Kannada</option>
              </select>
            </div>
            <div className="form-group">
              <label>Areas of Interest</label>
              <input type="text" className="form-input" name="areasOfInterest" value={formData.areasOfInterest} onChange={handleChange} onBlur={handleBlur} placeholder="Programming, AI, Web Dev..." />
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
          <button type="submit" className="btn btn-primary" disabled={loading || !isFormValid}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </div>
      </form>
    </div>
  );
}
