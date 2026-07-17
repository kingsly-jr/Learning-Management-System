export const API_BASE = 'http://localhost:8080/api'; // 'https://learning-management-system-t7bn.onrender.com/api';

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('lms_token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(API_BASE + path, { ...options, headers });

  if (res.status === 401) {
    if (!path.includes('/auth/login')) {
      localStorage.removeItem('lms_token');
      localStorage.removeItem('lms_user');
      window.location.reload();
      return;
    }
  }
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try { const e = await res.json(); msg = e.message || msg; } catch (_) {}
    throw new Error(msg);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export function esc(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
