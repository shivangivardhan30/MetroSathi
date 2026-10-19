import { useState, useEffect } from 'react';
import { MetroRoute } from '../lib/routeCalculator';
import { useTranslation } from '../lib/translations';
import { getStationById } from '../lib/metroData';
import TicketBooking from './TicketBooking';
import JourneyTracker from './JourneyTracker';

interface RouteDetailsProps {
  route: MetroRoute | null;
  language: 'en' | 'hi';
  isLoading?: boolean;
}

export default function RouteDetails({ route, language, isLoading }: RouteDetailsProps) {
  const t = useTranslation(language);

  const [showBooking, setShowBooking] = useState(false);
  const [showTracker, setShowTracker] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // States for entry/exit gate selections
  const [selectedEntryGate, setSelectedEntryGate] = useState('');
  const [selectedExitGate, setSelectedExitGate] = useState('');

  useEffect(() => {
    if (route && route.stops.length > 0) {
      setSelectedEntryGate(route.stops[0].entryGate || '');
      setSelectedExitGate(route.stops[route.stops.length - 1].exitGate || '');
    }
  }, [route]);

  if (isLoading) {
    return (
      <div
        className="card"
        style={{
          padding: '32px',
          textAlign: 'center',
          color: 'var(--metro-blue)',
          fontSize: '1.1rem',
          fontWeight: 700,
        }}
      >
        <span className="animate-spin" style={{ display: 'inline-block', fontSize: '1.5rem', marginBottom: '8px' }}>
          🌀
        </span>
        <div>{language === 'en' ? 'Calculating optimal metro route...' : 'इष्टतम मेट्रो मार्ग की गणना की जा रही है...'}</div>
      </div>
    );
  }

  if (!route || route.stops.length === 0) {
    return null;
  }

  const sourceStation = getStationById(route.stops[0].stationId);
  const destStation = getStationById(route.stops[route.stops.length - 1].stationId);
  const cityName = sourceStation?.city || 'Delhi';

  const entryGates = sourceStation?.entryGates && sourceStation.entryGates.length > 0 ? sourceStation.entryGates : null;
  const exitGates = destStation?.exitGates && destStation.exitGates.length > 0 ? destStation.exitGates : null;

  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '24px',
        border: '2px solid rgba(0, 87, 184, 0.2)',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
      }}
    >
      {/* Route Summary Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--metro-navy)' }}>
            {route.source} ➔ {route.destination}
          </h3>
          <div style={{ fontSize: '0.85rem', color: 'var(--metro-text-subtle)', marginTop: '2px' }}>
            {t.routeDetails.routeDetails}
          </div>
        </div>

        {/* Demo Notice Safety Badge */}
        <span className="demo-notice-badge">
          ⚠️ Demo / Estimated Route Data
        </span>
      </div>

      {/* Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '12px',
          marginBottom: '24px',
        }}
      >
        <div style={{ padding: '14px', background: 'var(--metro-light-bg)', borderRadius: '10px', border: '1px solid var(--metro-card-border)' }}>
          <div style={{ color: 'var(--metro-text-subtle)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
            {t.routeDetails.totalStops}
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--metro-navy)' }}>
            {route.totalStops} {language === 'en' ? 'stops' : 'स्टॉप'}
          </div>
        </div>

        <div style={{ padding: '14px', background: 'var(--metro-light-bg)', borderRadius: '10px', border: '1px solid var(--metro-card-border)' }}>
          <div style={{ color: 'var(--metro-text-subtle)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
            {t.routeDetails.interchanges}
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#7F00FF' }}>
            {route.interchanges}
          </div>
        </div>

        <div style={{ padding: '14px', background: 'var(--metro-light-bg)', borderRadius: '10px', border: '1px solid var(--metro-card-border)' }}>
          <div style={{ color: 'var(--metro-text-subtle)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
            {t.routeDetails.estimatedTime}
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--metro-blue)' }}>
            ~{route.estimatedTime} {t.routeDetails.minutes}
          </div>
        </div>

        <div style={{ padding: '14px', background: 'var(--metro-light-bg)', borderRadius: '10px', border: '1px solid var(--metro-card-border)' }}>
          <div style={{ color: 'var(--metro-text-subtle)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
            {t.routeDetails.fare} (Est.)
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--metro-green)' }}>
            ₹{route.totalFare}
          </div>
        </div>
      </div>

      {/* Action CTAs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setShowBooking(true)}
          className="btn-primary"
          style={{
            flex: 1,
            minWidth: '160px',
            background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
            borderColor: '#059669',
            fontSize: '1rem',
            fontWeight: 800,
          }}
        >
          {t.booking.bookTicketBtn}
        </button>
        <button
          onClick={() => setShowTracker(true)}
          className="btn-secondary"
          style={{ flex: 1, minWidth: '160px', backgroundColor: 'var(--metro-navy)', color: '#ffffff' }}
        >
          {t.tracker.startJourneyBtn}
        </button>
      </div>

      {/* Station-by-Station Route Breakdown */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h4 style={{ margin: 0, color: 'var(--metro-navy)', fontSize: '1.1rem', fontWeight: 800 }}>
            📍 Complete Journey Breakdown ({route.stops.length} stations)
          </h4>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--metro-blue)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            {isExpanded ? '▲ Collapse View' : '▼ Expand View'}
          </button>
        </div>

        {isExpanded && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '500px', overflowY: 'auto', paddingRight: '4px' }}>
            {route.stops.map((stop, index) => {
              if (stop.isWalkingTransfer) {
                return (
                  <div
                    key={`walking_${stop.stationId}_${index}`}
                    style={{
                      padding: '16px 18px',
                      background: '#FFFBEB',
                      borderLeft: '6px solid #F59E0B',
                      borderRadius: '12px',
                      margin: '6px 0',
                      boxShadow: '0 2px 8px rgba(245, 158, 11, 0.15)',
                    }}
                  >
                    <div style={{ fontWeight: 800, color: '#92400E', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>🚶 WALKING / INTER-NETWORK TRANSFER</span>
                    </div>
                    <div style={{ fontSize: '0.88rem', color: '#B45309', marginTop: '4px', fontWeight: 600 }}>
                      {language === 'en'
                        ? `Walk between ${stop.stationName} (${stop.network} • ${stop.line}) ➔ ${stop.interchangeToLine} (${stop.interchangeToNetwork || 'Connected Network'}) via ~300m dedicated pathway.`
                        : `${stop.stationName} (${stop.network}) से ${stop.interchangeToLine} तक पैदल स्थानांतरण (~300m पैदल मार्ग)।`}
                    </div>
                  </div>
                );
              }

              if (stop.interchangeToLine) {
                return (
                  <div
                    key={`interchange_${stop.stationId}_${index}`}
                    style={{
                      padding: '14px 18px',
                      background: '#F3E8FF',
                      borderLeft: '6px solid #7F00FF',
                      borderRadius: '12px',
                      margin: '4px 0',
                      boxShadow: '0 2px 8px rgba(127, 0, 255, 0.1)',
                    }}
                  >
                    <div style={{ fontWeight: 800, color: '#5B21B6', fontSize: '0.95rem' }}>
                      🔄 INTERCHANGE AT {stop.stationName.toUpperCase()}
                    </div>
                    <div style={{ fontSize: '0.88rem', color: '#6B21A8', marginTop: '4px', fontWeight: 600 }}>
                      {language === 'en'
                        ? `Alight from ${stop.line} ➔ Switch to ${stop.interchangeToLine}`
                        : `${stop.line} से उतरें ➔ ${stop.interchangeToLine} पर स्विच करें`}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={`${stop.stationId}_${index}`}
                  style={{
                    padding: '14px 16px',
                    background: 'var(--metro-light-bg)',
                    borderLeft: `5px solid ${stop.lineColor || 'var(--metro-blue)'}`,
                    borderRadius: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '12px',
                    border: '1px solid var(--metro-card-border)',
                    borderLeftWidth: '5px',
                    borderLeftColor: stop.lineColor || 'var(--metro-blue)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, color: 'var(--metro-navy)', fontSize: '1rem', marginBottom: '4px' }}>
                      {index + 1}. {stop.stationName}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--metro-text-muted)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, color: 'var(--metro-navy)', fontSize: '0.78rem' }}>{stop.network}</span>
                      <span>•</span>
                      <span
                        className="metro-line-badge"
                        style={{ backgroundColor: stop.lineColor || 'var(--metro-blue)', fontSize: '0.72rem', padding: '2px 8px' }}
                      >
                        {stop.line}
                      </span>
                    </div>

                    {stop.directionTowards && (
                      <div style={{ fontSize: '0.84rem', color: '#047857', marginTop: '6px', fontWeight: 700 }}>
                        🚇 {language === 'en' ? 'Board train towards:' : 'ट्रेन की दिशा:'} <span style={{ color: 'var(--metro-navy)' }}>{stop.directionTowards}</span>
                      </div>
                    )}
                  </div>

                  <div style={{ textAlign: 'right', minWidth: '140px' }}>
                    {/* Platform Display */}
                    <div style={{ fontSize: '0.82rem', color: 'var(--metro-navy)', marginBottom: '4px' }}>
                      <strong>{t.routeDetails.platform}: </strong>
                      {stop.platformNumber ? (
                        <span style={{ fontWeight: 700, color: 'var(--metro-blue)' }}>{stop.platformNumber}</span>
                      ) : (
                        <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Platform information unavailable</span>
                      )}
                    </div>

                    {/* Entry Gate Display */}
                    {index === 0 && (
                      <div style={{ fontSize: '0.82rem', color: 'var(--metro-navy)', marginTop: '4px' }}>
                        <strong>{t.routeDetails.entryGate}: </strong>
                        {entryGates ? (
                          <select
                            value={selectedEntryGate}
                            onChange={(e) => setSelectedEntryGate(e.target.value)}
                            style={{
                              padding: '2px 6px',
                              fontSize: '0.78rem',
                              borderRadius: '6px',
                              border: '1px solid var(--metro-card-border)',
                              background: '#FFFFFF',
                              marginTop: '2px',
                            }}
                          >
                            {entryGates.map((gate) => (
                              <option key={gate} value={gate}>
                                {gate}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Gate information unavailable</span>
                        )}
                      </div>
                    )}

                    {/* Exit Gate Display */}
                    {index === route.stops.length - 1 && (
                      <div style={{ fontSize: '0.82rem', color: 'var(--metro-navy)', marginTop: '4px' }}>
                        <strong>{t.routeDetails.exitGate}: </strong>
                        {exitGates ? (
                          <select
                            value={selectedExitGate}
                            onChange={(e) => setSelectedExitGate(e.target.value)}
                            style={{
                              padding: '2px 6px',
                              fontSize: '0.78rem',
                              borderRadius: '6px',
                              border: '1px solid var(--metro-card-border)',
                              background: '#FFFFFF',
                              marginTop: '2px',
                            }}
                          >
                            {exitGates.map((gate) => (
                              <option key={gate} value={gate}>
                                {gate}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Gate information unavailable</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Travel Guidance Notes */}
      <div style={{ padding: '16px', background: 'var(--metro-light-bg)', borderRadius: '10px', border: '1px solid var(--metro-card-border)' }}>
        <div style={{ color: 'var(--metro-navy)', fontWeight: 700, marginBottom: '6px', fontSize: '0.92rem' }}>
          ℹ️ {language === 'en' ? 'Travel Guidance Notes' : 'यात्रा मार्गदर्शन नोट्स'}
        </div>
        <div style={{ color: 'var(--metro-text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
          <div>
            {language === 'en'
              ? `Estimated journey distance: ~${route.distance.toFixed(1)} km (${route.totalStops} stops, ${route.interchanges} transfer)`
              : `अनुमानित यात्रा दूरी: ~${route.distance.toFixed(1)} किमी (${route.totalStops} स्टॉप, ${route.interchanges} ट्रांसफर)`}
          </div>
        </div>
      </div>

      {/* Modal Overlays */}
      {showBooking && (
        <TicketBooking
          sourceCity={cityName}
          sourceStationName={route.stops[0].stationName}
          destinationStationName={route.stops[route.stops.length - 1].stationName}
          sourceNetwork={sourceStation?.network || route.stops[0].network}
          destNetwork={destStation?.network || route.stops[route.stops.length - 1].network}
          sourceLine={route.stops[0].line}
          destLine={route.stops[route.stops.length - 1].line}
          interchanges={route.interchanges}
          estimatedTime={route.estimatedTime}
          fare={route.totalFare}
          onClose={() => setShowBooking(false)}
          language={language}
        />
      )}

      {showTracker && (
        <JourneyTracker
          initialRoute={{
            ...route,
            stops: route.stops.map((stop, idx) => {
              if (idx === 0) return { ...stop, entryGate: selectedEntryGate || stop.entryGate || 'Gate Info Unavailable' };
              if (idx === route.stops.length - 1) return { ...stop, exitGate: selectedExitGate || stop.exitGate || 'Gate Info Unavailable' };
              return stop;
            }),
          }}
          selectedCity={cityName}
          destinationStationId={route.stops[route.stops.length - 1].stationId}
          language={language}
          onClose={() => setShowTracker(false)}
        />
      )}
    </div>
  );
}
