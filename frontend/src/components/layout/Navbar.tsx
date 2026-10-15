import React from 'react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ fontWeight: 'bold', fontSize: '1.25rem', color: '#0066cc', cursor: 'pointer' }} onClick={() => onNavigate('venues')}>
        Sports Court Booking System
      </div>
      <nav style={{ display: 'flex', gap: '1rem' }}>
        <button
          className="btn"
          style={{ background: currentView === 'venues' ? '#004c99' : '#0066cc' }}
          onClick={() => onNavigate('venues')}
        >
          Venues
        </button>
        <button
          className="btn"
          style={{ background: currentView === 'courts' ? '#004c99' : '#0066cc' }}
          onClick={() => onNavigate('courts')}
        >
          Courts
        </button>
        <button
          className="btn"
          style={{ background: currentView === 'my-bookings' ? '#004c99' : '#0066cc' }}
          onClick={() => onNavigate('my-bookings')}
        >
          My Bookings
        </button>
        <button
          className="btn"
          style={{ background: currentView === 'login' ? '#004c99' : '#0066cc' }}
          onClick={() => onNavigate('login')}
        >
          Login
        </button>
      </nav>
    </header>
  );
};
