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
import { SearchIcon, TicketIcon, MapIcon, LocationIcon, TrainIcon, GateIcon, AssistantIcon } from '../components/NavIcons';

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
      icon: <LocationIcon size={24} color="#0057B8" />,
      title: t.home.feature1Title,
      desc: t.home.feature1Desc,
      link: '/journey?autoGps=1',
    },
    {
      icon: <MapIcon size={24} color="#0057B8" />,
      title: t.home.feature2Title,
      desc: t.home.feature2Desc,
      link: '/map',
    },
    {
      icon: <TrainIcon size={24} color="#0057B8" />,
      title: t.home.feature3Title,
      desc: t.home.feature3Desc,
      link: '/journey',
    },
    {
      icon: <GateIcon size={24} color="#0057B8" />,
      title: t.home.feature4Title,
      desc: t.home.feature4Desc,
      link: '/journey',
    },
    {
      icon: <AssistantIcon size={24} color="#0057B8" />,
      title: t.home.feature5Title,
      desc: t.home.feature5Desc,
      link: '/assistant',
    },
    {
      icon: <TicketIcon size={24} color="#0057B8" />,
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
              <SearchIcon size={16} /> {t.home.planJourneyBtn}
            </Link>
            <Link href="/tickets" className="btn-ticket">
              <TicketIcon size={16} /> {language === 'en' ? 'Buy Metro Ticket' : 'मेट्रो टिकट खरीदें'}
            </Link>
            <Link href="/map" className="btn-secondary">
              <MapIcon size={16} /> {language === 'en' ? 'Explore Network Map' : 'मानचित्र देखें'}
            </Link>
          </div>
        </div>
      </section>

      {/* Main Journey Search Card */}
      <section
        className="card"
        style={{
          marginBottom: '28px',
          border: '1px solid var(--metro-card-border)',
          borderTop: '3px solid var(--metro-blue)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--metro-navy)', fontWeight: 700 }}>
              {language === 'en' ? 'Plan Route & Station Guidance' : 'मार्ग एवं स्टेशन मार्गदर्शन योजना'}
            </h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--metro-text-subtle)' }}>
              {language === 'en' ? 'Direct navigation across Delhi NCR, Noida Metro & connected networks' : 'दिल्ली एनसीआर, नोएडा मेट्रो एवं संबद्ध नेटवर्क में प्रत्यक्ष नेविगेशन'}
            </span>
          </div>

          {/* Network Filter Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--metro-navy)' }}>
              {language === 'en' ? 'Network:' : 'नेटवर्क:'}
            </span>
            <select
              value={selectedNetwork}
              onChange={(e) => setSelectedNetwork(e.target.value)}
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.82rem', borderRadius: '4px', border: '1px solid var(--metro-card-border)', background: '#FFFFFF', fontWeight: 600 }}
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '12px', alignItems: 'flex-end', margin: '18px 0' }}>
          <SearchableDropdown
            options={stationOptions}
            selectedId={sourceStation}
            onChange={setSourceStation}
            placeholder={t.routeDetails.sourceStation}
            searchPlaceholder="Search e.g. Noida Sector 51, Rajiv Chowk..."
            label={language === 'en' ? 'From Station (Origin)' : 'स्रोत स्टेशन (आरंभ)'}
          />

          <button
            type="button"
            onClick={handleSwap}
            title="Swap Stations"
            style={{
              height: '38px',
              width: '38px',
              borderRadius: '4px',
              border: '1px solid var(--metro-card-border)',
              background: '#F8FAFC',
              color: 'var(--metro-navy)',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '2px',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E2E8F0')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
          >
            &#8644;
          </button>

          <SearchableDropdown
            options={stationOptions}
            selectedId={destinationStation}
            onChange={setDestinationStation}
            placeholder={t.routeDetails.destinationStation}
            searchPlaceholder="Search e.g. Lajpat Nagar, Pari Chowk..."
            label={language === 'en' ? 'To Station (Destination)' : 'गंतव्य स्टेशन'}
          />
        </div>

        <div style={{ marginTop: '20px' }}>
          <button
            className="button"
            onClick={handleFindRoute}
            style={{
              width: '100%',
              padding: '13px 20px',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <SearchIcon size={18} /> {t.home.planJourneyBtn}
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
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--metro-navy)', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrainIcon size={18} color="var(--metro-blue)" /> Supported Metro Transit Networks
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {availableNetworks.map((net) => {
            const getNetworkColor = (name: string) => {
              if (name === 'Delhi Metro') return '#1D4ED8';
              if (name === 'Noida Metro') return '#0284C7';
              if (name === 'Mumbai Metro') return '#2563EB';
              if (name.includes('Bengaluru')) return '#7C3AED';
              if (name === 'Hyderabad Metro') return '#DC2626';
              if (name === 'Chennai Metro') return '#059669';
              return '#64748B';
            };

            const networkColor = getNetworkColor(net.name);

            return (
              <span
                key={net.name}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: `1px solid ${net.isAvailable ? '#CBD5E1' : '#E2E8F0'}`,
                  padding: '6px 14px',
                  borderRadius: '4px',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  color: net.isAvailable ? 'var(--metro-navy)' : '#94A3B8',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    borderRadius: '2px',
                    backgroundColor: networkColor,
                  }}
                />
                {net.name}
                {!net.isAvailable && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      padding: '1px 6px',
                      borderRadius: '3px',
                      backgroundColor: '#F1F5F9',
                      color: '#64748B',
                      fontWeight: 600,
                    }}
                  >
                    Phase 2
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
