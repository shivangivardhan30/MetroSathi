import { useState, useEffect, useRef } from 'react';
import { MetroRoute, calculateRoute } from '../lib/routeCalculator';
import { getStationById, MetroStation, getStationsByCity } from '../lib/metroData';
import { useTranslation } from '../lib/translations';
import { AlertIcon, SosIcon } from './NavIcons';

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

  // Destination SOS Alert States
  const [sosAlarmEnabled, setSosAlarmEnabled] = useState(true);
  const [showSosArrivalModal, setShowSosArrivalModal] = useState(false);
  const [showEmergencyHelp, setShowEmergencyHelp] = useState(false);
  const [hasAlarmTriggered, setHasAlarmTriggered] = useState(false);

  const stops = route.stops;
  const currentStop = stops[currentStopIndex];
  const nextStop = currentStopIndex < stops.length - 1 ? stops[currentStopIndex + 1] : null;
  const isFinished = currentStopIndex === stops.length - 1;
  const isPreArrival = currentStopIndex === stops.length - 2;
  const destinationStop = stops[stops.length - 1];

  // Synthesized Web Audio API Alert Chimes
  const playDestinationChime = () => {
    if (isMuted || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // High-priority 4-tone transit chime (880Hz, 1174Hz, 1320Hz, 1760Hz)
      const notes = [
        { f: 880, start: 0, dur: 0.25 },
        { f: 1174, start: 0.22, dur: 0.25 },
        { f: 1320, start: 0.44, dur: 0.25 },
        { f: 1760, start: 0.66, dur: 0.5 },
      ];

      notes.forEach(({ f, start, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, ctx.currentTime + start);
        gain.gain.setValueAtTime(0.35, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + dur);
      });
    } catch (err) {
      console.error('Audio chime error:', err);
    }
  };

  const playPreArrivalChime = () => {
    if (isMuted || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const notes = [
        { f: 659, start: 0, dur: 0.2 },
        { f: 880, start: 0.2, dur: 0.35 },
      ];
      notes.forEach(({ f, start, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, ctx.currentTime + start);
        gain.gain.setValueAtTime(0.25, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + dur);
      });
    } catch (err) {
      console.error('Pre-arrival audio error:', err);
    }
  };

  const triggerVibrate = (pattern: number[]) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // Ignore
      }
    }
  };

  // Speak announcement using SpeechSynthesis API
  const speakAnnouncement = (text: string) => {
    if (isMuted || typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  // Trigger Destination SOS Alert
  const triggerDestinationSosAlert = () => {
    playDestinationChime();
    triggerVibrate([500, 250, 500, 250, 1000]);
    setShowSosArrivalModal(true);

    const announceText = language === 'en'
      ? `Passenger Alert! Your destination station, ${destinationStop.stationName}, has arrived! Please alight immediately and proceed to Exit Gate ${destinationStop.exitGate || '1'}.`
      : `यात्रीगण कृपया ध्यान दें! आपका गंतव्य स्टेशन, ${destinationStop.stationName}, आ गया है! कृपया तुरंत ट्रेन से उतरें और गेट नंबर ${destinationStop.exitGate || '1'} की ओर प्रस्थान करें।`;
    speakAnnouncement(announceText);
  };

  // Simulating movement from station to station
  useEffect(() => {
    if (isFinished || recalculating) return;

    const timer = setTimeout(() => {
      const nextIndex = currentStopIndex + 1;
      setCurrentStopIndex(nextIndex);

      const nextStation = stops[nextIndex];
      if (nextStation) {
        // Check if arriving at destination
        if (nextIndex === stops.length - 1) {
          if (sosAlarmEnabled && !hasAlarmTriggered) {
            setHasAlarmTriggered(true);
            triggerDestinationSosAlert();
          } else {
            const text = language === 'en'
              ? `Attention passengers. Arrived at destination, ${nextStation.stationName}. Exit from ${nextStation.exitGate || 'main gate'}.`
              : `यात्रीगण कृपया ध्यान दें। गंतव्य, ${nextStation.stationName} पर पहुंच गए हैं। कृपया ${nextStation.exitGate || 'मुख्य गेट'} से बाहर निकलें।`;
            speakAnnouncement(text);
          }
        }
        // Check if 1 stop before destination (Pre-Arrival SOS Warning)
        else if (nextIndex === stops.length - 2) {
          if (sosAlarmEnabled) {
            playPreArrivalChime();
            triggerVibrate([300, 150, 300]);
          }
          const text = language === 'en'
            ? `Attention passengers. Next station is your destination, ${destinationStop.stationName}. Please prepare to alight.`
            : `यात्रीगण कृपया ध्यान दें। अगला स्टेशन आपका गंतव्य, ${destinationStop.stationName} है। उतरने की तैयारी करें।`;
          speakAnnouncement(text);
        } else {
          const text = language === 'en'
            ? `Next station is ${nextStation.stationName}. Platform ${nextStation.platformNumber || '1'}.`
            : `अगला स्टेशन ${nextStation.stationName} है। प्लेटफॉर्म ${nextStation.platformNumber || '1'}।`;
          speakAnnouncement(text);
        }
      }
    }, 4500);

    return () => clearTimeout(timer);
  }, [currentStopIndex, route, recalculating, sosAlarmEnabled, hasAlarmTriggered]);

  useEffect(() => {
    if (stops[0]) {
      const text = language === 'en'
        ? `Trip tracking simulation started. Current station is ${stops[0].stationName}. Boarding platform ${stops[0].platformNumber || '1'}. Destination alarm is active.`
        : `ट्रैकिंग सिमुलेशन शुरू हुआ। वर्तमान स्टेशन ${stops[0].stationName} है। बोर्डिंग प्लेटफॉर्म ${stops[0].platformNumber || '1'}। गंतव्य अलार्म सक्रिय है।`;
      speakAnnouncement(text);
    }
  }, [route]);

  const handleWrongTrain = () => {
    setRecalculating(true);
    setIsWrongTrain(true);

    const allCityStations = getStationsByCity(selectedCity);
    const routeStationIds = stops.map((s) => s.stationId);
    const offRouteStations = allCityStations.filter((s) => !routeStationIds.includes(s.id));

    const randomStation: MetroStation =
      offRouteStations.length > 0
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
        setHasAlarmTriggered(false);

        const announceText =
          language === 'en'
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
          maxHeight: '92vh',
          overflowY: 'auto',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--metro-card-border)',
          borderTop: '4px solid var(--metro-blue)',
          borderRadius: '8px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--metro-card-border)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--metro-navy)', fontWeight: 700 }}>
              {t.tracker.trackingTitle}
            </h3>
            <span className="demo-notice-badge">PASSENGER SIMULATION</span>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              style={{
                background: '#F8FAFC',
                border: '1px solid var(--metro-card-border)',
                borderRadius: '4px',
                cursor: 'pointer',
                padding: '4px 8px',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--metro-navy)',
              }}
            >
              {isMuted ? 'Audio Off' : 'Audio On'}
            </button>
            <button
              type="button"
              onClick={() => setShowEmergencyHelp(true)}
              style={{
                background: '#FEF2F2',
                border: '1px solid #FCA5A5',
                borderRadius: '4px',
                cursor: 'pointer',
                padding: '4px 8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#B91C1C',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
              title="Official Metro Transit Emergency Numbers"
            >
              <SosIcon size={14} color="#B91C1C" /> SOS
            </button>
          </div>
        </div>

        {/* SOS Destination Alert Control Strip */}
        <div
          style={{
            background: sosAlarmEnabled ? '#EFF6FF' : '#F8FAFC',
            border: `1px solid ${sosAlarmEnabled ? '#93C5FD' : 'var(--metro-card-border)'}`,
            borderRadius: '6px',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: sosAlarmEnabled ? '#10B981' : '#94A3B8',
                boxShadow: sosAlarmEnabled ? '0 0 8px #10B981' : 'none',
              }}
            />
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--metro-navy)' }}>
                {sosAlarmEnabled ? t.tracker.sosAlarmActive : t.tracker.sosAlarmInactive}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--metro-text-subtle)' }}>
                {destinationStop.stationName} • {language === 'en' ? 'Alerts before destination' : 'गंतव्य से पहले अलार्म'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={() => triggerDestinationSosAlert()}
              style={{
                padding: '5px 10px',
                fontSize: '0.75rem',
                background: '#1D4ED8',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {language === 'en' ? 'Test SOS Alert' : 'अलार्म टेस्ट'}
            </button>
            <button
              type="button"
              onClick={() => setSosAlarmEnabled(!sosAlarmEnabled)}
              style={{
                padding: '5px 10px',
                fontSize: '0.75rem',
                background: '#FFFFFF',
                color: 'var(--metro-navy)',
                border: '1px solid var(--metro-card-border)',
                borderRadius: '4px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {sosAlarmEnabled ? (language === 'en' ? 'Turn Off' : 'बंद करें') : (language === 'en' ? 'Turn On' : 'चालू करें')}
            </button>
          </div>
        </div>

        {/* Pre-Arrival Warning Banner (When 1 stop before destination) */}
        {isPreArrival && (
          <div
            style={{
              background: '#FFFBEB',
              border: '2px solid #F59E0B',
              borderRadius: '6px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <AlertIcon size={22} color="#D97706" />
            <div>
              <div style={{ fontWeight: 800, color: '#B45309', fontSize: '0.88rem' }}>
                {t.tracker.sosPreArrivalBanner}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#78350F', marginTop: '2px' }}>
                {language === 'en'
                  ? `Next Station: ${destinationStop.stationName} (Exit Gate: ${destinationStop.exitGate || '1'})`
                  : `अगला स्टेशन: ${destinationStop.stationName} (निकास द्वार: ${destinationStop.exitGate || '1'})`}
              </div>
            </div>
          </div>
        )}

        {/* Recalculating State */}
        {recalculating ? (
          <div style={{ textAlign: 'center', padding: '30px 20px' }}>
            <div
              className="animate-spin"
              style={{
                width: '28px',
                height: '28px',
                border: '3px solid #E2E8F0',
                borderTopColor: 'var(--metro-red)',
                borderRadius: '50%',
                margin: '0 auto 12px auto',
              }}
            />
            <h4 style={{ color: 'var(--metro-red)', margin: '0 0 6px', fontWeight: 700 }}>
              {t.tracker.wrongTrainAlert}
            </h4>
            <p style={{ color: 'var(--metro-text-muted)', margin: 0, fontSize: '0.88rem' }}>
              Rerouting from {wrongStationName}...
            </p>
          </div>
        ) : isFinished ? (
          <div
            style={{
              textAlign: 'center',
              padding: '24px 16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              border: '2px solid #059669',
              borderRadius: '6px',
              background: '#ECFDF5',
            }}
          >
            <div
              style={{
                background: '#047857',
                color: '#FFFFFF',
                padding: '4px 12px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: '0.5px',
              }}
            >
              DESTINATION ARRIVED
            </div>
            <h3 style={{ margin: 0, fontSize: '1.35rem', color: 'var(--metro-navy)', fontWeight: 800 }}>
              {destinationStop.stationName}
            </h3>
            <p style={{ margin: 0, color: 'var(--metro-text-main)', fontSize: '0.95rem', lineHeight: '1.5' }}>
              {t.tracker.arrivedMsg} <strong style={{ color: 'var(--metro-blue)' }}>{destinationStop.exitGate || 'Main Exit Gate'}</strong>
            </p>
            <button className="btn-primary" onClick={onClose} style={{ minWidth: '140px', marginTop: '8px' }}>
              Complete Journey
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* ETA Box */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'var(--metro-light-bg)', padding: '12px 14px', borderRadius: '6px', border: '1px solid var(--metro-card-border)' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--metro-text-subtle)', fontWeight: 700, textTransform: 'uppercase' }}>ESTIMATED TIME</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--metro-blue)' }}>
                  {remainingTime} {t.routeDetails.minutes}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--metro-text-subtle)', fontWeight: 700, textTransform: 'uppercase' }}>NEXT STOP</span>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--metro-navy)' }}>
                  {nextStop ? nextStop.stationName : 'Arriving...'}
                </div>
              </div>
            </div>

            {/* Current Station */}
            <div style={{ background: 'var(--metro-light-bg)', padding: '12px 14px', borderRadius: '4px', border: '1px solid var(--metro-card-border)', borderLeft: `5px solid ${currentStop.lineColor || 'var(--metro-blue)'}` }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--metro-text-subtle)', fontWeight: 700 }}>CURRENT LOCATION (SIMULATED)</span>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--metro-navy)', marginTop: '2px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{currentStop.stationName}</span>
                <span className="metro-line-badge" style={{ backgroundColor: currentStop.lineColor || 'var(--metro-blue)' }}>
                  {currentStop.line}
                </span>
              </div>
            </div>

            {/* Timeline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', paddingLeft: '8px', maxHeight: '280px', overflowY: 'auto' }}>
              {stops.map((stop, index) => {
                const isPassed = index < currentStopIndex;
                const isActive = index === currentStopIndex;
                const isDest = index === stops.length - 1;

                return (
                  <div key={stop.stationId} style={{ display: 'flex', gap: '14px', position: 'relative', paddingBottom: index < stops.length - 1 ? '18px' : '0' }}>
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
                        border: `3px solid ${isActive ? 'var(--metro-blue)' : isDest ? '#DC2626' : isPassed ? 'var(--metro-green)' : 'var(--metro-card-border)'}`,
                        background: isActive ? 'var(--metro-blue)' : isPassed ? 'var(--metro-green)' : isDest ? '#FEE2E2' : '#FFFFFF',
                        zIndex: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isPassed && <span style={{ color: '#FFFFFF', fontSize: '0.6rem', fontWeight: 900 }}>✓</span>}
                      {isActive && <div style={{ width: '6px', height: '6px', background: '#FFFFFF', borderRadius: '50%' }} />}
                      {!isPassed && !isActive && isDest && <div style={{ width: '6px', height: '6px', background: '#DC2626', borderRadius: '50%' }} />}
                    </div>

                    <div style={{ flex: 1, marginTop: '1px' }}>
                      <div
                        style={{
                          fontWeight: isActive || isDest ? 800 : isPassed ? 600 : 500,
                          color: isActive ? 'var(--metro-blue)' : isDest ? '#991B1B' : isPassed ? 'var(--metro-text-muted)' : 'var(--metro-text-main)',
                          fontSize: isActive ? '0.95rem' : '0.88rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <span>{stop.stationName}</span>
                        {isActive && <span style={{ fontSize: '0.68rem', background: 'var(--metro-blue)', color: '#FFFFFF', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>ACTIVE</span>}
                        {isDest && <span style={{ fontSize: '0.68rem', background: '#DC2626', color: '#FFFFFF', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>DESTINATION</span>}
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
                  borderRadius: '6px',
                  background: 'rgba(229, 57, 53, 0.08)',
                  color: 'var(--metro-red)',
                  border: '1px solid rgba(229, 57, 53, 0.3)',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                }}
              >
                {t.tracker.wrongTrainBtn}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-outline"
                style={{ flex: 1, padding: '10px', fontSize: '0.84rem' }}
              >
                Exit Tracker
              </button>
            </div>
          </div>
        )}

        {/* ----------------- High-Priority Destination SOS Alert Modal ----------------- */}
        {showSosArrivalModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.92)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 10000,
              padding: '16px',
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '460px',
                background: '#FFFFFF',
                borderRadius: '8px',
                border: '3px solid #DC2626',
                boxShadow: '0 10px 40px rgba(220, 38, 38, 0.4)',
                overflow: 'hidden',
                textAlign: 'center',
              }}
            >
              {/* Alert Header Strip */}
              <div
                style={{
                  background: '#DC2626',
                  color: '#FFFFFF',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontWeight: 900,
                  letterSpacing: '1px',
                  fontSize: '0.9rem',
                }}
              >
                <AlertIcon size={20} color="#FFFFFF" />
                <span>{t.tracker.sosAlertTitle.toUpperCase()}</span>
              </div>

              <div style={{ padding: '24px 20px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    background: '#FEE2E2',
                    color: '#991B1B',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    marginBottom: '12px',
                  }}
                >
                  {t.tracker.sosArrivedBanner}
                </span>

                <h2
                  style={{
                    margin: '0 0 6px 0',
                    fontSize: '1.65rem',
                    fontWeight: 900,
                    color: 'var(--metro-navy)',
                  }}
                >
                  {destinationStop.stationName}
                </h2>

                <div
                  style={{
                    fontSize: '0.92rem',
                    color: 'var(--metro-text-muted)',
                    marginBottom: '18px',
                    lineHeight: 1.5,
                  }}
                >
                  {language === 'en'
                    ? `You have reached your destination. Please collect your belongings and alight from the train.`
                    : `आप अपने गंतव्य स्टेशन पर पहुंच गए हैं। कृपया अपना सामान संभालें और ट्रेन से तुरंत उतरें।`}
                </div>

                {/* Guidance Cards */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px',
                    marginBottom: '20px',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid var(--metro-card-border)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--metro-text-subtle)', fontWeight: 700 }}>RECOMMENDED EXIT GATE</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--metro-blue)', marginTop: '2px' }}>
                      {destinationStop.exitGate || 'Main Gate (Gate 1)'}
                    </div>
                  </div>

                  <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid var(--metro-card-border)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--metro-text-subtle)', fontWeight: 700 }}>PLATFORM</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--metro-navy)', marginTop: '2px' }}>
                      Platform {destinationStop.platformNumber || '1'}
                    </div>
                  </div>
                </div>

                {/* Dismiss Alarm Button */}
                <button
                  type="button"
                  onClick={() => setShowSosArrivalModal(false)}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: '#1D4ED8',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                  }}
                >
                  {t.tracker.dismissAlarmBtn}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- Emergency Helpline Modal ----------------- */}
        {showEmergencyHelp && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 10000,
              padding: '16px',
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '420px',
                background: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid var(--metro-card-border)',
                borderTop: '4px solid #DC2626',
                boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
                padding: '20px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#991B1B', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <SosIcon size={18} color="#991B1B" /> {t.tracker.emergencyHelplineTitle}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowEmergencyHelp(false)}
                  style={{ background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: '#64748B' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <a
                  href="tel:155370"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 14px',
                    background: '#F8FAFC',
                    borderRadius: '6px',
                    border: '1px solid var(--metro-card-border)',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--metro-navy)', fontSize: '0.9rem' }}>DMRC Metro 24x7 Helpline</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--metro-text-subtle)' }}>Transit assistance & station security</div>
                  </div>
                  <strong style={{ color: '#1D4ED8', fontSize: '1.05rem' }}>155370</strong>
                </a>

                <a
                  href="tel:112"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 14px',
                    background: '#F8FAFC',
                    borderRadius: '6px',
                    border: '1px solid var(--metro-card-border)',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--metro-navy)', fontSize: '0.9rem' }}>National Police & Emergency</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--metro-text-subtle)' }}>Immediate police and medical aid</div>
                  </div>
                  <strong style={{ color: '#DC2626', fontSize: '1.05rem' }}>112</strong>
                </a>

                <a
                  href="tel:1091"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 14px',
                    background: '#F8FAFC',
                    borderRadius: '6px',
                    border: '1px solid var(--metro-card-border)',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--metro-navy)', fontSize: '0.9rem' }}>Women Passenger Safety Helpline</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--metro-text-subtle)' }}>Dedicated women passenger security</div>
                  </div>
                  <strong style={{ color: '#9333EA', fontSize: '1.05rem' }}>1091</strong>
                </a>
              </div>

              <button
                type="button"
                onClick={() => setShowEmergencyHelp(false)}
                className="btn-outline"
                style={{ width: '100%', marginTop: '16px', padding: '10px' }}
              >
                Close Emergency Help
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}