import React from 'react';

export const VenueListPage: React.FC = () => {
  return (
    <div className="card">
      <h2>Sports Facilities & Venues</h2>
      <p style={{ color: '#666' }}>
        <strong>TODO [Phase-1 Frontend]:</strong> Fetch and display venues from <code>GET /api/v1/venues</code>.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
        <div className="card" style={{ borderStyle: 'dashed' }}>
          <h3>Venue Discovery Skeleton</h3>
          <p>Venue card skeleton ready for API data binding.</p>
        </div>
      </div>
    </div>
  );
};
