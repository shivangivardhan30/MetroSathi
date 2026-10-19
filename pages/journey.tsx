import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from '../lib/translations';
import { useLanguage } from '../lib/languageContext';
import SearchableDropdown, { DropdownOption } from '../components/SearchableDropdown';
import RouteDetails from '../components/RouteDetails';
import LocationCard from '../components/LocationCard';
import { availableCities, getAllStations, MetroStation, getStationById } from '../lib/metroData';
import { calculateRoute, MetroRoute } from '../lib/routeCalculator';

export default function Journey() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = useTranslation(language);

  const [selectedCity, setSelectedCity] = useState('Delhi');
  const [sourceStation, setSourceStation] = useState<string>('');
  const [destinationStation, setDestinationStation] = useState<string>('');
  const [route, setRoute] = useState<MetroRoute | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [allStationsList, setAllStationsList] = useState<MetroStation[]>([]);

  const manualFormRef = useRef<HTMLDivElement>(null);

  // Load all stations across networks on mount
  useEffect(() => {
    const stations = getAllStations();
    setAllStationsList(stations);
  }, []);

  // Handle router query parameters
  useEffect(() => {
    if (router.isReady) {
      const { src, dest } = router.query;

      if (src && typeof src === 'string') {
        const station = getStationById(src);
        if (station) {
          setSelectedCity(station.city);
          setSourceStation(src);
        }
      }
      if (dest && typeof dest === 'string') {
        setDestinationStation(dest);
      }

      if (src && dest && typeof src === 'string' && typeof dest === 'string') {
        setIsLoading(true);
        setTimeout(() => {
          const calculatedRoute = calculateRoute('Delhi', src, dest);
          setRoute(calculatedRoute);
          setIsLoading(false);
        }, 300);
      }
    }
  }, [router.isReady, router.query]);

  // Handle GPS location detection from LocationCard
  const handleLocationStationSelected = (stationId: string, city: string) => {
    setSelectedCity(city);
    setSourceStation(stationId);
  };

  const scrollToManualSelect = () => {
    manualFormRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleShowRoute = () => {
    if (!sourceStation || !destinationStation) {
      alert(language === 'en' ? 'Please select both source and destination stations' : 'कृपया दोनों स्रोत और गंतव्य स्टेशन चुनें');
      return;
    }

    if (sourceStation === destinationStation) {
      alert(language === 'en' ? 'Source and destination must be different' : 'स्रोत और गंतव्य अलग होना चाहिए');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const calculatedRoute = calculateRoute(selectedCity, sourceStation, destinationStation);
      setRoute(calculatedRoute);
      setIsLoading(false);

      if (!calculatedRoute) {
        alert(language === 'en' ? 'No route found between selected stations' : 'चुने गए स्टेशनों के बीच कोई मार्ग नहीं मिला');
      }
    }, 300);
  };

  // Station options for dropdowns
  const stationOptions: DropdownOption[] = allStationsList.map((station) => ({
    id: station.id,
    name: station.name,
    code: station.code,
    line: station.line,
    lineColor: station.lineColor,
    network: station.network,
    isInterchange: station.isInterchange,
    city: station.city,
  }));

  const sourceStationObj = getStationById(sourceStation);
  const destStationObj = getStationById(destinationStation);

  return (
    <main className="container">
      {/* Title */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--metro-navy)', margin: 0 }}>
          {t.journey.title}
        </h1>
        <p style={{ color: 'var(--metro-text-muted)', fontSize: '1rem', marginTop: '6px' }}>
          {t.journey.description}
        </p>
      </div>

      {/* 1. Location Finder Card */}
      <LocationCard
        onStationSelected={handleLocationStationSelected}
        onManualSelectClick={scrollToManualSelect}
      />

      {/* 2. Journey Planner Form */}
      <section ref={manualFormRef} className="form-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--metro-navy)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🚆</span> {language === 'en' ? 'Plan Inter-Network & City Metro Journey' : 'इंटर-नेटवर्क मेट्रो यात्रा योजनाकार'}
        </h3>

        {/* Source Station Selection */}
        <SearchableDropdown
          options={stationOptions}
          selectedId={sourceStation}
          onChange={setSourceStation}
          placeholder={t.routeDetails.sourceStation}
          searchPlaceholder="Search source station e.g. Noida Sector 51, Rajiv Chowk..."
          label={language === 'en' ? '🚉 Source Station' : '🚉 स्रोत स्टेशन'}
        />

        {/* Destination Station Selection */}
        <SearchableDropdown
          options={stationOptions}
          selectedId={destinationStation}
          onChange={setDestinationStation}
          placeholder={t.routeDetails.destinationStation}
          searchPlaceholder="Search destination station e.g. Lajpat Nagar, Pari Chowk..."
          label={language === 'en' ? '🎯 Destination Station' : '🎯 गंतव्य स्टेशन'}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '8px' }}>
          <button className="button" onClick={handleShowRoute} style={{ width: '100%' }}>
            🔍 {t.journey.showRoute}
          </button>
          <button
            type="button"
            className="button"
            onClick={() => {
              if (sourceStation && destinationStation) {
                router.push(`/tickets?src=${encodeURIComponent(sourceStation)}&dest=${encodeURIComponent(destinationStation)}`);
              } else if (sourceStation) {
                router.push(`/tickets?src=${encodeURIComponent(sourceStation)}`);
              } else {
                router.push('/tickets');
              }
            }}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
              borderColor: '#059669',
            }}
          >
            🎫 {language === 'en' ? 'Buy Metro Ticket' : 'मेट्रो टिकट खरीदें'}
          </button>
        </div>
      </section>

      {/* 3. Visual Step Flow Banner */}
      <section className="card" style={{ marginBottom: '32px', backgroundColor: 'var(--metro-navy)', color: '#ffffff' }}>
        <h4 style={{ margin: '0 0 16px', fontSize: '0.9rem', color: 'var(--metro-cyan)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {t.journey.stepTitle}
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', fontSize: '0.88rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '8px' }}>
            📍 Location
          </div>
          <span style={{ color: 'var(--metro-cyan)' }}>➔</span>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '8px' }}>
            🚉 {sourceStationObj ? `${sourceStationObj.name} (${sourceStationObj.network})` : (language === 'en' ? 'Source' : 'स्रोत')}
          </div>
          <span style={{ color: 'var(--metro-cyan)' }}>➔</span>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '8px' }}>
            🎯 {destStationObj ? `${destStationObj.name} (${destStationObj.network})` : (language === 'en' ? 'Destination' : 'गंतव्य')}
          </div>
          <span style={{ color: 'var(--metro-cyan)' }}>➔</span>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '8px' }}>
            🚇 Platform & Gate
          </div>
        </div>
      </section>

      {/* 4. Route Details Result */}
      {(route || isLoading) && (
        <section>
          <RouteDetails route={route} language={language} isLoading={isLoading} />
        </section>
      )}

      {/* No route message */}
      {!route && !isLoading && sourceStation && destinationStation && (
        <section className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--metro-red)', border: '1px solid rgba(229, 57, 53, 0.3)' }}>
          <p style={{ margin: 0, fontWeight: 700 }}>{t.routeDetails.noRouteFound}</p>
        </section>
      )}
    </main>
  );
}
