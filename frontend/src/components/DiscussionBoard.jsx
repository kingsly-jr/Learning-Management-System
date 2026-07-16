import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api.js';

export default function DiscussionBoard({ courseId, lessonId = null, user, addToast }) {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeThread, setActiveThread] = useState(null);
  const [replies, setReplies] = useState([]);
  const [repliesLoading, setRepliesLoading] = useState(false);

  // Forms
  const [showNewThreadForm, setShowNewThreadForm] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadContent, setNewThreadContent] = useState('');
  
  const [replyContent, setReplyContent] = useState('');

  const loadThreads = async () => {
    setLoading(true);
    try {
      let url = `/discussions/course/${courseId}`;
      if (lessonId) {
        url += `?lessonId=${lessonId}`;
      }
      const data = await apiFetch(url);
      setThreads(data || []);
    } catch (e) {
      console.error(e);
      addToast('Failed to load discussions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      loadThreads();
    }
  }, [courseId, lessonId]);

  const handleCreateThread = async (e) => {
    e.preventDefault();
    if (!newThreadTitle.trim() || !newThreadContent.trim()) return;
    try {
      await apiFetch(`/discussions/course/${courseId}`, {
        method: 'POST',
        body: JSON.stringify({
          title: newThreadTitle,
          content: newThreadContent,
          lessonId: lessonId
        })
      });
      addToast('Discussion posted!', 'success');
      setNewThreadTitle('');
      setNewThreadContent('');
      setShowNewThreadForm(false);
      loadThreads();
    } catch (e) {
      addToast(e.message, 'error');
    }
  };

  const openThread = async (thread) => {
    setActiveThread(thread);
    setRepliesLoading(true);
    try {
      const data = await apiFetch(`/discussions/${thread.id}/replies`);
      setReplies(data || []);
    } catch (e) {
      addToast('Failed to load replies', 'error');
    } finally {
      setRepliesLoading(false);
    }
  };

  const handlePostReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    try {
      await apiFetch(`/discussions/${activeThread.id}/replies`, {
        method: 'POST',
        body: JSON.stringify({ content: replyContent })
      });
      setReplyContent('');
      openThread(activeThread); // reload replies
      loadThreads(); // update reply counts
    } catch (e) {
      addToast(e.message, 'error');
    }
  };

  const renderRoleBadge = (role, isInstructorResponse) => {
    if (isInstructorResponse || role === 'INSTRUCTOR' || role === 'ADMIN') {
      return <span style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80', fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px', textTransform: 'uppercase' }}>Teacher</span>;
    }
    return null;
  };

  if (loading && !activeThread) {
    return <div className="text-center text-muted py-4">Loading discussions...</div>;
  }

  // ACTIVE THREAD VIEW
  if (activeThread) {
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '24px' }}>
        <button className="btn btn-secondary btn-sm mb-4" onClick={() => setActiveThread(null)}>← Back to Discussions</button>
        
        {/* Original Post */}
        <div style={{ paddingBottom: '20px', borderBottom: '1px solid var(--glass-border)', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>{activeThread.title}</h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '12px', overflow: 'hidden' }}>
              {activeThread.authorThumbnailUrl ? <img src={activeThread.authorThumbnailUrl} alt={activeThread.authorName} style={{width:'100%', height:'100%', objectFit:'cover'}}/> : activeThread.authorName?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 'bold' }}>
                {activeThread.authorName}
                {renderRoleBadge(activeThread.authorRole, false)}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(activeThread.createdAt).toLocaleString()}</div>
            </div>
          </div>
          <p style={{ fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{activeThread.content}</p>
        </div>

        {/* Replies */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          {repliesLoading ? (
            <div className="text-muted text-sm text-center">Loading replies...</div>
          ) : replies.length === 0 ? (
            <div className="text-muted text-sm">No replies yet. Be the first to answer!</div>
          ) : (
            replies.map(r => (
              <div key={r.id} style={{ display: 'flex', gap: '12px', background: r.isInstructorResponse ? 'rgba(34,197,94,0.05)' : 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: r.isInstructorResponse ? '1px solid rgba(34,197,94,0.2)' : '1px solid transparent' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: r.isInstructorResponse ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '12px', flexShrink: 0, overflow: 'hidden' }}>
                  {r.authorThumbnailUrl ? <img src={r.authorThumbnailUrl} alt={r.authorName} style={{width:'100%', height:'100%', objectFit:'cover'}}/> : r.authorName?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
                    {r.authorName}
                    {renderRoleBadge(r.authorRole, r.isInstructorResponse)}
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'normal', marginLeft: '8px' }}>{new Date(r.createdAt).toLocaleString()}</span>
                  </div>
                  <p style={{ fontSize: '14px', lineHeight: '1.5', whiteSpace: 'pre-wrap', margin: 0 }}>{r.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Reply Form */}
        {user ? (
          <form onSubmit={handlePostReply} style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
            <textarea
              className="form-input mb-3"
              rows="3"
              placeholder="Write a reply..."
              value={replyContent}
              onChange={e => setReplyContent(e.target.value)}
              required
            ></textarea>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={!replyContent.trim()}>Post Reply</button>
            </div>
          </form>
        ) : (
          <div className="text-muted text-sm text-center py-3" style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>Log in to post a reply.</div>
        )}
      </div>
    );
  }

  // THREADS LIST VIEW
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Q&A Discussions</h3>
        {user && !showNewThreadForm && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowNewThreadForm(true)}>Ask a Question</button>
        )}
      </div>

      {showNewThreadForm && (
        <form onSubmit={handleCreateThread} style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '8px', marginBottom: '24px', border: '1px solid var(--glass-border)' }}>
          <h4 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '16px' }}>New Discussion</h4>
          <input
            type="text"
            className="form-input mb-3"
            placeholder="Question Title (e.g., How does Java memory management work?)"
            value={newThreadTitle}
            onChange={e => setNewThreadTitle(e.target.value)}
            required
            maxLength={100}
          />
          <textarea
            className="form-input mb-3"
            rows="4"
            placeholder="Explain your question in detail..."
            value={newThreadContent}
            onChange={e => setNewThreadContent(e.target.value)}
            required
          ></textarea>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowNewThreadForm(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={!newThreadTitle.trim() || !newThreadContent.trim()}>Post Question</button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {threads.length === 0 ? (
          <div className="empty-state">No discussions yet. Start one!</div>
        ) : (
          threads.map(thread => (
            <div key={thread.id} onClick={() => openThread(thread)} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', cursor: 'pointer', transition: 'var(--transition)' }} className="hover-bg-elevated">
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(168,85,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc', fontSize: '16px', flexShrink: 0 }}>
                💬
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '4px' }}>{thread.title}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  By {thread.authorName} • {new Date(thread.createdAt).toLocaleDateString()}
                  {thread.lessonTitle && <span style={{ marginLeft: '8px', color: '#3b82f6' }}>• Lesson: {thread.lessonTitle}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: thread.replyCount === 0 ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', color: thread.replyCount === 0 ? '#ef4444' : '#4ade80', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                <span>{thread.replyCount}</span>
                <span>Replies</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
