import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api.js';

export default function AdminPayments({ navigate, addToast }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, PAID, FAILED, CREATED

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/payments/transactions');
      setTransactions(data || []);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = 
      (t.studentUsername || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.studentEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.courseTitle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.razorpayOrderId || '').toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = transactions.filter(t => t.status === 'PAID').reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalSuccess = transactions.filter(t => t.status === 'PAID').length;
  const totalFailed = transactions.filter(t => t.status === 'FAILED').length;

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>Payments Dashboard</h2>
        <div style={{ display: 'flex', gap: '16px' }}>
          <select 
            className="form-input" 
            style={{ width: '150px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="PAID">Paid</option>
            <option value="FAILED">Failed</option>
            <option value="CREATED">Pending</option>
          </select>
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search transactions..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '250px' }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value" style={{ color: 'var(--accent-green)' }}>₹{totalRevenue.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Transactions</div>
          <div className="stat-value">{transactions.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Successful</div>
          <div className="stat-value text-success">{totalSuccess}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Failed</div>
          <div className="stat-value text-danger">{totalFailed}</div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading transactions...</div>
        ) : filteredTransactions.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No transactions found.</div>
        ) : (
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>ORDER ID</th>
                <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>STUDENT</th>
                <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>COURSE</th>
                <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>AMOUNT</th>
                <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>STATUS</th>
                <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>DATE</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '16px', fontSize: '13px', fontFamily: 'monospace' }}>{t.razorpayOrderId || '—'}</td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: '500' }}>{t.studentUsername}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.studentEmail}</div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.courseTitle}</td>
                  <td style={{ padding: '16px', fontWeight: '500' }}>₹{t.amount}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold',
                      background: t.status === 'PAID' ? 'rgba(34,197,94,0.1)' : t.status === 'FAILED' ? 'rgba(239,68,68,0.1)' : 'rgba(234,179,8,0.1)',
                      color: t.status === 'PAID' ? '#22c55e' : t.status === 'FAILED' ? '#ef4444' : '#eab308'
                    }}>
                      {t.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
