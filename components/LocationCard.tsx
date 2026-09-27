import React, { useState } from 'react';
import { useLanguage } from '../lib/languageContext';
import { useTranslation } from '../lib/translations';
import { findGlobalNearestStation, NearestStationResult } from '../lib/metroData';

interface LocationCardProps {
  onStationSelected: (stationId: string, city: string) => void;
  onManualSelectClick?: () => void;
}

export default function LocationCard({ onStationSelected, onManualSelectClick }: LocationCardProps) {
  const { language } = useLanguage();
  const t = useTranslation(language);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NearestStationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);

  const handleDetectLocation = () => {
    setLoading(true);
    setErrorMsg(null);
    setResult(null);
    setCoords(null);

    if (!navigator.geolocation) {
      setLoading(false);
      setErrorMsg(t.geolocation.unsupported);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lon: longitude });

        // Search global metro station dataset (25km radius limit)
        const nearest = findGlobalNearestStation(latitude, longitude, 25);

        setLoading(false);

        if (nearest) {
          setResult(nearest);
          // Automatically select station and city
          onStationSelected(nearest.station.id, nearest.city);
        } else {
          setErrorMsg(t.geolocation.noNearbyStation);
        }
      },
      (error) => {
        setLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setErrorMsg(t.geolocation.permissionDenied);
            break;
          case error.POSITION_UNAVAILABLE:
            setErrorMsg(t.geolocation.positionUnavailable);
            break;
          case error.TIMEOUT:
            setErrorMsg(t.geolocation.timeout);
            break;
          default:
            setErrorMsg(error.message || t.geolocation.positionUnavailable);
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="location-card-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.2rem' }}>📍</span>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--metro-navy)' }}>
            {language === 'en' ? 'Location Finder' : 'स्थान खोजक'}
          </h3>
        </div>

        {result && (
          <span className="location-status-badge success">
            ✓ {t.geolocation.locationDetected}
          </span>
        )}
        {errorMsg && (
          <span className="location-status-badge error">
            ⚠️ {language === 'en' ? 'Notice' : 'सूचना'}
          </span>
        )}
        {loading && (
          <span className="location-status-badge loading">
            <span className="animate-spin" style={{ display: 'inline-block' }}>⚙️</span> {t.geolocation.detecting}
          </span>
        )}
      </div>

      {/* Main Action State: Initial */}
      {!result && !loading && !errorMsg && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--metro-text-muted)' }}>
            {language === 'en'
              ? 'Find your nearest metro station across India using your device GPS.'
              : 'अपने डिवाइस जीपीएस का उपयोग करके भारत भर में अपना निकटतम मेट्रो स्टेशन खोजें।'}
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '4px' }}>
            <button
              onClick={handleDetectLocation}
              className="btn-primary"
              style={{ flex: 1, minWidth: '220px' }}
            >
              <span>📍</span> {t.geolocation.useMyLocation}
            </button>
            {onManualSelectClick && (
              <button
                onClick={onManualSelectClick}
                className="btn-outline"
                style={{ flex: '0 0 auto' }}
              >
                {t.geolocation.chooseManually}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div className="animate-spin" style={{ fontSize: '2rem', marginBottom: '8px', color: 'var(--metro-blue)' }}>
            🌀
          </div>
          <div style={{ fontWeight: 700, color: 'var(--metro-navy)', fontSize: '1rem' }}>
            {t.geolocation.detecting}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--metro-text-subtle)', marginTop: '4px' }}>
            {language === 'en' ? 'Searching all Indian metro networks...' : 'सभी भारतीय मेट्रो नेटवर्क खोजे जा रहे हैं...'}
          </div>
        </div>
      )}

      {/* Result State */}
      {result && !loading && (
        <div style={{ background: 'var(--metro-light-bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--metro-card-border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--metro-text-subtle)', textTransform: 'uppercase' }}>
                {t.geolocation.nearestMetroStation}
              </span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--metro-navy)', marginTop: '2px' }}>
                {result.station.name} <span style={{ fontSize: '0.85rem', color: 'var(--metro-text-muted)', fontWeight: 600 }}>({result.station.code})</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
              <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '10px', background: 'var(--metro-navy)', color: '#FFFFFF', fontWeight: 700 }}>
                {result.station.network || result.city}
              </span>
              <div
                className="metro-line-badge"
                style={{ backgroundColor: result.station.lineColor || 'var(--metro-blue)' }}
              >
                🚇 {result.station.line}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', fontSize: '0.88rem', color: 'var(--metro-text-muted)', paddingTop: '8px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            <div>
              <strong>{t.geolocation.city}:</strong> {result.city}
            </div>
            <div>
              <strong>Network:</strong> {result.station.network}
            </div>
            <div>
              <strong>{t.geolocation.distance}:</strong> ~{result.distanceKm.toFixed(2)} km
            </div>
            {coords && (
              <div style={{ fontSize: '0.8rem', color: 'var(--metro-text-subtle)' }}>
                ({coords.lat.toFixed(4)}, {coords.lon.toFixed(4)})
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <button
              onClick={handleDetectLocation}
              className="btn-outline"
              style={{ padding: '6px 12px', fontSize: '0.82rem' }}
            >
              {t.geolocation.tryAgain}
            </button>
            {onManualSelectClick && (
              <button
                onClick={onManualSelectClick}
                style={{ background: 'transparent', border: 'none', color: 'var(--metro-blue)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', textDecoration: 'underline' }}
              >
                {t.geolocation.chooseManually}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Error State */}
      {errorMsg && !loading && (
        <div style={{ background: 'rgba(229, 57, 53, 0.05)', border: '1px solid rgba(229, 57, 53, 0.2)', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ color: 'var(--metro-red)', fontSize: '0.92rem', fontWeight: 600, lineHeight: 1.5 }}>
            ⚠️ {errorMsg}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--metro-text-subtle)' }}>
            {t.geolocation.secureContextNotice}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button
              onClick={handleDetectLocation}
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              {t.geolocation.tryAgain}
            </button>
            {onManualSelectClick && (
              <button
                onClick={onManualSelectClick}
                className="btn-outline"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                {t.geolocation.chooseManually}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
