import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api.js';
import SearchableSelect from '../components/SearchableSelect';

export default function AdminCourses({ currentParams, navigate, addToast, fetchNotifications }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal and form state
  const [showModal, setShowModal] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [categories, setCategories] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initialFormState = {
    title: '',
    subtitle: '',
    description: '',
    price: 0,
    thumbnailUrl: '',
    categoryId: '',
    instructorId: '',
    reviewStatus: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const list = await apiFetch('/courses');
      setCourses(list || []);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadModalData = async () => {
    try {
      const [cats, users] = await Promise.all([
        apiFetch('/categories'),
        apiFetch('/users')
      ]);
      setCategories((cats || []).map(c => ({ id: c.id, label: c.name })));
      setInstructors((users || []).filter(u => u.role === 'INSTRUCTOR').map(i => ({ id: i.id, label: `${i.username} (${i.email})` })));
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  useEffect(() => {
    loadCourses();
    loadModalData();
    if (currentParams?.openNewCourse) {
      openNewModal();
    }
  }, [currentParams]);

  const handleFormChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleFormSubmit = async (e, isDraft = false, isPublish = false) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!formData.categoryId) return addToast('Please select a category', 'error');
    if (!formData.instructorId) return addToast('Please select an instructor', 'error');

    setIsSubmitting(true);
    try {
      const method = editingCourseId ? 'PUT' : 'POST';
      const endpoint = editingCourseId ? `/courses/${editingCourseId}` : '/courses';
      
      const payload = {
        ...formData,
        price: parseFloat(formData.price) || 0
      };
      
      if (isDraft === true) {
        payload.reviewStatus = 'DRAFT';
      } else if (isPublish === true) {
        payload.reviewStatus = 'APPROVED';
      } else if (editingCourseId) {
        payload.reviewStatus = formData.reviewStatus;
      }

      await apiFetch(endpoint, {
        method: method,
        body: JSON.stringify(payload)
      });
      addToast(editingCourseId ? (isPublish ? 'Course published successfully! 🚀' : 'Course updated successfully! 🚀') : (isDraft === true ? 'Course saved as draft! 🚀' : 'Course created and published successfully! 🚀'), 'success');
      setShowModal(false);
      setFormData(initialFormState);
      setEditingCourseId(null);
      loadCourses();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const approveReview = async (id) => {
    try {
      await apiFetch(`/courses/${id}/approve`, { method: 'POST' });
      addToast('Course review approved and published! 🚀', 'success');
      fetchNotifications();
      loadCourses();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const rejectReview = async (id) => {
    try {
      await apiFetch(`/courses/${id}/reject`, { method: 'POST' });
      addToast('Course review rejected. Notification dispatched.', 'info');
      fetchNotifications();
      loadCourses();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const deleteCourse = (id) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiFetch(`/courses/${deleteTarget}`, { method: 'DELETE' });
      addToast('Course deleted successfully.', 'info');
      loadCourses();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  const openNewModal = () => {
    setFormData(initialFormState);
    setEditingCourseId(null);
    setShowModal(true);
  };

  const openUpdateModal = (c) => {
    setFormData({
      title: c.title || '',
      subtitle: c.subtitle || '',
      description: c.description || '',
      price: c.price || 0,
      thumbnailUrl: c.thumbnailUrl || '',
      categoryId: c.categoryId || '',
      instructorId: c.instructorId || '',
      reviewStatus: c.reviewStatus || 'DRAFT'
    });
    setEditingCourseId(c.id);
    setShowModal(true);
  };

  if (loading) {
    return <div className="loading-overlay" style={{ position: 'relative', height: '100px' }}><div className="spinner"></div></div>;
  }

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.instructorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.categoryName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <h3>All Courses ({filteredCourses.length})</h3>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Search courses..."
            className="form-input" 
            style={{ width: '250px' }}
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
          <button className="btn btn-primary btn-sm" onClick={openNewModal}>➕ New Course</button>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Instructor</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No courses found.
                </td>
              </tr>
            ) : (
              filteredCourses.map((c, index) => {
                const statusLabel = c.reviewStatus === 'APPROVED' ? 'Published' : c.reviewStatus === 'PENDING' ? 'Pending Review' : c.reviewStatus === 'REJECTED' ? 'Rejected' : 'Draft';
              const badgeClass = c.reviewStatus === 'APPROVED' ? 'badge-published' : 'badge-draft';

              return (
                <tr key={c.id}>
                  <td className="text-muted">{index + 1}</td>
                  <td><strong>{c.title}</strong></td>
                  <td>{c.instructorName || '—'}</td>
                  <td>{c.categoryName || 'Uncategorized'}</td>
                  <td>₹{(c.price || 0).toFixed(2)}</td>
                  <td>
                    <span className={badgeClass} style={{ display: 'inline-block', fontSize: '11px', fontWeight: '600', padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase' }}>
                      {statusLabel}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-secondary btn-sm" onClick={() => navigate('course-detail', { courseId: c.id })}>View</button>
                      <button className="btn btn-primary btn-sm" onClick={() => openUpdateModal(c)}>Update</button>
                      {c.reviewStatus === 'PENDING' ? (
                        <React.Fragment>
                          <button className="btn btn-success btn-sm" onClick={() => approveReview(c.id)}>Approve</button>
                          <button className="btn btn-danger btn-sm" onClick={() => rejectReview(c.id)}>Reject</button>
                        </React.Fragment>
                      ) : (
                        <button className="btn btn-danger btn-sm" onClick={() => deleteCourse(c.id)}>Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
          </tbody>
        </table>
      </div>

      {/* CREATE COURSE MODAL */}
      {showModal && (
        <div className="modal-overlay open">
          <div className="modal" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>{editingCourseId ? 'Update Course' : 'Create & Assign Course'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={(e) => handleFormSubmit(e, false, false)} className="modal-body">
              <div className="form-group mb-3">
                <label className="form-label">Course Title *</label>
                <input id="title" className="form-input" placeholder="e.g. Advanced React" value={formData.title} onChange={handleFormChange} required />
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Subtitle</label>
                <input id="subtitle" className="form-input" placeholder="Short tagline" value={formData.subtitle} onChange={handleFormChange} />
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Description</label>
                <textarea id="description" className="form-input" rows="3" placeholder="What will students learn?" value={formData.description} onChange={handleFormChange}></textarea>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="mb-3">
                <div className="form-group">
                  <label className="form-label">Assign Category *</label>
                  <SearchableSelect
                    options={categories}
                    value={formData.categoryId}
                    onChange={(val) => setFormData({ ...formData, categoryId: val })}
                    placeholder="Search category..."
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Assign Instructor *</label>
                  <SearchableSelect
                    options={instructors}
                    value={formData.instructorId}
                    onChange={(val) => setFormData({ ...formData, instructorId: val })}
                    placeholder="Search instructor..."
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="mb-4">
                <div className="form-group">
                  <label className="form-label">Price (₹)</label>
                  <input id="price" type="number" min="0" step="0.01" className="form-input" value={formData.price} onChange={handleFormChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Thumbnail URL</label>
                  <input id="thumbnailUrl" type="url" className="form-input" placeholder="https://..." value={formData.thumbnailUrl} onChange={handleFormChange} />
                </div>
              </div>

              <div className="modal-footer" style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                {!editingCourseId && (
                  <button type="button" className="btn btn-secondary" onClick={(e) => handleFormSubmit(e, true, false)} disabled={isSubmitting}>
                    Save as Draft
                  </button>
                )}
                {editingCourseId && formData.reviewStatus !== 'APPROVED' && (
                  <button type="button" className="btn btn-success" onClick={(e) => handleFormSubmit(e, false, true)} disabled={isSubmitting}>
                    Update & Publish
                  </button>
                )}
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : editingCourseId ? 'Update Course' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="modal-overlay open" onClick={() => setDeleteTarget(null)} style={{ zIndex: 1000 }}>
          <div className="modal" style={{ width: '400px', textAlign: 'center', padding: '32px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 16px 0', width: '100%', textAlign: 'center' }}>
              Delete Course
            </h3>
            <div style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '15px' }}>
              Are you sure you want to delete this course permanently? This action cannot be undone.
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
