import React from 'react';

export const LoginPage: React.FC = () => {
  return (
    <div className="card">
      <h2>User Authentication</h2>
      <p style={{ color: '#666' }}>
        <strong>TODO [Phase-1 Frontend]:</strong> Integrate with <code>POST /api/v1/auth/login</code> and store JWT token in localStorage.
      </p>
      <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '360px' }}>
        <label>
          Email:
          <input type="email" placeholder="user@example.com" style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} disabled />
        </label>
        <label>
          Password:
          <input type="password" placeholder="••••••••" style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} disabled />
        </label>
        <button type="submit" className="btn" disabled>
          Sign In (Phase 1 Stub)
        </button>
      </form>
    </div>
  );
};
