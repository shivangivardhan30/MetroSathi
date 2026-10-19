import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from '../lib/translations';
import { useLanguage } from '../lib/languageContext';
import { useAuth } from '../lib/authContext';
import LoginForm from '../components/LoginForm';
import UserProfile from '../components/UserProfile';
import MetroSathiLogo from '../components/MetroSathiLogo';
import SearchableDropdown, { DropdownOption } from '../components/SearchableDropdown';
import LocationCard from '../components/LocationCard';
import { availableNetworks, getAllStations, MetroStation } from '../lib/metroData';

export default function Home() {
  const router = useRouter();
  const { language } = useLanguage();
  const { isLoggedIn } = useAuth();
  const t = useTranslation(language);

  const [allStationsList, setAllStationsList] = useState<MetroStation[]>([]);
  const [sourceStation, setSourceStation] = useState<string>('');
  const [destinationStation, setDestinationStation] = useState<string>('');
  const [selectedNetwork, setSelectedNetwork] = useState<string>('All');

  useEffect(() => {
    const stations = getAllStations();
    setAllStationsList(stations);
  }, []);

  const stationOptions: DropdownOption[] = allStationsList
    .filter((st) => selectedNetwork === 'All' || st.network === selectedNetwork)
    .map((station) => ({
      id: station.id,
      name: station.name,
      code: station.code,
      line: station.line,
      lineColor: station.lineColor,
      network: station.network,
      isInterchange: station.isInterchange,
      city: station.city,
    }));

  const handleSwap = () => {
    const temp = sourceStation;
    setSourceStation(destinationStation);
    setDestinationStation(temp);
  };

  const handleFindRoute = () => {
    if (!sourceStation || !destinationStation) {
      alert(language === 'en' ? 'Please select both source and destination stations' : 'कृपया दोनों स्रोत और गंतव्य स्टेशन चुनें');
      return;
    }
    router.push(`/journey?src=${encodeURIComponent(sourceStation)}&dest=${encodeURIComponent(destinationStation)}`);
  };

  const handleLocationStationSelected = (stationId: string) => {
    setSourceStation(stationId);
  };

  const featureCards = [
    {
      icon: '📍',
      title: t.home.feature1Title,
      desc: t.home.feature1Desc,
      link: '/journey?autoGps=1',
    },
    {
      icon: '🗺️',
      title: t.home.feature2Title,
      desc: t.home.feature2Desc,
      link: '/map',
    },
    {
      icon: '🚇',
      title: t.home.feature3Title,
      desc: t.home.feature3Desc,
      link: '/journey',
    },
    {
      icon: '🚪',
      title: t.home.feature4Title,
      desc: t.home.feature4Desc,
      link: '/journey',
    },
    {
      icon: '🤖',
      title: t.home.feature5Title,
      desc: t.home.feature5Desc,
      link: '/assistant',
    },
    {
      icon: '🎫',
      title: language === 'en' ? 'Digital Ticket Booking' : 'डिजिटल टिकट बुकिंग',
      desc: language === 'en' ? 'Book metro tickets instantly with dynamic QR codes.' : 'गतिशील क्यूआर कोड के साथ तुरंत मेट्रो टिकट बुक करें।',
      link: '/tickets',
    },
  ];

  return (
    <main className="container">
      {/* Hero Section */}
      <section className="hero">
        <div style={{ maxWidth: '720px' }}>
          <div style={{ marginBottom: '20px' }}>
            <MetroSathiLogo size="xl" />
          </div>
          <h1>{t.home.title}</h1>
          <p className="description">
            {t.home.subtitle}
          </p>

          <div className="hero-cta-group" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/journey" className="button">
              <span>🔍</span> {t.home.planJourneyBtn}
            </Link>
            <Link
              href="/tickets"
              className="button"
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                borderColor: '#059669',
              }}
            >
              <span>🎫</span> {language === 'en' ? 'Buy Metro Ticket' : 'मेट्रो टिकट खरीदें'}
            </Link>
            <Link href="/map" className="btn-secondary">
              <span>🗺️</span> {language === 'en' ? 'Explore Metro Maps' : 'मानचित्र देखें'}
            </Link>
          </div>
        </div>
      </section>

      {/* Main Journey Search Card */}
      <section
        className="card"
        style={{
          marginBottom: '32px',
          border: '2px solid rgba(0, 87, 184, 0.25)',
          boxShadow: '0 8px 24px rgba(11, 31, 58, 0.08)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.35rem', color: 'var(--metro-navy)', fontWeight: 800 }}>
              {language === 'en' ? 'Where are you going?' : 'आप कहाँ जा रहे हैं?'}
            </h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--metro-text-subtle)' }}>
              {language === 'en' ? 'Select stations across Delhi NCR, Noida Metro & supported lines' : 'दिल्ली एनसीआर, नोएडा मेट्रो और समर्थित लाइनों में स्टेशन चुनें'}
            </span>
          </div>

          {/* Network Filter Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--metro-navy)' }}>
              {language === 'en' ? 'Network:' : 'नेटवर्क:'}
            </span>
            <select
              value={selectedNetwork}
              onChange={(e) => setSelectedNetwork(e.target.value)}
              style={{ padding: '6px 12px', fontSize: '0.82rem', borderRadius: '8px', border: '1px solid var(--metro-card-border)', background: '#FFFFFF', fontWeight: 700 }}
            >
              <option value="All">{language === 'en' ? 'All Networks' : 'सभी नेटवर्क'}</option>
              <option value="Delhi Metro">Delhi Metro (DMRC)</option>
              <option value="Noida Metro">Noida Metro (NMRC)</option>
            </select>
          </div>
        </div>

        {/* GPS Location Finder Card */}
        <LocationCard onStationSelected={handleLocationStationSelected} />

        {/* Inputs & Swap Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '12px', alignItems: 'flex-end', margin: '20px 0' }}>
          <SearchableDropdown
            options={stationOptions}
            selectedId={sourceStation}
            onChange={setSourceStation}
            placeholder={t.routeDetails.sourceStation}
            searchPlaceholder="Search e.g. Noida Sector 51, Rajiv Chowk..."
            label={language === 'en' ? '🚉 From Station' : '🚉 से (स्रोत स्टेशन)'}
          />

          <button
            type="button"
            onClick={handleSwap}
            title="Swap Stations"
            style={{
              height: '42px',
              width: '42px',
              borderRadius: '50%',
              border: '1.5px solid var(--metro-blue)',
              background: '#FFFFFF',
              color: 'var(--metro-blue)',
              fontSize: '1.2rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '2px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--metro-blue)', e.currentTarget.style.color = '#FFFFFF')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF', e.currentTarget.style.color = 'var(--metro-blue)')}
          >
            ⇄
          </button>

          <SearchableDropdown
            options={stationOptions}
            selectedId={destinationStation}
            onChange={setDestinationStation}
            placeholder={t.routeDetails.destinationStation}
            searchPlaceholder="Search e.g. Lajpat Nagar, Pari Chowk..."
            label={language === 'en' ? '🎯 To Station' : '🎯 तक (गंतव्य स्टेशन)'}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <button
            className="button"
            onClick={handleFindRoute}
            style={{ width: '100%', padding: '14px', fontSize: '1.05rem', fontWeight: 800 }}
          >
            🔍 {t.home.planJourneyBtn}
          </button>
          <button
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
              padding: '14px',
              fontSize: '1.05rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
              borderColor: '#059669',
            }}
          >
            🎫 {language === 'en' ? 'Buy Metro Ticket' : 'मेट्रो टिकट खरीदें'}
          </button>
        </div>
      </section>

      {/* Feature Grid */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--metro-navy)', margin: '0 0 16px' }}>
          {t.home.featuresTitle}
        </h2>

        <div className="feature-grid">
          {featureCards.map((card, idx) => (
            <Link key={idx} href={card.link} style={{ textDecoration: 'none' }}>
              <div className="feature-card">
                <div className="feature-icon-wrapper">{card.icon}</div>
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Metro Networks Section */}
      <section className="card" style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--metro-navy)', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🚆</span> Supported Metro Networks Across India
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {availableNetworks.map((net) => {
            const getNetworkColor = (name: string) => {
              if (name === 'Delhi Metro') return '#0057B8';
              if (name === 'Noida Metro') return '#00A8E8';
              if (name === 'Mumbai Metro') return '#0066CC';
              if (name.includes('Bengaluru')) return '#800080';
              if (name === 'Hyderabad Metro') return '#DC241F';
              if (name === 'Chennai Metro') return '#00AA00';
              return '#64748B';
            };

            const networkColor = getNetworkColor(net.name);

            return (
              <span
                key={net.name}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: `1px solid ${net.isAvailable ? networkColor : '#CBD5E1'}`,
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  color: net.isAvailable ? 'var(--metro-navy)' : '#94A3B8',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: networkColor,
                  }}
                />
                {net.name}
                {!net.isAvailable && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      padding: '1px 6px',
                      borderRadius: '8px',
                      backgroundColor: '#FEF3C7',
                      color: '#92400E',
                      fontWeight: 800,
                    }}
                  >
                    Coming Soon
                  </span>
                )}
              </span>
            );
          })}
        </div>
      </section>

      {/* Authentication / User Profile */}
      <section>
        {isLoggedIn ? (
          <UserProfile language={language} />
        ) : (
          <LoginForm language={language} onLoginSuccess={() => {}} />
        )}
      </section>
    </main>
  );
}
