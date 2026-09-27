import { useState } from 'react';
import { useAuth } from '../lib/authContext';

interface UserProfileProps {
  language: 'en' | 'hi';
  onLogout?: () => void;
}

export default function UserProfile({ language, onLogout }: UserProfileProps) {
  const { user, logout } = useAuth();
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);

  if (!user) return null;

  const labels = {
    en: {
      profile: '👤 User Profile',
      email: 'Email:',
      phone: 'Phone:',
      name: 'Name:',
      favorites: 'Saved Stations:',
      recentJourneys: 'Recent Journeys:',
      logoutBtn: '🚪 Logout',
      noFavorites: 'No saved stations yet',
      noRecent: 'No recent journeys yet',
      myTickets: '🎫 My Booked Tickets',
      noTickets: 'No booked tickets yet.',
    },
    hi: {
      profile: '👤 उपयोगकर्ता प्रोफाइल',
      email: 'ईमेल:',
      phone: 'फोन:',
      name: 'नाम:',
      favorites: 'सहेजे गए स्टेशन:',
      recentJourneys: 'हाल की यात्राएं:',
      logoutBtn: '🚪 लॉगआउट करें',
      noFavorites: 'अभी कोई सहेजा हुआ स्टेशन नहीं',
      noRecent: 'अभी कोई हाल की यात्रा नहीं',
      myTickets: '🎫 मेरे बुक किए गए टिकट',
      noTickets: 'अभी तक कोई बुक किया हुआ टिकट नहीं है।',
    },
  };

  const t = labels[language];

  const handleLogout = () => {
    logout();
    onLogout?.();
  };

  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(0, 87, 184, 0.15)',
        boxShadow: '0 8px 24px rgba(11, 31, 58, 0.06)',
        marginBottom: '24px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, color: '#0B1F3A', fontWeight: '700' }}>{t.profile}</h3>
        <button
          onClick={handleLogout}
          className="button"
          style={{
            padding: '8px 16px',
            fontSize: '0.85rem',
            background: '#FEF2F2',
            color: '#DC2626',
            border: '1px solid #FCA5A5',
          }}
        >
          {t.logoutBtn}
        </button>
      </div>

      <div style={{ display: 'grid', gap: '14px', color: '#334155' }}>
        {user.name && (
          <div>
            <strong style={{ color: '#0B1F3A' }}>{t.name}</strong> {user.name}
          </div>
        )}
        {user.email && (
          <div>
            <strong style={{ color: '#0B1F3A' }}>{t.email}</strong> {user.email}
          </div>
        )}
        {user.phone && (
          <div>
            <strong style={{ color: '#0B1F3A' }}>{t.phone}</strong> {user.phone}
          </div>
        )}

        {/* Booked Tickets Section */}
        <div style={{ paddingTop: '14px', borderTop: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <strong style={{ color: '#0B1F3A' }}>{t.myTickets}</strong>
            <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: '#FEF3C7', color: '#92400E', borderRadius: '12px', fontWeight: '600' }}>
              ⚠️ Simulated Demo Tickets
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {user.bookedTickets && user.bookedTickets.length > 0 ? (
              user.bookedTickets.map((ticket) => {
                const isExpanded = expandedTicketId === ticket.id;

                // Mock dynamic QR matrix path
                const generateQrPath = () => {
                  let path = '';
                  const size = 10;
                  for (let r = 0; r < size; r++) {
                    for (let c = 0; c < size; c++) {
                      const isFinder = (r < 3 && c < 3) || (r < 3 && c >= size - 3) || (r >= size - 3 && c < 3);
                      if (isFinder) {
                        const isBorder = r === 0 || r === 2 || c === 0 || c === 2 ||
                                         r === size-3 || r === size-1 || c === 0 || c === 2 ||
                                         r === 0 || r === 2 || c === size-3 || c === size-1;
                        if (isBorder) path += ` M ${c * 6} ${r * 6} h 4 v 4 h -4 z`;
                      } else if (Math.random() > 0.4) {
                        path += ` M ${c * 6} ${r * 6} h 4 v 4 h -4 z`;
                      }
                    }
                  }
                  return path;
                };

                return (
                  <div
                    key={ticket.id}
                    style={{
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '10px',
                      padding: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onClick={() => setExpandedTicketId(isExpanded ? null : ticket.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontWeight: '700', color: '#0B1F3A', fontSize: '0.95rem' }}>
                          {ticket.sourceStationName} ➔ {ticket.destinationStationName}
                        </span>
                        <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '4px' }}>
                          {ticket.ticketType} • {ticket.passengers} Pax • ₹{ticket.fare}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#0057B8', fontWeight: '600' }}>
                        {isExpanded ? '▲ Hide QR' : '▼ View QR'}
                      </span>
                    </div>

                    {isExpanded && (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          marginTop: '12px',
                          paddingTop: '12px',
                          borderTop: '1px dashed #CBD5E1',
                        }}
                        onClick={(e) => e.stopPropagation()} // prevent card close click bubbling
                      >
                        <svg width="80" height="80" viewBox="0 0 60 60" style={{ fill: '#0B1F3A' }}>
                          <path d={generateQrPath()} />
                        </svg>
                        <span style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '8px', fontFamily: 'monospace' }}>
                          ID: {ticket.id}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                          Booked: {new Date(ticket.timestamp).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div style={{ fontSize: '0.9rem', color: '#94A3B8', padding: '8px 0' }}>
                {t.noTickets}
              </div>
            )}
          </div>
        </div>

        <div style={{ paddingTop: '12px', borderTop: '1px solid #E2E8F0' }}>
          <strong style={{ color: '#0B1F3A' }}>{t.favorites}</strong>
          <div style={{ marginTop: '6px', fontSize: '0.9rem', color: '#64748B' }}>
            {user.favorites.length > 0 ? (
              <div>{user.favorites.length} station(s) saved</div>
            ) : (
              <div>{t.noFavorites}</div>
            )}
          </div>
        </div>

        <div>
          <strong style={{ color: '#0B1F3A' }}>{t.recentJourneys}</strong>
          <div style={{ marginTop: '6px', fontSize: '0.9rem', color: '#64748B' }}>
            {user.recentJourneys.length > 0 ? (
              <div>{user.recentJourneys.length} journey(s) recorded</div>
            ) : (
              <div>{t.noRecent}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
