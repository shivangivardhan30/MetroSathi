import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useLanguage } from '../lib/languageContext';
import { useTranslation } from '../lib/translations';
import { useAuth, BookedTicket } from '../lib/authContext';
import SearchableDropdown, { DropdownOption } from '../components/SearchableDropdown';
import TicketBooking from '../components/TicketBooking';
import { getAllStations, getStationById, MetroStation } from '../lib/metroData';
import { calculateRoute, MetroRoute } from '../lib/routeCalculator';
import MetroSathiLogo from '../components/MetroSathiLogo';
import { TicketIcon } from '../components/NavIcons';

export default function TicketsPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { user, isLoggedIn } = useAuth();
  const t = useTranslation(language);

  const [allStationsList, setAllStationsList] = useState<MetroStation[]>([]);
  const [sourceStation, setSourceStation] = useState<string>('');
  const [destinationStation, setDestinationStation] = useState<string>('');
  const [selectedNetwork, setSelectedNetwork] = useState<string>('All');
  const [passengers, setPassengers] = useState<number>(1);
  const [ticketType, setTicketType] = useState<'single' | 'group'>('single');
  const [route, setRoute] = useState<MetroRoute | null>(null);
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'book' | 'history'>('book');
  const [viewingTicket, setViewingTicket] = useState<BookedTicket | null>(null);

  useEffect(() => {
    const stations = getAllStations();
    setAllStationsList(stations);
  }, []);

  // Pre-fill from query params if passed
  useEffect(() => {
    if (router.isReady) {
      if (router.query.src && typeof router.query.src === 'string') {
        setSourceStation(router.query.src);
      }
      if (router.query.dest && typeof router.query.dest === 'string') {
        setDestinationStation(router.query.dest);
      }
      if (router.query.pax && typeof router.query.pax === 'string') {
        const p = parseInt(router.query.pax, 10);
        if (p >= 1 && p <= 6) setPassengers(p);
      }
      if (router.query.tab === 'history') {
        setActiveTab('history');
      }
    }
  }, [router.isReady, router.query]);

  // Recalculate route whenever source or destination changes
  useEffect(() => {
    if (sourceStation && destinationStation && sourceStation !== destinationStation) {
      const calculated = calculateRoute('delhi', sourceStation, destinationStation);
      setRoute(calculated);
    } else {
      setRoute(null);
    }
  }, [sourceStation, destinationStation]);

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

  const sourceObj = getStationById(sourceStation);
  const destObj = getStationById(destinationStation);

  const unitFare = route ? route.totalFare : 30;
  const totalAmount = unitFare * passengers;

  const handleBookNow = () => {
    if (!sourceStation || !destinationStation) {
      alert(language === 'en' ? 'Please select both source and destination stations.' : 'कृपया स्रोत और गंतव्य दोनों स्टेशन चुनें।');
      return;
    }
    if (sourceStation === destinationStation) {
      alert(language === 'en' ? 'Source and destination cannot be the same station.' : 'स्रोत और गंतव्य समान नहीं हो सकते।');
      return;
    }
    setShowBookingModal(true);
  };

  const bookedTickets = user?.bookedTickets || [];

  return (
    <>
      <Head>
        <title>{language === 'en' ? 'Buy Metro Tickets | MetroSathi' : 'मेट्रो टिकट खरीदें | MetroSathi'}</title>
        <meta
          name="description"
          content="Book digital metro QR tickets online across Delhi NCR and Noida networks with MetroSathi."
        />
      </Head>

      <main className="container" style={{ paddingBottom: '60px' }}>
        {/* Page Header */}
        <div style={{ margin: '20px 0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', background: '#F1F5F9', color: '#334155', borderRadius: '4px', fontSize: '0.74rem', fontWeight: 600, marginBottom: '6px', border: '1px solid #CBD5E1' }}>
              <TicketIcon size={14} color="#334155" />
              <span>{language === 'en' ? 'TRANSIT FARE & TICKETING PORTAL' : 'पारगमन किराया एवं टिकटिंग पोर्टल'}</span>
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 700, color: 'var(--metro-navy)', margin: 0 }}>
              {language === 'en' ? 'Purchase Metro QR Ticket' : 'मेट्रो टिकट खरीदें'}
            </h1>
            <p style={{ color: 'var(--metro-text-muted)', fontSize: '0.9rem', marginTop: '4px', maxWidth: '640px' }}>
              {language === 'en'
                ? 'Issue single or group electronic QR transit passes for Delhi Metro (DMRC) and connected lines.'
                : 'दिल्ली मेट्रो (DMRC) और संबद्ध लाइनों के लिए एकल या समूह डिजिटल क्यूआर पास प्राप्त करें।'}
            </p>
          </div>

          {/* Prototype Badge */}
          <div className="demo-notice-badge" style={{ alignSelf: 'flex-start' }}>
            {language === 'en' ? 'Transit Gateway Simulation' : 'सिमुलेटेड टिकटिंग पोर्टल'}
          </div>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--metro-card-border)', paddingBottom: '10px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('book')}
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              border: 'none',
              background: activeTab === 'book' ? 'var(--metro-blue)' : '#FFFFFF',
              color: activeTab === 'book' ? '#FFFFFF' : 'var(--metro-navy)',
              borderBottom: activeTab === 'book' ? '2px solid #1E40AF' : '1px solid #CBD5E1',
              transition: 'all 0.15s ease',
            }}
          >
            {language === 'en' ? 'Book New Ticket' : 'नया टिकट बुक करें'}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              border: 'none',
              background: activeTab === 'history' ? 'var(--metro-blue)' : '#FFFFFF',
              color: activeTab === 'history' ? '#FFFFFF' : 'var(--metro-navy)',
              borderBottom: activeTab === 'history' ? '2px solid #1E40AF' : '1px solid #CBD5E1',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s ease',
            }}
          >
            {language === 'en' ? 'My Booked Tickets' : 'मेरे बुक किए गए टिकट'}
            {bookedTickets.length > 0 && (
              <span
                style={{
                  background: activeTab === 'history' ? '#FFFFFF' : '#1E293B',
                  color: activeTab === 'history' ? 'var(--metro-blue)' : '#FFFFFF',
                  borderRadius: '3px',
                  padding: '1px 6px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                }}
              >
                {bookedTickets.length}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: BOOK NEW TICKET */}
        {activeTab === 'book' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '20px', alignItems: 'start' }}>
            {/* Left: Journey & Station Config Card */}
            <div
              className="card"
              style={{
                border: '1px solid var(--metro-card-border)',
                borderTop: '3px solid var(--metro-blue)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--metro-navy)', fontWeight: 700 }}>
                  {language === 'en' ? 'Select Route & Passengers' : 'मार्ग और यात्री चुनें'}
                </h2>

                {/* Network Filter */}
                <select
                  value={selectedNetwork}
                  onChange={(e) => setSelectedNetwork(e.target.value)}
                  style={{
                    width: 'auto',
                    padding: '5px 10px',
                    fontSize: '0.8rem',
                    borderRadius: '4px',
                    border: '1px solid var(--metro-card-border)',
                    background: '#FFFFFF',
                    fontWeight: 600,
                  }}
                >
                  <option value="All">{language === 'en' ? 'All Networks' : 'सभी नेटवर्क'}</option>
                  <option value="Delhi Metro">Delhi Metro (DMRC)</option>
                  <option value="Noida Metro">Noida Metro (NMRC)</option>
                </select>
              </div>

              {/* Station Selectors Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '10px', alignItems: 'flex-end', marginBottom: '18px' }}>
                <SearchableDropdown
                  options={stationOptions}
                  selectedId={sourceStation}
                  onChange={setSourceStation}
                  placeholder={t.routeDetails.sourceStation}
                  searchPlaceholder="Search origin station..."
                  label={language === 'en' ? 'Origin Station' : 'स्रोत स्टेशन'}
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
                  searchPlaceholder="Search destination..."
                  label={language === 'en' ? 'Destination Station' : 'गंतव्य स्टेशन'}
                />
              </div>

              {/* Ticket Type Options */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--metro-navy)', marginBottom: '6px' }}>
                  {language === 'en' ? 'Ticket Type' : 'टिकट का प्रकार'}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setTicketType('single');
                      if (passengers > 1) setPassengers(1);
                    }}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '4px',
                      border: `1.5px solid ${ticketType === 'single' ? 'var(--metro-blue)' : 'var(--metro-card-border)'}`,
                      background: ticketType === 'single' ? '#F0F9FF' : '#FFFFFF',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: ticketType === 'single' ? 'var(--metro-blue)' : 'var(--metro-navy)', fontSize: '0.86rem' }}>
                      {t.booking.singleJourney}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--metro-text-subtle)', marginTop: '2px' }}>
                      {language === 'en' ? 'Digital QR pass for 1 passenger' : '1 यात्री के लिए डिजिटल पास'}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTicketType('group');
                      if (passengers === 1) setPassengers(2);
                    }}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '4px',
                      border: `1.5px solid ${ticketType === 'group' ? 'var(--metro-blue)' : 'var(--metro-card-border)'}`,
                      background: ticketType === 'group' ? '#F0F9FF' : '#FFFFFF',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: ticketType === 'group' ? 'var(--metro-blue)' : 'var(--metro-navy)', fontSize: '0.86rem' }}>
                      {t.booking.groupJourney}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--metro-text-subtle)', marginTop: '2px' }}>
                      {language === 'en' ? 'Unified QR ticket for 2 to 6 passengers' : '2 से 6 यात्रियों के लिए संयुक्त टिकट'}
                    </div>
                  </button>
                </div>
              </div>

              {/* Passengers Count Selector */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--metro-navy)', marginBottom: '6px' }}>
                  {t.booking.passengers}
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  {[1, 2, 3, 4, 5, 6].map((num) => {
                    const isSelected = passengers === num;
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => {
                          setPassengers(num);
                          if (num > 1) setTicketType('group');
                          else setTicketType('single');
                        }}
                        style={{
                          flex: 1,
                          minWidth: '40px',
                          padding: '8px 0',
                          textAlign: 'center',
                          borderRadius: '4px',
                          border: `1.5px solid ${isSelected ? 'var(--metro-blue)' : 'var(--metro-card-border)'}`,
                          background: isSelected ? 'var(--metro-blue)' : '#FFFFFF',
                          color: isSelected ? '#FFFFFF' : 'var(--metro-navy)',
                          fontWeight: 600,
                          fontSize: '0.88rem',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {num} Pax
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Proceed CTA Button */}
              <button
                type="button"
                className="btn-ticket"
                onClick={handleBookNow}
                disabled={!sourceStation || !destinationStation}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '0.95rem',
                  opacity: (!sourceStation || !destinationStation) ? 0.6 : 1,
                  cursor: (!sourceStation || !destinationStation) ? 'not-allowed' : 'pointer',
                }}
              >
                <TicketIcon size={16} /> {language === 'en' ? `Proceed to Issue Ticket • ₹${totalAmount}` : `टिकट जारी करने के लिए आगे बढ़ें • ₹${totalAmount}`}
              </button>
            </div>

            {/* Right: Live Fare & Route Summary Card */}
            <div>
              <div
                className="card"
                style={{
                  border: '1px solid var(--metro-card-border)',
                  borderTop: '3px solid var(--metro-blue)',
                  background: '#FFFFFF',
                  position: 'sticky',
                  top: '90px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--metro-card-border)', paddingBottom: '10px', marginBottom: '14px' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--metro-navy)', fontWeight: 700 }}>
                    {language === 'en' ? 'Fare & Route Estimate' : 'किराया और मार्ग अनुमान'}
                  </h3>
                  <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: '#F1F5F9', color: '#334155', fontWeight: 600 }}>
                    Official Schedule
                  </span>
                </div>

                {/* Station Journey Path */}
                {sourceObj && destObj ? (
                  <div style={{ background: 'var(--metro-light-bg)', padding: '14px', borderRadius: '10px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#E53935', display: 'inline-block' }} />
                      <strong style={{ fontSize: '0.9rem', color: 'var(--metro-navy)' }}>{sourceObj.name}</strong>
                      <span className="metro-line-badge" style={{ backgroundColor: sourceObj.lineColor || 'var(--metro-blue)', fontSize: '0.68rem', padding: '1px 6px' }}>
                        {sourceObj.line}
                      </span>
                    </div>

                    <div style={{ borderLeft: '2px dashed #94A3B8', marginLeft: '4px', paddingLeft: '14px', margin: '4px 0', fontSize: '0.78rem', color: 'var(--metro-text-subtle)' }}>
                      {route ? (
                        <>
                          {route.totalStops} {language === 'en' ? 'stops' : 'स्टॉप'} • {route.interchanges} {language === 'en' ? 'interchange(s)' : 'इंटरचेंज'} • ~{route.estimatedTime} mins
                        </>
                      ) : (
                        language === 'en' ? 'Direct or connecting path' : 'सीधा या कनेक्टिंग मार्ग'
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                      <strong style={{ fontSize: '0.9rem', color: 'var(--metro-navy)' }}>{destObj.name}</strong>
                      <span className="metro-line-badge" style={{ backgroundColor: destObj.lineColor || 'var(--metro-blue)', fontSize: '0.68rem', padding: '1px 6px' }}>
                        {destObj.line}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '16px', background: 'var(--metro-light-bg)', borderRadius: '10px', color: 'var(--metro-text-subtle)', fontSize: '0.85rem', marginBottom: '16px', textAlign: 'center' }}>
                    {language === 'en'
                      ? 'Select origin and destination stations to preview route and exact fare.'
                      : 'मार्ग और सटीक किराया देखने के लिए स्टेशन चुनें।'}
                  </div>
                )}

                {/* Price Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem', borderBottom: '1px solid var(--metro-card-border)', paddingBottom: '14px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--metro-text-muted)' }}>
                    <span>{t.booking.baseFare}</span>
                    <strong style={{ color: 'var(--metro-navy)' }}>₹{unitFare}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--metro-text-muted)' }}>
                    <span>{t.booking.passengers}</span>
                    <strong style={{ color: 'var(--metro-navy)' }}>× {passengers}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--metro-text-muted)' }}>
                    <span>{t.booking.ticketType}</span>
                    <span style={{ fontWeight: 700, color: 'var(--metro-blue)' }}>
                      {ticketType === 'single' ? t.booking.singleJourney : t.booking.groupJourney}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--metro-navy)' }}>
                    {t.booking.totalAmount}
                  </span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#047857' }}>
                    ₹{totalAmount}
                  </span>
                </div>

                {/* Features checklist */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem', color: 'var(--metro-text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: '#047857', fontWeight: 700 }}>•</span>
                    <span>{language === 'en' ? 'Valid for 180 mins from entry gate' : 'प्रवेश द्वार से 180 मिनट के लिए वैध'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: '#047857', fontWeight: 700 }}>•</span>
                    <span>{language === 'en' ? 'Simulated UPI & Card payment options' : 'सिमुलेटेड यूपीआई और कार्ड भुगतान'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: '#047857', fontWeight: 700 }}>•</span>
                    <span>{language === 'en' ? 'Instant SVG QR generation & receipt download' : 'त्वरित क्यूआर कोड और रसीद डाउनलोड'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MY BOOKED TICKETS (HISTORY) */}
        {activeTab === 'history' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--metro-navy)', fontWeight: 700 }}>
                  {t.profile.myTickets}
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--metro-text-subtle)' }}>
                  {language === 'en'
                    ? 'All digital tickets booked during this session are stored locally.'
                    : 'इस सत्र के दौरान बुक किए गए सभी डिजिटल टिकट स्थानीय रूप से सहेजे गए हैं।'}
                </p>
              </div>

              {bookedTickets.length > 0 && (
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setActiveTab('book')}
                  style={{ fontSize: '0.82rem', padding: '6px 14px' }}
                >
                  {language === 'en' ? '+ Book Another Ticket' : '+ एक और टिकट बुक करें'}
                </button>
              )}
            </div>

            {bookedTickets.length === 0 ? (
              <div
                className="card"
                style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  border: '1px dashed var(--metro-card-border)',
                  background: '#FFFFFF',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                  <TicketIcon size={36} color="#64748B" />
                </div>
                <h3 style={{ margin: '0 0 6px', fontSize: '1.1rem', color: 'var(--metro-navy)', fontWeight: 700 }}>
                  {t.profile.noTickets}
                </h3>
                <p style={{ color: 'var(--metro-text-subtle)', fontSize: '0.88rem', maxWidth: '440px', margin: '0 auto 18px' }}>
                  {language === 'en'
                    ? 'You have not booked any metro tickets yet. Select your origin and destination to generate your first ticket pass!'
                    : 'आपने अभी तक कोई मेट्रो टिकट बुक नहीं किया है। अपना पहला टिकट बनाने के लिए ऊपर अपना मार्ग चुनें!'}
                </p>
                <button
                  type="button"
                  className="btn-ticket"
                  onClick={() => setActiveTab('book')}
                  style={{ padding: '10px 20px', fontSize: '0.9rem' }}
                >
                  <TicketIcon size={16} /> {language === 'en' ? 'Book Metro Ticket Now' : 'अभी मेट्रो टिकट बुक करें'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
                {bookedTickets.map((tkt) => {
                  const dateStr = new Date(tkt.timestamp).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={tkt.id}
                      className="card"
                      style={{
                        border: '1px solid var(--metro-card-border)',
                        borderTop: '3px solid var(--metro-blue)',
                        borderRadius: '6px',
                        background: '#FFFFFF',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        {/* Header Row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#0F172A', background: '#F1F5F9', padding: '2px 8px', borderRadius: '4px' }}>
                            {tkt.ticketType || 'Single Journey'}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--metro-text-subtle)', fontWeight: 500 }}>
                            {dateStr}
                          </span>
                        </div>

                        {/* Route Title */}
                        <h4 style={{ margin: '0 0 4px', fontSize: '1rem', color: 'var(--metro-navy)', fontWeight: 700 }}>
                          {tkt.sourceStationName} ➔ {tkt.destinationStationName}
                        </h4>

                        {/* Ticket ID */}
                        <div style={{ fontSize: '0.74rem', color: 'var(--metro-text-subtle)', fontFamily: 'monospace', marginBottom: '12px' }}>
                          {tkt.id}
                        </div>

                        {/* Details */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '8px 12px', borderRadius: '4px', marginBottom: '12px', border: '1px solid var(--metro-card-border)' }}>
                          <div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--metro-text-subtle)', display: 'block' }}>
                              {language === 'en' ? 'PASSENGERS' : 'यात्री'}
                            </span>
                            <strong style={{ fontSize: '0.88rem', color: 'var(--metro-navy)' }}>
                              {tkt.passengers} Pax
                            </strong>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--metro-text-subtle)', display: 'block' }}>
                              {language === 'en' ? 'FARE PAID' : 'किराया'}
                            </span>
                            <strong style={{ fontSize: '1rem', color: '#047857', fontWeight: 700 }}>
                              ₹{tkt.fare}
                            </strong>
                          </div>
                        </div>
                      </div>

                      {/* Card Action */}
                      <button
                        type="button"
                        className="btn-outline"
                        onClick={() => setViewingTicket(tkt)}
                        style={{
                          width: '100%',
                          fontSize: '0.84rem',
                          padding: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        <TicketIcon size={14} /> {language === 'en' ? 'View QR Ticket Pass' : 'क्यूआर पास देखें'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Modal: Live Ticket Booking Flow */}
        {showBookingModal && (
          <TicketBooking
            sourceCity="Delhi NCR"
            sourceStationName={sourceObj ? sourceObj.name : sourceStation}
            destinationStationName={destObj ? destObj.name : destinationStation}
            sourceNetwork={sourceObj?.network || 'Delhi Metro'}
            destNetwork={destObj?.network || 'Delhi Metro'}
            sourceLine={sourceObj?.line || 'Metro'}
            destLine={destObj?.line || 'Metro'}
            interchanges={route ? route.interchanges : 0}
            estimatedTime={route ? route.estimatedTime : 30}
            fare={unitFare}
            onClose={() => {
              setShowBookingModal(false);
              // Switch to history tab if user wants to see their new ticket
              setActiveTab('history');
            }}
            language={language}
          />
        )}

        {/* Modal: View Existing QR Pass */}
        {viewingTicket && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(11, 31, 58, 0.75)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '16px',
            }}
            onClick={() => setViewingTicket(null)}
          >
            <div
              className="card"
              style={{
                width: '100%',
                maxWidth: '420px',
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
                position: 'relative',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <MetroSathiLogo size="sm" />
                <button
                  type="button"
                  onClick={() => setViewingTicket(null)}
                  style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--metro-text-subtle)' }}
                >
                  ✕
                </button>
              </div>

              {/* QR Code Pass Box */}
              <div
                style={{
                  background: 'var(--metro-light-bg)',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                  border: '1.5px solid var(--metro-card-border)',
                  marginBottom: '16px',
                }}
              >
                <span style={{ fontSize: '0.72rem', background: '#DCFCE7', color: '#166534', padding: '3px 8px', borderRadius: '4px', fontWeight: 800, textTransform: 'uppercase' }}>
                  ACTIVE DIGITAL TRANSIT PASS
                </span>

                {/* SVG QR Code Simulation */}
                <div style={{ margin: '16px auto', width: '160px', height: '160px', background: '#FFFFFF', padding: '10px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <svg width="140" height="140" viewBox="0 0 120 120">
                    <rect width="120" height="120" fill="#FFFFFF" />
                    {/* Corner Finders */}
                    <rect x="10" y="10" width="30" height="30" fill="none" stroke="#0B1F3A" strokeWidth="6" />
                    <rect x="18" y="18" width="14" height="14" fill="#0B1F3A" />
                    <rect x="80" y="10" width="30" height="30" fill="none" stroke="#0B1F3A" strokeWidth="6" />
                    <rect x="88" y="18" width="14" height="14" fill="#0B1F3A" />
                    <rect x="10" y="80" width="30" height="30" fill="none" stroke="#0B1F3A" strokeWidth="6" />
                    <rect x="18" y="88" width="14" height="14" fill="#0B1F3A" />
                    {/* Simulated Pattern Blocks */}
                    <rect x="48" y="15" width="8" height="8" fill="#0B1F3A" />
                    <rect x="62" y="22" width="8" height="8" fill="#0B1F3A" />
                    <rect x="48" y="36" width="8" height="8" fill="#0B1F3A" />
                    <rect x="36" y="52" width="8" height="8" fill="#0B1F3A" />
                    <rect x="52" y="52" width="16" height="16" fill="#0057B8" />
                    <rect x="76" y="52" width="8" height="8" fill="#0B1F3A" />
                    <rect x="48" y="76" width="8" height="8" fill="#0B1F3A" />
                    <rect x="62" y="86" width="8" height="8" fill="#0B1F3A" />
                    <rect x="86" y="76" width="16" height="8" fill="#0B1F3A" />
                    <rect x="76" y="94" width="8" height="16" fill="#0B1F3A" />
                  </svg>
                </div>

                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--metro-navy)', fontFamily: 'monospace' }}>
                  {viewingTicket.id}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--metro-text-subtle)', marginTop: '4px' }}>
                  {t.booking.qrDescription}
                </div>
              </div>

              {/* Details table */}
              <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--metro-text-subtle)' }}>{language === 'en' ? 'Journey:' : 'मार्ग:'}</span>
                  <strong style={{ color: 'var(--metro-navy)' }}>{viewingTicket.sourceStationName} ➔ {viewingTicket.destinationStationName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--metro-text-subtle)' }}>{language === 'en' ? 'Passengers:' : 'यात्री:'}</span>
                  <strong style={{ color: 'var(--metro-navy)' }}>{viewingTicket.passengers} Pax</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--metro-text-subtle)' }}>{language === 'en' ? 'Fare Paid:' : 'किराया:'}</span>
                  <strong style={{ color: 'var(--metro-green)', fontSize: '1rem' }}>₹{viewingTicket.fare}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => window.print()}
                  style={{ flex: 1, padding: '10px', fontSize: '0.88rem' }}
                >
                  {t.booking.printBtn}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setViewingTicket(null)}
                  style={{ flex: 1, padding: '10px', fontSize: '0.88rem', backgroundColor: 'var(--metro-navy)', color: '#FFFFFF' }}
                >
                  {t.booking.closeBtn}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
