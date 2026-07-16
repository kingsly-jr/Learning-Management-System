import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api.js';

export default function CategoriesPage({ navigate, addToast }) {
  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Edit / Add Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', description: '', thumbnailUrl: '' });

  const [editingCat, setEditingCat] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editThumbnail, setEditThumbnail] = useState('');
  
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cats, list] = await Promise.all([
        apiFetch('/categories'),
        apiFetch('/courses')
      ]);
      setCategories(cats || []);
      setCourses(list || []);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newCat.name.trim()) {
      addToast('Category name is required', 'error');
      return;
    }
    try {
      await apiFetch('/categories', {
        method: 'POST',
        body: JSON.stringify(newCat)
      });
      addToast('Category created successfully! 🏷️', 'success');
      setShowAddModal(false);
      setNewCat({ name: '', description: '', thumbnailUrl: '' });
      loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      addToast('Category name is required', 'error');
      return;
    }
    try {
      await apiFetch(`/categories/${editingCat.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: editName, description: editDesc, thumbnailUrl: editThumbnail })
      });
      addToast('Category updated successfully! 💾', 'success');
      setEditingCat(null);
      loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const deleteCategory = (id) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiFetch(`/categories/${deleteTarget}`, { method: 'DELETE' });
      addToast('Category deleted successfully.', 'info');
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

  // Group courses by category
  const coursesByCat = {};
  courses.forEach(c => {
    if (!coursesByCat[c.categoryId]) {
      coursesByCat[c.categoryId] = [];
    }
    coursesByCat[c.categoryId].push(c.title);
  });

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <h3>Categories</h3>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Search categories..."
            className="form-input" 
            style={{ width: '250px' }}
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>➕ New Category</button>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Courses</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No categories found.
                </td>
              </tr>
            ) : (
              filteredCategories.map(c => {
                const catCourses = coursesByCat[c.id] || [];
              return (
                <tr key={c.id}>
                  <td className="text-muted">{c.id}</td>
                  <td><strong>{c.name}</strong></td>
                  <td className="text-muted">{c.description || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '400px' }}>
                      {catCourses.length > 0 ? (
                        catCourses.map((title, idx) => (
                          <span key={idx} className="chip" style={{ margin: '2px' }}>{title}</span>
                        ))
                      ) : (
                        <span className="text-muted" style={{ fontSize: '12px' }}>None (0)</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => {
                        setEditingCat(c);
                        setEditName(c.name);
                        setEditDesc(c.description || '');
                        setEditThumbnail(c.thumbnailUrl || '');
                      }}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteCategory(c.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
          </tbody>
        </table>
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="modal-overlay" style={{ display: 'flex' }} onClick={() => setShowAddModal(false)}>
          <div className="modal" style={{ width: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">New Category</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="form-group mb-3">
                <label className="form-label">Name *</label>
                <input className="form-input" placeholder="Category name" value={newCat.name} onChange={e => setNewCat(prev => ({ ...prev, name: e.target.value }))} required />
              </div>
              <div className="form-group mb-4">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows="2" placeholder="Optional description" value={newCat.description} onChange={e => setNewCat(prev => ({ ...prev, description: e.target.value }))}></textarea>
              </div>
              <div className="form-group mb-4">
                <label className="form-label">Thumbnail URL</label>
                <input type="text" className="form-input" placeholder="https://example.com/image.jpg" value={newCat.thumbnailUrl} onChange={e => setNewCat(prev => ({ ...prev, thumbnailUrl: e.target.value }))} />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Category</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCat && (
        <div className="modal-overlay" style={{ display: 'flex' }} onClick={() => setEditingCat(null)}>
          <div className="modal" style={{ width: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Category</h3>
              <button className="modal-close" onClick={() => setEditingCat(null)}>✕</button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group mb-3">
                <label className="form-label">Name *</label>
                <input className="form-input" placeholder="Category name" value={editName} onChange={e => setEditName(e.target.value)} required />
              </div>
              <div className="form-group mb-4">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows="2" placeholder="Optional description" value={editDesc} onChange={e => setEditDesc(e.target.value)}></textarea>
              </div>
              <div className="form-group mb-4">
                <label className="form-label">Thumbnail URL</label>
                <input type="text" className="form-input" placeholder="https://example.com/image.jpg" value={editThumbnail} onChange={e => setEditThumbnail(e.target.value)} />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingCat(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">💾 Save Changes</button>
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
              Delete Category
            </h3>
            <div style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '15px' }}>
              Are you sure you want to delete this category? This action cannot be undone.
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
