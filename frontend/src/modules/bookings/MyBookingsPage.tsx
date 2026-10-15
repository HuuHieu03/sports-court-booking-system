import React from 'react';

export const MyBookingsPage: React.FC = () => {
  return (
    <div className="card">
      <h2>My Reservations</h2>
      <p style={{ color: '#666' }}>
        <strong>TODO [Phase-1 Frontend]:</strong> Display user reservations and cancellation controls from <code>GET /api/v1/bookings/:id</code> and <code>DELETE /api/v1/bookings/:id</code>.
      </p>
      <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '4px' }}>
        <p>No active reservations loaded (Phase 1 placeholder).</p>
      </div>
    </div>
  );
};
