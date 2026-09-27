import { useState, useEffect } from 'react';
import { MetroRoute, calculateRoute } from '../lib/routeCalculator';
import { getStationById, MetroStation, getStationsByCity } from '../lib/metroData';
import { useTranslation } from '../lib/translations';

interface JourneyTrackerProps {
  initialRoute: MetroRoute;
  selectedCity: string;
  destinationStationId: string;
  language: 'en' | 'hi';
  onClose: () => void;
}

export default function JourneyTracker({
  initialRoute,
  selectedCity,
  destinationStationId,
  language,
  onClose,
}: JourneyTrackerProps) {
  const t = useTranslation(language);

  const [route, setRoute] = useState<MetroRoute>(initialRoute);
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [isWrongTrain, setIsWrongTrain] = useState(false);
  const [wrongStationName, setWrongStationName] = useState('');
  const [recalculating, setRecalculating] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const stops = route.stops;
  const currentStop = stops[currentStopIndex];
  const nextStop = currentStopIndex < stops.length - 1 ? stops[currentStopIndex + 1] : null;
  const isFinished = currentStopIndex === stops.length - 1;

  // Speak announcement using SpeechSynthesis API
  const speakAnnouncement = (text: string) => {
    if (isMuted || typeof window === 'undefined' || !window.speechSynthesis) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  // Simulating movement from station to station
  useEffect(() => {
    if (isFinished || recalculating) return;

    const timer = setTimeout(() => {
      const nextIndex = currentStopIndex + 1;
      setCurrentStopIndex(nextIndex);
      
      const nextStation = stops[nextIndex];
      if (nextStation) {
        let text = '';
        if (nextIndex === stops.length - 1) {
          text = language === 'en' 
            ? `Attention passengers. Arriving at destination, ${nextStation.stationName}. Please exit from ${nextStation.exitGate || 'the recommended exit gate'}.`
            : `यात्रीगण कृपया ध्यान दें। अपने गंतव्य, ${nextStation.stationName} पर पहुंच रहे हैं। कृपया ${nextStation.exitGate || 'अनुशंसित गेट'} से बाहर निकलें।`;
        } else {
          text = language === 'en'
            ? `Next station is ${nextStation.stationName}. Platform ${nextStation.platformNumber || '1'}.`
            : `अगला स्टेशन ${nextStation.stationName} है। प्लेटफॉर्म ${nextStation.platformNumber || '1'}।`;
        }
        speakAnnouncement(text);
      }
    }, 4500);

    return () => clearTimeout(timer);
  }, [currentStopIndex, route, recalculating]);

  useEffect(() => {
    if (stops[0]) {
      const text = language === 'en'
        ? `Trip tracking simulation started. Current station is ${stops[0].stationName}. Boarding platform ${stops[0].platformNumber || '1'}.`
        : `ट्रैकिंग सिमुलेशन शुरू हुआ। वर्तमान स्टेशन ${stops[0].stationName} है। बोर्डिंग प्लेटफॉर्म ${stops[0].platformNumber || '1'}।`;
      speakAnnouncement(text);
    }
  }, [route]);

  const handleWrongTrain = () => {
    setRecalculating(true);
    setIsWrongTrain(true);
    
    const allCityStations = getStationsByCity(selectedCity);
    const routeStationIds = stops.map(s => s.stationId);
    const offRouteStations = allCityStations.filter(s => !routeStationIds.includes(s.id));
    
    const randomStation: MetroStation = offRouteStations.length > 0 
      ? offRouteStations[Math.floor(Math.random() * offRouteStations.length)]
      : allCityStations[0];
      
    setWrongStationName(randomStation.name);

    setTimeout(() => {
      const newRoute = calculateRoute(selectedCity, randomStation.id, destinationStationId);
      
      if (newRoute) {
        setRoute(newRoute);
        setCurrentStopIndex(0);
        setIsWrongTrain(false);
        setRecalculating(false);
        
        const announceText = language === 'en'
          ? `Alert. Wrong train simulation. Recalculating route from ${randomStation.name}.`
          : `चेतावनी। गलत ट्रेन सिमुलेशन। ${randomStation.name} से मार्ग की पुनर्गणना।`;
        speakAnnouncement(announceText);
      } else {
        alert(language === 'en' ? 'Unable to reroute.' : 'मार्ग बदलने में असमर्थ।');
        onClose();
      }
    }, 2000);
  };

  const remainingTime = Math.max(0, route.estimatedTime - currentStopIndex * 2);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(11, 31, 58, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        padding: '16px',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '540px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: '#FFFFFF',
          border: '2px solid var(--metro-blue)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--metro-card-border)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.3rem' }}>🛰️</span>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--metro-navy)', fontWeight: 800 }}>
              {t.tracker.trackingTitle}
            </h3>
            <span className="demo-notice-badge">SIMULATION</span>
          </div>
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            style={{
              background: 'var(--metro-light-bg)',
              border: '1px solid var(--metro-card-border)',
              borderRadius: '8px',
              cursor: 'pointer',
              padding: '6px 12px',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: 'var(--metro-navy)',
            }}
          >
            {isMuted ? '🔇 Audio Off' : '🔊 Audio On'}
          </button>
        </div>

        {recalculating ? (
          <div style={{ textAlign: 'center', padding: '30px 20px' }}>
            <div className="animate-spin" style={{ fontSize: '2rem', color: 'var(--metro-red)', margin: '0 auto 12px' }}>
              ⚙️
            </div>
            <h4 style={{ color: 'var(--metro-red)', margin: '0 0 6px', fontWeight: 800 }}>
              {t.tracker.wrongTrainAlert}
            </h4>
            <p style={{ color: 'var(--metro-text-muted)', margin: 0, fontSize: '0.9rem' }}>
              Rerouting from {wrongStationName}...
            </p>
          </div>
        ) : isFinished ? (
          <div style={{ textAlign: 'center', padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '2.5rem' }}>🎉</span>
            <h3 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--metro-green)', fontWeight: 800 }}>
              {t.tracker.arrivedTitle}
            </h3>
            <p style={{ margin: 0, color: 'var(--metro-text-main)', fontSize: '1rem', lineHeight: '1.5' }}>
              {t.tracker.arrivedMsg} <strong style={{ color: 'var(--metro-blue)' }}>{currentStop.exitGate || 'Main Exit'}</strong>
            </p>
            <button className="btn-primary" onClick={onClose} style={{ width: '140px', marginTop: '10px' }}>
              Close
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* ETA Box */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'var(--metro-light-bg)', padding: '14px', borderRadius: '10px', border: '1px solid var(--metro-card-border)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--metro-text-subtle)', fontWeight: 700, textTransform: 'uppercase' }}>ESTIMATED TIME</span>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--metro-blue)' }}>
                  {remainingTime} {t.routeDetails.minutes}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--metro-text-subtle)', fontWeight: 700, textTransform: 'uppercase' }}>NEXT STOP</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--metro-navy)' }}>
                  {nextStop ? nextStop.stationName : 'Arriving...'}
                </div>
              </div>
            </div>

            {/* Current Station */}
            <div style={{ background: 'var(--metro-light-bg)', padding: '12px 16px', borderRadius: '10px', borderLeft: `5px solid ${currentStop.lineColor || 'var(--metro-blue)'}`, border: '1px solid var(--metro-card-border)', borderLeftWidth: '5px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--metro-text-subtle)', fontWeight: 700 }}>CURRENT LOCATION (SIMULATED)</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--metro-navy)', marginTop: '2px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{currentStop.stationName}</span>
                <span className="metro-line-badge" style={{ backgroundColor: currentStop.lineColor || 'var(--metro-blue)' }}>
                  {currentStop.line}
                </span>
              </div>
            </div>

            {/* Timeline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', paddingLeft: '8px' }}>
              {stops.map((stop, index) => {
                const isPassed = index < currentStopIndex;
                const isActive = index === currentStopIndex;
                
                return (
                  <div key={stop.stationId} style={{ display: 'flex', gap: '14px', position: 'relative', paddingBottom: index < stops.length - 1 ? '20px' : '0' }}>
                    {index < stops.length - 1 && (
                      <div
                        style={{
                          position: 'absolute',
                          left: '9px',
                          top: '18px',
                          bottom: 0,
                          width: '4px',
                          backgroundColor: isPassed ? 'var(--metro-green)' : 'var(--metro-card-border)',
                          zIndex: 1,
                        }}
                      />
                    )}

                    <div
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        border: `3px solid ${isActive ? 'var(--metro-blue)' : isPassed ? 'var(--metro-green)' : 'var(--metro-card-border)'}`,
                        background: isActive ? 'var(--metro-blue)' : isPassed ? 'var(--metro-green)' : '#FFFFFF',
                        zIndex: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isPassed && <span style={{ color: '#FFFFFF', fontSize: '0.6rem', fontWeight: 900 }}>✓</span>}
                      {isActive && <div style={{ width: '6px', height: '6px', background: '#FFFFFF', borderRadius: '50%' }} />}
                    </div>

                    <div style={{ flex: 1, marginTop: '1px' }}>
                      <div style={{
                        fontWeight: isActive ? 800 : isPassed ? 600 : 500,
                        color: isActive ? 'var(--metro-blue)' : isPassed ? 'var(--metro-text-muted)' : 'var(--metro-text-main)',
                        fontSize: isActive ? '1rem' : '0.9rem',
                      }}>
                        {stop.stationName} {isActive && <span style={{ fontSize: '0.7rem', background: 'var(--metro-blue)', color: '#FFFFFF', padding: '1px 6px', borderRadius: '4px', marginLeft: '6px', fontWeight: 700 }}>ACTIVE</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--metro-text-subtle)', textAlign: 'center' }}>
              {t.tracker.trackingSubtext}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={handleWrongTrain}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  background: 'rgba(229, 57, 53, 0.08)',
                  color: 'var(--metro-red)',
                  border: '1px solid rgba(229, 57, 53, 0.3)',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                }}
              >
                {t.tracker.wrongTrainBtn}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-outline"
                style={{ flex: 1 }}
              >
                Exit Tracker
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
