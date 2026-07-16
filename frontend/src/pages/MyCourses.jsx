import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api.js';

export default function MyCourses({ view, course, navigate, addToast }) {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    price: 0,
    categoryId: '',
    thumbnailUrl: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      if (view === 'my-courses') {
        const list = await apiFetch('/courses');
        setCourses(list || []);
      } else if (view === 'create-course' || view === 'edit-course') {
        const catList = await apiFetch('/categories');
        setCategories(catList || []);
        if (view === 'edit-course' && course) {
          setFormData({
            title: course.title || '',
            subtitle: course.subtitle || '',
            description: course.description || '',
            price: course.price || 0,
            categoryId: course.categoryId || (catList[0]?.id || ''),
            thumbnailUrl: course.thumbnailUrl || ''
          });
        } else {
          setFormData({
            title: '',
            subtitle: '',
            description: '',
            price: 0,
            categoryId: catList[0]?.id || '',
            thumbnailUrl: ''
          });
        }
      } else if (view === 'instructor-students') {
        const rawStudents = await apiFetch('/instructor/enrollments');
        const filtered = rawStudents ? rawStudents.filter(e => e.studentName && e.studentName !== 'Deleted Student' && e.studentId !== null) : [];
        setStudents(filtered);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [view, course]);

  const handleFormChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: id === 'price' ? parseFloat(value) || 0 : id === 'categoryId' ? parseInt(value) : value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categoryId) {
      addToast('Please select a category', 'error');
      return;
    }
    try {
      if (view === 'create-course') {
        await apiFetch('/courses', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        addToast('Course created successfully! 🚀', 'success');
      } else {
        await apiFetch(`/courses/${course.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
        addToast('Course updated successfully! 💾', 'success');
      }
      navigate('my-courses');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const submitCourseReview = async (courseId) => {
    try {
      await apiFetch(`/courses/${courseId}/submit-review`, { method: 'POST' });
      addToast('Course submitted for review! 🚀', 'success');
      loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const deleteCourse = (courseId) => {
    setDeleteTarget(courseId);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiFetch(`/courses/${deleteTarget}`, { method: 'DELETE' });
      addToast('Course deleted successfully.', 'info');
      loadData();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  if (loading) {
    return <div className="loading-overlay" style={{ position: 'relative', height: '100px' }}><div className="spinner"></div></div>;
  }

  // ─── CREATE / EDIT FORM VIEW ───
  if (view === 'create-course' || view === 'edit-course') {
    return (
      <div style={{ maxWidth: '640px' }}>
        <div className="stat-card">
          <form onSubmit={handleFormSubmit}>
            <div className="form-group mb-3">
              <label className="form-label">Course Title *</label>
              <input id="title" className="form-input" placeholder="e.g. Advanced JavaScript" value={formData.title} onChange={handleFormChange} required />
            </div>
            <div className="form-group mb-3">
              <label className="form-label">Subtitle</label>
              <input id="subtitle" className="form-input" placeholder="Short tagline" value={formData.subtitle} onChange={handleFormChange} />
            </div>
            <div className="form-group mb-3">
              <label className="form-label">Description</label>
              <textarea id="description" className="form-input" rows="4" placeholder="What will students learn?" value={formData.description} onChange={handleFormChange}></textarea>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="mb-3">
              <div className="form-group">
                <label className="form-label">Price (₹)</label>
                <input id="price" type="number" min="0" step="0.01" className="form-input" value={formData.price} onChange={handleFormChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select id="categoryId" className="form-input" value={formData.categoryId} onChange={handleFormChange} required>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group mb-4">
              <label className="form-label">Thumbnail URL</label>
              <input id="thumbnailUrl" type="url" className="form-input" placeholder="https://..." value={formData.thumbnailUrl} onChange={handleFormChange} />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary">
                {view === 'edit-course' ? '💾 Save Changes' : '🚀 Create Course'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('my-courses')}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ─── ENROLLED STUDENTS LIST VIEW ───
  if (view === 'instructor-students') {
    return (
      <div>
        {students.length === 0 ? (
          <div className="empty-state">No enrolled students yet.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Course Title</th>
                  <th>Enrolled On</th>
                  <th style={{ width: '300px' }}>Progress</th>
                </tr>
              </thead>
              <tbody>
                {students.map(e => {
                  const progress = e.progressPercentage || 0;
                  const formattedDate = new Date(e.enrolledAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  });
                  return (
                    <tr key={e.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <span style={{ fontSize: '16px' }}>👤</span>
                          <strong>{e.studentName}</strong>
                        </div>
                      </td>
                      <td>
                        <span className="chip" style={{ fontSize: '12px', fontWeight: 'normal' }}>{e.courseTitle}</span>
                      </td>
                      <td className="text-sm text-muted">{formattedDate}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div className="progress-bar" style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div className="progress-fill" style={{ width: `${progress}%`, height: '100%', background: 'var(--grad-primary)', borderRadius: '4px' }}></div>
                          </div>
                          <span className="font-bold text-sm" style={{ minWidth: '45px', textAlign: 'right' }}>{Math.round(progress)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // ─── COURSE LIST VIEW ───
  return (
    <div>
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <h3>My Assigned Courses</h3>
      </div>

      <div className="courses-grid">
        {courses.length === 0 ? (
          <div className="empty-state" style={{ width: '100%' }}>No courses assigned yet.</div>
        ) : (
          courses.map(c => {
            const statusLabel = c.reviewStatus === 'APPROVED' ? 'Published' : c.reviewStatus === 'PENDING' ? 'Pending Review' : c.reviewStatus === 'REJECTED' ? 'Rejected' : 'Draft';
            const badgeClass = c.reviewStatus === 'APPROVED' ? 'badge-published' : 'badge-draft';

            return (
              <div key={c.id} className="course-card">
                <div className="course-thumb">
                  {c.thumbnailUrl ? <img src={c.thumbnailUrl} alt={c.title} /> : <div className="course-thumb-placeholder">📖</div>}
                  <span className={`course-badge ${badgeClass}`} style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase' }}>
                    {statusLabel}
                  </span>
                </div>
                <div className="course-body">
                  <div className="course-category">{c.categoryName || 'Uncategorized'}</div>
                  <div className="course-title">{c.title}</div>
                  <div className="course-price">₹{(c.price || 0).toFixed(2)}</div>
                  <div className="course-footer" style={{ display: 'flex', gap: '8px', position: 'relative' }}>
                    <button 
                      className="btn btn-secondary btn-sm btn-full"
                      onClick={() => navigate('course-detail', { courseId: c.id })}
                    >
                      Manage Workspace
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="modal-overlay open" onClick={() => setDeleteTarget(null)} style={{ zIndex: 1000 }}>
          <div className="modal" style={{ width: '400px', textAlign: 'center', padding: '32px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 16px 0', width: '100%', textAlign: 'center' }}>
              Delete Course
            </h3>
            <div style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '15px' }}>
              Are you sure you want to delete this course? This action cannot be undone.
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={confirmDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
