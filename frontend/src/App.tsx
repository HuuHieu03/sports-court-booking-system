import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LoginPage } from './modules/auth/LoginPage';
import { VenueListPage } from './modules/venues/VenueListPage';
import { CourtSchedulePage } from './modules/courts/CourtSchedulePage';
import { MyBookingsPage } from './modules/bookings/MyBookingsPage';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'venues' | 'courts' | 'my-bookings' | 'login'>('venues');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar currentView={currentView} onNavigate={(v) => setCurrentView(v as any)} />
      <main style={{ flex: 1 }}>
        <div className="card" style={{ background: '#eef6ff', borderColor: '#b3d7ff' }}>
          <h3>Sports Court Booking System - UI Shell (Scaffold)</h3>
          <p>
            This frontend shell connects to the NestJS backend API at <code>/api/v1</code>.
            Feature logic will be activated in coordination with backend Phase 1 implementation.
          </p>
        </div>

        {currentView === 'venues' && <VenueListPage />}
        {currentView === 'courts' && <CourtSchedulePage />}
        {currentView === 'my-bookings' && <MyBookingsPage />}
        {currentView === 'login' && <LoginPage />}
      </main>
      <Footer />
    </div>
  );
};

export default App;
