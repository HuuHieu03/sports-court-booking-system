import React from 'react';

export const CourtSchedulePage: React.FC = () => {
  return (
    <div className="card">
      <h2>Court Schedule & Slot Availability</h2>
      <p style={{ color: '#666' }}>
        <strong>TODO [Phase-1 Frontend]:</strong> Render interactive hourly time slots from <code>GET /api/v1/courts</code>.
      </p>
      <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '4px' }}>
        <p>Interactive availability grid placeholder (Badminton, Tennis, Futsal, Basketball).</p>
      </div>
    </div>
  );
};
