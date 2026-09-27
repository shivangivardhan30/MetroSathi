import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/authContext';
import { useTranslation } from '../lib/translations';
import MetroSathiLogo from './MetroSathiLogo';

interface TicketBookingProps {
  sourceCity: string;
  sourceStationName: string;
  destinationStationName: string;
  sourceNetwork?: string;
  destNetwork?: string;
  sourceLine?: string;
  destLine?: string;
  interchanges?: number;
  estimatedTime?: number;
  fare: number;
  onClose: () => void;
  language: 'en' | 'hi';
}

export default function TicketBooking({
  sourceCity,
  sourceStationName,
  destinationStationName,
  sourceNetwork = 'Metro Network',
  destNetwork = 'Metro Network',
  sourceLine = 'Metro Line',
  destLine = 'Metro Line',
  interchanges = 0,
  estimatedTime = 0,
  fare,
  onClose,
  language,
}: TicketBookingProps) {
  const { bookTicket } = useAuth();
  const t = useTranslation(language);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [ticketType, setTicketType] = useState<'single' | 'group'>('single');
  const [passengers, setPassengers] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [cardNo, setCardNo] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [qrSvgPath, setQrSvgPath] = useState('');

  // Single source of truth for total fare
  const totalFare = fare * passengers;

  // Generate dynamic QR Code path & ticket ID when moving to Step 3
  useEffect(() => {
    if (step === 3) {
      const id = `MS-TKT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
      setTicketId(id);
      
      const now = new Date();
      setBookingTime(
        now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
        ', ' +
        now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
      );

      // Generate deterministic QR Code pattern matrix
      const size = 16;
      let path = '';
      const seed = id + sourceStationName + destinationStationName;
      let charIdx = 0;

      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const isFinder =
            (r < 4 && c < 4) ||
            (r < 4 && c >= size - 4) ||
            (r >= size - 4 && c < 4);

          if (isFinder) {
            const isBorder =
              r === 0 || r === 3 || c === 0 || c === 3 ||
              r === size - 4 || r === size - 1 || c === size - 4 || c === size - 1;
            const isCenter =
              (r === 1 && c === 1) ||
              (r === 1 && c === size - 3) ||
              (r === size - 3 && c === 1);
            if (isBorder || isCenter) {
              path += ` M ${c * 7.5} ${r * 7.5} h 5.5 v 5.5 h -5.5 z`;
            }
          } else {
            const charCode = seed.charCodeAt(charIdx % seed.length);
            charIdx++;
            if ((charCode + r + c) % 3 === 0) {
              path += ` M ${c * 7.5} ${r * 7.5} h 5.5 v 5.5 h -5.5 z`;
            }
          }
        }
      }
      setQrSvgPath(path);
    }
  }, [step, sourceStationName, destinationStationName]);

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);

      bookTicket({
        sourceCity,
        sourceStationName,
        destinationStationName,
        fare: totalFare,
        passengers,
        ticketType: ticketType === 'single' ? 'Single Journey (QR)' : 'Group Journey',
        qrCodeData: `METROSATHI|${ticketId}|${sourceStationName}|${destinationStationName}|PAX:${passengers}|INR:${totalFare}|${Date.now()}`,
      });

      setStep(3);
    }, 1200);
  };

  const handleDownloadTicket = () => {
    const ticketElement = document.getElementById('digital-metro-ticket');
    if (ticketElement) {
      window.print();
    } else {
      alert(language === 'en' ? 'Downloaded simulated QR Metro Ticket!' : 'सिमुलेटेड क्यूआर मेट्रो टिकट डाउनलोड किया गया!');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(11, 31, 58, 0.8)',
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
          maxWidth: '520px',
          maxHeight: '92vh',
          overflowY: 'auto',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          boxShadow: '0 24px 48px rgba(11, 31, 58, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px',
          border: '2px solid var(--metro-blue)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--metro-card-border)',
            paddingBottom: '14px',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MetroSathiLogo size="sm" variant="icon-only" />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--metro-navy)', fontWeight: 800 }}>
                {step === 3 ? (language === 'en' ? 'Digital Metro Ticket' : 'डिजिटल मेट्रो टिकट') : t.booking.bookingTitle}
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: 700 }}>
                {t.booking.demoNotice}
              </span>
            </div>
          </div>
          {step !== 3 && (
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '1.4rem',
                cursor: 'pointer',
                color: 'var(--metro-text-subtle)',
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* STEP 1: Ticket Details & Passenger Selection */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Journey Details Summary Card */}
            <div
              style={{
                background: 'var(--metro-light-bg)',
                padding: '16px',
                borderRadius: '14px',
                border: '1px solid var(--metro-card-border)',
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--metro-blue)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                📍 {t.booking.journeySummary}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--metro-text-muted)', display: 'block' }}>FROM</span>
                  <span style={{ fontWeight: 800, color: 'var(--metro-navy)', fontSize: '1rem' }}>{sourceStationName}</span>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--metro-blue)', fontWeight: 600 }}>{sourceNetwork}</span>
                </div>
                <div style={{ fontSize: '1.2rem', color: 'var(--metro-blue)', fontWeight: 800, padding: '0 8px' }}>➔</div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--metro-text-muted)', display: 'block' }}>TO</span>
                  <span style={{ fontWeight: 800, color: 'var(--metro-navy)', fontSize: '1rem' }}>{destinationStationName}</span>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--metro-blue)', fontWeight: 600 }}>{destNetwork}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', paddingTop: '10px', borderTop: '1px dashed var(--metro-card-border)', fontSize: '0.8rem' }}>
                <div>
                  <span style={{ color: 'var(--metro-text-subtle)', display: 'block' }}>Interchanges:</span>
                  <strong style={{ color: 'var(--metro-navy)' }}>{interchanges}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--metro-text-subtle)', display: 'block' }}>Est. Time:</span>
                  <strong style={{ color: 'var(--metro-navy)' }}>~{estimatedTime} mins</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--metro-text-subtle)', display: 'block' }}>Base Fare:</span>
                  <strong style={{ color: 'var(--metro-green)' }}>₹ {fare}</strong>
                </div>
              </div>
            </div>

            {/* Ticket Type */}
            <div>
              <label style={{ marginBottom: '8px', display: 'block', fontSize: '0.88rem', fontWeight: 800, color: 'var(--metro-navy)' }}>
                {t.booking.ticketType}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setTicketType('single');
                    setPassengers(1);
                  }}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: '2px solid var(--metro-blue)',
                    background: ticketType === 'single' ? 'var(--metro-blue)' : '#FFFFFF',
                    color: ticketType === 'single' ? '#FFFFFF' : 'var(--metro-navy)',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  🎟️ {t.booking.singleJourney}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTicketType('group');
                    if (passengers === 1) setPassengers(2);
                  }}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: '2px solid var(--metro-blue)',
                    background: ticketType === 'group' ? 'var(--metro-blue)' : '#FFFFFF',
                    color: ticketType === 'group' ? '#FFFFFF' : 'var(--metro-navy)',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  👥 {t.booking.groupJourney}
                </button>
              </div>
            </div>

            {/* Passenger Selection */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--metro-navy)' }}>
                  {t.booking.passengers}
                </label>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--metro-blue)' }}>
                  {passengers} {language === 'en' ? (passengers === 1 ? 'Passenger' : 'Passengers') : 'यात्री'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
                {[1, 2, 3, 4, 5, 6].map((num) => (
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
                      padding: '10px 0',
                      borderRadius: '8px',
                      border: '2px solid var(--metro-blue)',
                      background: passengers === num ? 'var(--metro-blue)' : '#FFFFFF',
                      color: passengers === num ? '#FFFFFF' : 'var(--metro-navy)',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                    }}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Fare Breakdown Summary */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 18px',
                background: '#ECFDF5',
                borderRadius: '12px',
                border: '1px solid #10B981',
              }}
            >
              <div>
                <div style={{ fontSize: '0.8rem', color: '#065F46', fontWeight: 600 }}>{t.booking.totalAmount}:</div>
                <div style={{ fontSize: '0.78rem', color: '#047857' }}>
                  ₹ {fare} × {passengers} {passengers === 1 ? 'Pax' : 'Pax'}
                </div>
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#047857' }}>
                ₹ {totalFare}
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={() => setStep(2)}
              style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
            >
              {t.booking.proceedPayment} (₹ {totalFare}) ➔
            </button>
          </div>
        )}

        {/* STEP 2: Simulated Payment Screen */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ marginBottom: '10px', display: 'block', fontSize: '0.88rem', fontWeight: 800, color: 'var(--metro-navy)' }}>
                {t.booking.selectPayment}
              </label>

              {/* Payment Method Selector Tabs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  style={{
                    padding: '10px 4px',
                    borderRadius: '8px',
                    border: '2px solid var(--metro-blue)',
                    background: paymentMethod === 'upi' ? 'var(--metro-blue)' : '#FFFFFF',
                    color: paymentMethod === 'upi' ? '#FFFFFF' : 'var(--metro-navy)',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                  }}
                >
                  ⚡ UPI
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  style={{
                    padding: '10px 4px',
                    borderRadius: '8px',
                    border: '2px solid var(--metro-blue)',
                    background: paymentMethod === 'card' ? 'var(--metro-blue)' : '#FFFFFF',
                    color: paymentMethod === 'card' ? '#FFFFFF' : 'var(--metro-navy)',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                  }}
                >
                  💳 Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  style={{
                    padding: '10px 4px',
                    borderRadius: '8px',
                    border: '2px solid var(--metro-blue)',
                    background: paymentMethod === 'netbanking' ? 'var(--metro-blue)' : '#FFFFFF',
                    color: paymentMethod === 'netbanking' ? '#FFFFFF' : 'var(--metro-navy)',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                  }}
                >
                  🏦 NetBanking
                </button>
              </div>

              {/* Payment Input Form Fields */}
              {paymentMethod === 'upi' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--metro-navy)' }}>
                    UPI App / ID
                  </label>
                  <input
                    type="text"
                    placeholder={t.booking.enterUpi}
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid var(--metro-card-border)',
                      fontSize: '0.9rem',
                      width: '100%',
                    }}
                  />
                  <div style={{ fontSize: '0.78rem', color: 'var(--metro-text-muted)', display: 'flex', gap: '8px' }}>
                    <span>Suggested: user@paytm</span>
                    <span>•</span>
                    <span>user@gpay</span>
                    <span>•</span>
                    <span>user@ybl</span>
                  </div>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--metro-navy)', marginBottom: '4px', display: 'block' }}>
                      {t.booking.cardNumber}
                    </label>
                    <input
                      type="text"
                      placeholder="4000 1234 5678 9010"
                      maxLength={16}
                      value={cardNo}
                      onChange={(e) => setCardNo(e.target.value)}
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid var(--metro-card-border)',
                        fontSize: '0.9rem',
                        width: '100%',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--metro-navy)', marginBottom: '4px', display: 'block' }}>
                        {t.booking.cardExpiry}
                      </label>
                      <input
                        type="text"
                        placeholder="12/28"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        style={{
                          padding: '12px',
                          borderRadius: '8px',
                          border: '1px solid var(--metro-card-border)',
                          fontSize: '0.9rem',
                          width: '100%',
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--metro-navy)', marginBottom: '4px', display: 'block' }}>
                        {t.booking.cardCvv}
                      </label>
                      <input
                        type="password"
                        placeholder="•••"
                        maxLength={3}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        style={{
                          padding: '12px',
                          borderRadius: '8px',
                          border: '1px solid var(--metro-card-border)',
                          fontSize: '0.9rem',
                          width: '100%',
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'netbanking' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--metro-navy)' }}>
                    Select Bank (Demo)
                  </label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid var(--metro-card-border)',
                      fontSize: '0.9rem',
                      width: '100%',
                    }}
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="State Bank of India">State Bank of India (SBI)</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                  </select>
                </div>
              )}
            </div>

            {/* Total Fare Card */}
            <div style={{ padding: '14px', background: 'var(--metro-light-bg)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, color: 'var(--metro-navy)' }}>Amount Payable:</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--metro-green)' }}>₹ {totalFare}</span>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-outline"
                style={{ flex: 1, padding: '12px' }}
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleSimulatePayment}
                disabled={isProcessing}
                className="btn-primary"
                style={{ flex: 2, padding: '12px', fontSize: '0.95rem' }}
              >
                {isProcessing ? t.booking.processing : `${t.booking.simulatePay} ₹${totalFare}`}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Professional Digital QR Metro Ticket */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div
              id="digital-metro-ticket"
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, var(--metro-navy) 0%, #0F2942 100%)',
                color: '#FFFFFF',
                borderRadius: '18px',
                padding: '24px',
                boxShadow: '0 16px 36px rgba(11, 31, 58, 0.35)',
                border: '2px solid var(--metro-blue)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Ticket Top Branding */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px rgba(255,255,255,0.15) solid', paddingBottom: '12px' }}>
                <MetroSathiLogo size="sm" variant="light" />
                <span className="demo-notice-badge" style={{ fontSize: '0.68rem', backgroundColor: '#D97706', color: '#FFFFFF' }}>
                  DEMO TICKET
                </span>
              </div>

              {/* Main Ticket Journey Segment */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(4px)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ORIGIN</span>
                    <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#FFFFFF', marginTop: '2px' }}>{sourceStationName}</div>
                    <span style={{ fontSize: '0.72rem', color: '#38BDF8', fontWeight: 700 }}>{sourceNetwork}</span>
                  </div>

                  <div style={{ textAlign: 'center', padding: '0 12px' }}>
                    <div style={{ fontSize: '1.2rem', color: '#38BDF8' }}>➔</div>
                    <span style={{ fontSize: '0.68rem', color: '#CBD5E1' }}>Single Journey</span>
                  </div>

                  <div style={{ flex: 1, textAlign: 'right' }}>
                    <span style={{ fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>DESTINATION</span>
                    <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#FFFFFF', marginTop: '2px' }}>{destinationStationName}</div>
                    <span style={{ fontSize: '0.72rem', color: '#38BDF8', fontWeight: 700 }}>{destNetwork}</span>
                  </div>
                </div>
              </div>

              {/* Dynamic QR Code Vector */}
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '14px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  marginBottom: '16px',
                }}
              >
                <svg width="130" height="130" viewBox="0 0 120 120" style={{ fill: 'var(--metro-navy)' }}>
                  <path d={qrSvgPath} />
                </svg>
                <div style={{ fontSize: '0.72rem', color: 'var(--metro-navy)', fontWeight: 800, marginTop: '8px', letterSpacing: '1px' }}>
                  {ticketId}
                </div>
                <span style={{ fontSize: '0.68rem', color: 'var(--metro-text-subtle)', marginTop: '2px' }}>
                  {t.booking.qrDescription}
                </span>
              </div>

              {/* Ticket Meta Details Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px',
                  fontSize: '0.82rem',
                  background: 'rgba(255,255,255,0.06)',
                  padding: '14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <div>
                  <span style={{ color: '#94A3B8', fontSize: '0.7rem', display: 'block' }}>BOOKING DATE & TIME</span>
                  <strong style={{ color: '#FFFFFF' }}>{bookingTime}</strong>
                </div>
                <div>
                  <span style={{ color: '#94A3B8', fontSize: '0.7rem', display: 'block' }}>PASSENGERS</span>
                  <strong style={{ color: '#FFFFFF' }}>{passengers} Person(s)</strong>
                </div>
                <div>
                  <span style={{ color: '#94A3B8', fontSize: '0.7rem', display: 'block' }}>TOTAL FARE PAID</span>
                  <strong style={{ color: '#4ADE80', fontSize: '1rem' }}>₹ {totalFare}</strong>
                </div>
                <div>
                  <span style={{ color: '#94A3B8', fontSize: '0.7rem', display: 'block' }}>STATUS</span>
                  <strong style={{ color: '#38BDF8' }}>VALID FOR ENTRY</strong>
                </div>
              </div>

              {/* Security Watermark & Demo Notice */}
              <div style={{ marginTop: '14px', textAlign: 'center', fontSize: '0.7rem', color: '#FCD34D', fontStyle: 'italic' }}>
                {t.booking.demoNotice}
              </div>
            </div>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
              <button
                type="button"
                onClick={handleDownloadTicket}
                className="btn-outline"
                style={{ flex: 1, padding: '12px' }}
              >
                {t.booking.downloadBtn}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-primary"
                style={{ flex: 1, padding: '12px' }}
              >
                {t.booking.closeBtn}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
