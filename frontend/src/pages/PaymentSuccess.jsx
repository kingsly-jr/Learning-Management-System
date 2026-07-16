import React from 'react';

export default function PaymentSuccess({ navigate }) {

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center', background: 'var(--bg-main)' }}>
      <div style={{ background: 'var(--bg-secondary)', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', maxWidth: '500px', border: '1px solid var(--glass-border)' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎉</div>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px', color: 'var(--accent-green)' }}>Payment Successful!</h1>
        <p style={{ fontSize: '16px', color: 'var(--text-muted)', marginBottom: '32px', lineHeight: '1.6' }}>
          Thank you for your purchase. You are now officially enrolled in the course. Get ready to start learning!
        </p>
        <button className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '16px' }} onClick={() => navigate('/dashboard/student-learning')}>
          Go to My Learning
        </button>
      </div>
    </div>
  );
}
