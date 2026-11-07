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
      profile: 'Passenger Profile & Travel Records',
      email: 'Email:',
      phone: 'Phone:',
      name: 'Name:',
      favorites: 'Saved Stations:',
      recentJourneys: 'Recent Journeys:',
      logoutBtn: 'Sign Out',
      noFavorites: 'No saved stations yet',
      noRecent: 'No recent journeys yet',
      myTickets: 'Issued Transit Passes',
      noTickets: 'No booked tickets recorded in this session.',
    },
    hi: {
      title: 'यात्री प्रोफाइल एवं यात्रा विवरण',
      profile: 'यात्री प्रोफाइल',
      email: 'ईमेल:',
      phone: 'फोन:',
      name: 'नाम:',
      favorites: 'सहेजे गए स्टेशन:',
      recentJourneys: 'हाल की यात्राएं:',
      logoutBtn: 'साइन आउट करें',
      noFavorites: 'अभी कोई सहेजा हुआ स्टेशन नहीं',
      noRecent: 'अभी कोई हाल की यात्रा नहीं',
      myTickets: 'जारी किए गए पारगमन पास',
      noTickets: 'इस सत्र में कोई बुक किया हुआ टिकट नहीं है।',
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
        borderRadius: '6px',
        padding: '24px',
        border: '1px solid var(--metro-card-border)',
        borderTop: '3px solid var(--metro-blue)',
        marginBottom: '24px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, color: 'var(--metro-navy)', fontWeight: 700, fontSize: '1.15rem' }}>{t.profile}</h3>
        <button
          onClick={handleLogout}
          className="btn-outline"
          style={{
            padding: '6px 14px',
            fontSize: '0.82rem',
            color: '#DC2626',
            borderColor: '#FCA5A5',
          }}
        >
          {t.logoutBtn}
        </button>
      </div>

      <div style={{ display: 'grid', gap: '12px', color: '#334155', fontSize: '0.9rem' }}>
        {user.name && (
          <div>
            <strong style={{ color: 'var(--metro-navy)' }}>{t.name}</strong> {user.name}
          </div>
        )}
        {user.email && (
          <div>
            <strong style={{ color: 'var(--metro-navy)' }}>{t.email}</strong> {user.email}
          </div>
        )}
        {user.phone && (
          <div>
            <strong style={{ color: 'var(--metro-navy)' }}>{t.phone}</strong> {user.phone}
          </div>
        )}

        {/* Booked Tickets Section */}
        <div style={{ paddingTop: '12px', borderTop: '1px solid var(--metro-card-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <strong style={{ color: 'var(--metro-navy)' }}>{t.myTickets}</strong>
            <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: '#F1F5F9', color: '#475569', borderRadius: '4px', fontWeight: 600 }}>
              Session Passes
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {user.bookedTickets && user.bookedTickets.length > 0 ? (
              user.bookedTickets.map((ticket) => {
                const isExpanded = expandedTicketId === ticket.id;

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
                      border: '1px solid var(--metro-card-border)',
                      borderRadius: '4px',
                      padding: '12px',
                      cursor: 'pointer',
                    }}
                    onClick={() => setExpandedTicketId(isExpanded ? null : ticket.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontWeight: 600, color: 'var(--metro-navy)', fontSize: '0.9rem' }}>
                          {ticket.sourceStationName} ➔ {ticket.destinationStationName}
                        </span>
                        <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
                          {ticket.ticketType} • {ticket.passengers} Pax • ₹{ticket.fare}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--metro-blue)', fontWeight: 600 }}>
                        {isExpanded ? 'Hide Pass' : 'View Pass'}
                      </span>
                    </div>

                    {isExpanded && (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          marginTop: '10px',
                          paddingTop: '10px',
                          borderTop: '1px dashed #CBD5E1',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg width="80" height="80" viewBox="0 0 60 60" style={{ fill: '#0F172A' }}>
                          <path d={generateQrPath()} />
                        </svg>
                        <span style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '6px', fontFamily: 'monospace' }}>
                          ID: {ticket.id}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>
                          Issued: {new Date(ticket.timestamp).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div style={{ fontSize: '0.86rem', color: '#94A3B8', padding: '6px 0' }}>
                {t.noTickets}
              </div>
            )}
          </div>
        </div>

        <div style={{ paddingTop: '10px', borderTop: '1px solid var(--metro-card-border)' }}>
          <strong style={{ color: 'var(--metro-navy)' }}>{t.favorites}</strong>
          <div style={{ marginTop: '4px', fontSize: '0.86rem', color: '#64748B' }}>
            {user.favorites.length > 0 ? (
              <div>{user.favorites.length} station(s) saved</div>
            ) : (
              <div>{t.noFavorites}</div>
            )}
          </div>
        </div>

        <div>
          <strong style={{ color: 'var(--metro-navy)' }}>{t.recentJourneys}</strong>
          <div style={{ marginTop: '4px', fontSize: '0.86rem', color: '#64748B' }}>
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
