import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api.js';

export default function AdminUsers({ filterRole, navigate, addToast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create User State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createUsername, setCreateUsername] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Edit User State
  const [editingUser, setEditingUser] = useState(null);
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('STUDENT');
  const [editThumbnailUrl, setEditThumbnailUrl] = useState('');
  const [editFormData, setEditFormData] = useState({});

  // View Student State
  const [viewingStudent, setViewingStudent] = useState(null);

  // Enrollments / Instructor Students list modal
  const [selectedUser, setSelectedUser] = useState(null); // holds student/instructor name & id
  const [enrollments, setEnrollments] = useState([]);
  const [password, setPassword] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  // Instructor Courses Modal
  const [instructorCourses, setInstructorCourses] = useState([]);
  const [showCoursesModal, setShowCoursesModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'USER' | 'ENROLLMENT', id: number }

  const loadUsers = async () => {
    setLoading(true);
    try {
      const allUsers = await apiFetch('/users');
      const filtered = allUsers ? allUsers.filter(u => u.role === filterRole) : [];
      setUsers(filtered);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [filterRole]);

  const deleteUser = (id) => {
    setDeleteTarget({ type: 'USER', id });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    
    try {
      if (deleteTarget.type === 'USER') {
        await apiFetch(`/users/${deleteTarget.id}`, { method: 'DELETE' });
        addToast('User deleted successfully.', 'info');
        loadUsers();
      } else if (deleteTarget.type === 'ENROLLMENT') {
        await apiFetch(`/users/enrollments/${deleteTarget.id}`, { method: 'DELETE' });
        addToast('Enrollment deleted successfully.', 'info');
        // Reload list inside modal
        if (selectedUser) {
          const url = selectedUser.type === 'INSTRUCTOR' 
            ? `/users/instructors/${selectedUser.id}/enrollments` 
            : `/users/${selectedUser.id}/enrollments`;
          const data = await apiFetch(url);
          setEnrollments(data || []);
        }
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  const openEditModal = (u) => {
    if (u.role === 'INSTRUCTOR') {
      navigate('admin-edit-instructor', { instructorId: u.id });
    } else {
      setEditingUser(u);
      setEditUsername(u.username);
      setEditEmail(u.email);
      setEditRole(u.role);
      setEditThumbnailUrl(u.thumbnailUrl || '');
      setEditFormData({
        fullName: u.fullName || '',
        phoneNumber: u.phoneNumber || '',
        dateOfBirth: u.dateOfBirth || '',
        gender: u.gender || '',
        highestQualification: u.highestQualification || '',
        college: u.college || '',
        course: u.course || '',
        department: u.department || '',
        bio: u.bio || '',
        preferredLanguage: u.preferredLanguage || '',
        areasOfInterest: u.areasOfInterest || ''
      });
    }
  };

  const handleEditFormChange = (e) => {
    setEditFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editUsername.trim() || !editEmail.trim()) {
      addToast('Username and email are required', 'error');
      return;
    }
    try {
      await apiFetch(`/users/${editingUser.id}`, {
        method: 'PUT',
        body: JSON.stringify({ 
          username: editUsername, 
          email: editEmail, 
          role: editRole, 
          thumbnailUrl: editThumbnailUrl,
          ...editFormData
        })
      });
      addToast('User updated successfully! ✅', 'success');
      setEditingUser(null);
      loadUsers();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createUsername.trim() || !createEmail.trim() || !createPassword.trim()) {
      addToast('All fields are required', 'error');
      return;
    }
    setIsCreating(true);
    try {
      await apiFetch('/users', {
        method: 'POST',
        body: JSON.stringify({ 
          username: createUsername, 
          email: createEmail, 
          password: createPassword, 
          role: filterRole 
        })
      });
      addToast(`${filterRole === 'STUDENT' ? 'Student' : 'Instructor'} created successfully! 🎉`, 'success');
      setShowCreateModal(false);
      setCreateUsername('');
      setCreateEmail('');
      setCreatePassword('');
      loadUsers();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setIsCreating(false);
    }
  };

  // Student Enrollments Modal Actions
  const openEnrollmentsModal = async (studentId, studentName) => {
    setSelectedUser({ id: studentId, name: studentName, type: 'STUDENT' });
    setEnrollments([]);
    setModalLoading(true);
    try {
      const data = await apiFetch(`/users/${studentId}/enrollments`);
      setEnrollments(data || []);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const deleteEnrollment = (enrollId) => {
    setDeleteTarget({ type: 'ENROLLMENT', id: enrollId });
  };

  // Instructor Students Modal Actions
  const openInstructorStudentsModal = async (instructorId, instructorName) => {
    setSelectedUser({ id: instructorId, name: instructorName, type: 'INSTRUCTOR' });
    setEnrollments([]);
    setModalLoading(true);
    try {
      const data = await apiFetch(`/users/instructors/${instructorId}/enrollments`);
      const filtered = data ? data.filter(e => e.studentName && e.studentName !== 'Deleted Student' && e.studentId !== null) : [];
      setEnrollments(filtered);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setModalLoading(false);
    }
  };

  // Instructor Courses Modal Actions
  const openInstructorCoursesModal = async (instructorId, instructorName) => {
    setSelectedUser({ id: instructorId, name: instructorName, type: 'INSTRUCTOR_COURSES' });
    setInstructorCourses([]);
    setModalLoading(true);
    setShowCoursesModal(true);
    try {
      const data = await apiFetch(`/courses/instructor/${instructorId}`);
      setInstructorCourses(data || []);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-overlay" style={{ position: 'relative', height: '100px' }}><div className="spinner"></div></div>;
  }

  const title = filterRole === 'STUDENT' ? 'Student Management' : 'Instructor Management';
  
  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatJoinedDate = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
  };

  return (
    <div>
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <h3>{title}</h3>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder={`Search ${filterRole.toLowerCase()}s...`}
            className="form-input" 
            style={{ width: '250px' }}
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
          <button className="btn btn-primary btn-sm" onClick={() => {
            if (filterRole === 'INSTRUCTOR') {
              navigate('admin-add-instructor');
            } else if (filterRole === 'STUDENT') {
              navigate('admin-add-student');
            } else {
              setCreateUsername('');
              setCreateEmail('');
              setCreatePassword('');
              setShowCreateModal(true);
            }
          }}>
            ➕ New {filterRole === 'STUDENT' ? 'Student' : 'Instructor'}
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Username</th>
              <th>Email</th>
              <th>Joined On</th>
              {filterRole === 'INSTRUCTOR' && (
                <th>Students</th>
              )}
              <th>Courses</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={filterRole === 'INSTRUCTOR' ? 7 : 6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No {filterRole.toLowerCase()}s found.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u, index) => (
                <tr key={u.id}>
                  <td className="text-muted" style={{ fontSize: '12px' }}>{index + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {u.thumbnailUrl ? (
                        <img src={u.thumbnailUrl} alt={u.username} style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px', flexShrink: 0, color: '#fff' }}>
                          {u.username[0].toUpperCase()}
                        </div>
                      )}
                      <strong>{u.username}</strong>
                    </div>
                  </td>
                  <td className="text-muted">{u.email}</td>
                  <td>{formatJoinedDate(u.joinedOn)}</td>
                  {filterRole === 'INSTRUCTOR' && (
                    <td>
                      <span 
                        className="chip" 
                        style={{ fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', transition: 'var(--transition)' }}
                        onClick={() => openInstructorStudentsModal(u.id, u.username)}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                        title="View enrolled students"
                      >
                        👤 {u.studentCount || 0}
                      </span>
                    </td>
                  )}
                  <td>
                    {filterRole === 'INSTRUCTOR' ? (
                      <button className="btn btn-secondary btn-sm" onClick={() => openInstructorCoursesModal(u.id, u.username)}>
                        View Details
                      </button>
                    ) : (
                      <button className="btn btn-secondary btn-sm" onClick={() => openEnrollmentsModal(u.id, u.username)}>
                        View Details
                      </button>
                    )}
                  </td>
                  <td>
                    <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
                      {filterRole === 'STUDENT' && (
                        <button className="btn btn-secondary btn-sm" onClick={() => setViewingStudent(u)}>
                          👁️ View
                        </button>
                      )}
                      {filterRole === 'INSTRUCTOR' && (
                        <button className="btn btn-secondary btn-sm" onClick={() => navigate('admin-view-instructor', { instructorId: u.id })}>
                          👁️ View
                        </button>
                      )}
                      <button className="btn btn-primary btn-sm" onClick={() => openEditModal(u)}>
                        ✏️ Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u.id)}>
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="modal-overlay open" onClick={() => setShowCreateModal(false)}>
          <div className="modal" style={{ width: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create {filterRole === 'STUDENT' ? 'Student' : 'Instructor'}</h3>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="form-group mb-3">
                <label className="form-label">Username</label>
                <input className="form-input" value={createUsername} onChange={e => setCreateUsername(e.target.value)} required />
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" value={createEmail} onChange={e => setCreateEmail(e.target.value)} required />
              </div>
              <div className="form-group mb-4">
                <label className="form-label">Password</label>
                <input type="password" className="form-input" value={createPassword} onChange={e => setCreatePassword(e.target.value)} required />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)} disabled={isCreating}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isCreating}>{isCreating ? 'Creating...' : '🚀 Create User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="modal-overlay open" onClick={() => setEditingUser(null)}>
          <div className="modal" style={{ width: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit {filterRole === 'STUDENT' ? 'Student' : 'Instructor'}</h3>
              <button className="modal-close" onClick={() => setEditingUser(null)}>✕</button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group mb-3">
                <label className="form-label">Username</label>
                <input className="form-input" value={editUsername} onChange={e => setEditUsername(e.target.value)} required />
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" value={editEmail} onChange={e => setEditEmail(e.target.value)} required />
              </div>
              {filterRole === 'INSTRUCTOR' && (
                <div className="form-group mb-3">
                  <label className="form-label">Thumbnail URL</label>
                  <input type="text" className="form-input" placeholder="https://example.com/image.jpg" value={editThumbnailUrl} onChange={e => setEditThumbnailUrl(e.target.value)} />
                </div>
              )}
              <div className="form-group mb-4">
                <label className="form-label">Role</label>
                <select className="form-input" value={editRole} onChange={e => setEditRole(e.target.value)} required>
                  <option value="STUDENT">Student</option>
                  <option value="INSTRUCTOR">Instructor</option>
                </select>
              </div>

              {filterRole === 'STUDENT' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input type="text" className="form-input" name="fullName" value={editFormData.fullName || ''} onChange={handleEditFormChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input type="text" className="form-input" name="phoneNumber" value={editFormData.phoneNumber || ''} onChange={handleEditFormChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input type="date" className="form-input" name="dateOfBirth" value={editFormData.dateOfBirth || ''} onChange={handleEditFormChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select className="form-input" name="gender" value={editFormData.gender || ''} onChange={handleEditFormChange}>
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Qualification</label>
                    <select className="form-input" name="highestQualification" value={editFormData.highestQualification || ''} onChange={handleEditFormChange}>
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
                    <label className="form-label">College/University</label>
                    <input type="text" className="form-input" name="college" value={editFormData.college || ''} onChange={handleEditFormChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Course</label>
                    <input type="text" className="form-input" name="course" value={editFormData.course || ''} onChange={handleEditFormChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input type="text" className="form-input" name="department" value={editFormData.department || ''} onChange={handleEditFormChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Preferred Language</label>
                    <input type="text" className="form-input" name="preferredLanguage" value={editFormData.preferredLanguage || ''} onChange={handleEditFormChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Areas of Interest</label>
                    <input type="text" className="form-input" name="areasOfInterest" value={editFormData.areasOfInterest || ''} onChange={handleEditFormChange} />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Bio</label>
                    <textarea className="form-input" name="bio" value={editFormData.bio || ''} onChange={handleEditFormChange} style={{ minHeight: '80px' }}></textarea>
                  </div>
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingUser(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">💾 Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enrollments Modal (either student course enrollments OR instructor students) */}
      {selectedUser && (selectedUser.type === 'STUDENT' || selectedUser.type === 'INSTRUCTOR') && (
        <div className="modal-overlay open" onClick={() => setSelectedUser(null)}>
          <div className="modal" style={{ width: '650px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {selectedUser.name}'s {selectedUser.type === 'STUDENT' ? 'Enrollments' : 'Enrolled Students'}
              </h3>
              <button className="modal-close" onClick={() => setSelectedUser(null)}>✕</button>
            </div>
            {modalLoading ? (
              <div className="loading-overlay" style={{ position: 'relative', height: '80px' }}><div className="spinner"></div></div>
            ) : enrollments.length === 0 ? (
              <div className="empty-state" style={{ padding: '20px 0' }}>
                <div className="empty-icon" style={{ fontSize: '32px' }}>
                  {selectedUser.type === 'STUDENT' ? '📖' : '👥'}
                </div>
                <h4 className="mt-2">No data found</h4>
              </div>
            ) : (
              <div className="table-wrap" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      {selectedUser.type === 'INSTRUCTOR' && <th>Student Name</th>}
                      <th>Course Title</th>
                      <th>Enrolled On</th>
                      <th style={{ width: '200px' }}>Progress</th>
                      {selectedUser.type === 'STUDENT' && <th style={{ textAlign: 'right' }}>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {enrollments.map(e => {
                      const progress = e.progressPercentage || 0;
                      const formattedDate = new Date(e.enrolledAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      });

                      return (
                        <tr key={e.id}>
                          {selectedUser.type === 'INSTRUCTOR' && (
                            <td>
                              <div className="flex items-center gap-2">
                                <strong>{e.studentName}</strong>
                              </div>
                            </td>
                          )}
                          <td>
                            <strong>{e.courseTitle}</strong>
                          </td>
                          <td className="text-sm text-muted">{formattedDate}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div className="progress-bar" style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div className="progress-fill" style={{ width: `${progress}%`, height: '100%', background: 'var(--grad-primary)', borderRadius: '3px' }}></div>
                              </div>
                              <span className="font-bold text-sm" style={{ minWidth: '35px', textAlign: 'right' }}>{Math.round(progress)}%</span>
                            </div>
                          </td>
                          {selectedUser.type === 'STUDENT' && (
                            <td style={{ textAlign: 'right' }}>
                              <button className="btn btn-danger btn-sm" onClick={() => deleteEnrollment(e.id)}>
                                🗑️ Delete
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructor Courses Modal */}
      {showCoursesModal && (
        <div className="modal-overlay open" onClick={() => { setShowCoursesModal(false); setSelectedUser(null); }}>
          <div className="modal" style={{ width: '800px', maxWidth: '90vw' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Courses for {selectedUser?.name}</h3>
              <button className="modal-close" onClick={() => { setShowCoursesModal(false); setSelectedUser(null); }}>✕</button>
            </div>

            {modalLoading ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto' }}></div>
              </div>
            ) : instructorCourses.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>📚</div>
                <h4 className="mt-2">No courses assigned to this instructor</h4>
              </div>
            ) : (
              <div className="table-wrap" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {instructorCourses.map(c => (
                      <tr key={c.id}>
                        <td><strong>{c.title}</strong></td>
                        <td>{c.categoryName}</td>
                        <td>
                          <span className={`role-badge ${c.reviewStatus === 'APPROVED' ? 'instructor' : 'student'}`} style={{
                            background: c.reviewStatus === 'APPROVED' ? 'rgba(34,197,94,0.15)' : 'rgba(234,179,8,0.15)',
                            color: c.reviewStatus === 'APPROVED' ? '#4ade80' : '#facc15'
                          }}>
                            {c.reviewStatus}
                          </span>
                        </td>
                        <td>{c.price > 0 ? `₹${c.price.toLocaleString()}` : 'Free'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="modal-overlay open" onClick={() => setDeleteTarget(null)} style={{ zIndex: 1000 }}>
          <div className="modal" style={{ width: '400px', textAlign: 'center', padding: '32px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 16px 0', width: '100%', textAlign: 'center' }}>
              Delete {deleteTarget.type === 'USER' ? 'User' : 'Enrollment'}
            </h3>
            <div style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '15px' }}>
              Are you sure you want to delete this {deleteTarget.type === 'USER' ? 'user' : 'course enrollment'}? This action cannot be undone.
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={confirmDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* View Student Modal */}
      {viewingStudent && (
        <div className="modal-overlay open" onClick={() => setViewingStudent(null)}>
          <div className="modal" style={{ width: '600px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Student Details</h3>
              <button className="modal-close" onClick={() => setViewingStudent(null)}>✕</button>
            </div>
            <div style={{ padding: '10px 0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div><strong>Username:</strong> {viewingStudent.username}</div>
                <div><strong>Email:</strong> {viewingStudent.email}</div>
                <div><strong>Full Name:</strong> {viewingStudent.fullName || 'N/A'}</div>
                <div><strong>Phone Number:</strong> {viewingStudent.phoneNumber || 'N/A'}</div>
                <div><strong>Date of Birth:</strong> {viewingStudent.dateOfBirth || 'N/A'}</div>
                <div><strong>Gender:</strong> {viewingStudent.gender || 'N/A'}</div>
                <div><strong>Qualification:</strong> {viewingStudent.highestQualification || 'N/A'}</div>
                <div><strong>College/University:</strong> {viewingStudent.college || 'N/A'}</div>
                <div><strong>Course:</strong> {viewingStudent.course || 'N/A'}</div>
                <div><strong>Department:</strong> {viewingStudent.department || 'N/A'}</div>
                <div><strong>Preferred Language:</strong> {viewingStudent.preferredLanguage || 'N/A'}</div>
                <div style={{ gridColumn: '1 / -1' }}><strong>Areas of Interest:</strong> {viewingStudent.areasOfInterest || 'N/A'}</div>
                <div style={{ gridColumn: '1 / -1' }}><strong>Bio:</strong> {viewingStudent.bio || 'N/A'}</div>
              </div>
            </div>
            <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '15px', marginTop: '15px', textAlign: 'right' }}>
              <button className="btn btn-primary" onClick={() => setViewingStudent(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
