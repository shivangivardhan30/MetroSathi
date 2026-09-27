import { useState, useEffect } from 'react';
import { useAuth } from '../lib/authContext';
import { useTranslation } from '../lib/translations';

interface TicketBookingProps {
  sourceCity: string;
  sourceStationName: string;
  destinationStationName: string;
  fare: number;
  onClose: () => void;
  language: 'en' | 'hi';
}

export default function TicketBooking({
  sourceCity,
  sourceStationName,
  destinationStationName,
  fare,
  onClose,
  language,
}: TicketBookingProps) {
  const { bookTicket } = useAuth();
  const t = useTranslation(language);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [ticketType, setTicketType] = useState<'single' | 'group' | 'recharge'>('single');
  const [passengers, setPassengers] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card'>('upi');
  const [cardNo, setCardNo] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [qrSvgContent, setQrSvgContent] = useState('');

  useEffect(() => {
    if (step === 3) {
      const id = `MS-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
      setTicketId(id);
      
      const size = 15;
      let path = '';
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const isFinder = 
            (r < 4 && c < 4) || 
            (r < 4 && c >= size - 4) || 
            (r >= size - 4 && c < 4);
          
          if (isFinder) {
            const isBorder = r === 0 || r === 3 || c === 0 || c === 3 || 
                             r === size-4 || r === size-1 || c === 0 || c === 3 ||
                             r === 0 || r === 3 || c === size-4 || c === size-1;
            const isCenter = (r === 1 && c === 1) || (r === 1 && c === size-3) || (r === size-3 && c === 1);
            if (isBorder || isCenter) {
              path += ` M ${c * 8} ${r * 8} h 6 v 6 h -6 z`;
            }
          } else {
            if (Math.random() > 0.45) {
              path += ` M ${c * 8} ${r * 8} h 6 v 6 h -6 z`;
            }
          }
        }
      }
      setQrSvgContent(path);
    }
  }, [step]);

  const totalFare = ticketType === 'recharge' ? 200 : fare * passengers;

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      
      bookTicket({
        sourceCity,
        sourceStationName: ticketType === 'recharge' ? 'Smart Card' : sourceStationName,
        destinationStationName: ticketType === 'recharge' ? 'Recharge ₹200' : destinationStationName,
        fare: totalFare,
        passengers: ticketType === 'recharge' ? 1 : passengers,
        ticketType: ticketType === 'single' ? 'Single Journey' : ticketType === 'group' ? 'Group Ticket' : 'Recharge',
        qrCodeData: `METROSATHI|${sourceCity}|${sourceStationName}|${destinationStationName}|${totalFare}|${Date.now()}`,
      });

      setStep(3);
    }, 1200);
  };

  const downloadTicket = () => {
    alert(language === 'en' ? 'Downloaded simulated ticket PDF!' : 'सिमुलेटेड टिकट पीडीएफ डाउनलोड किया गया!');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(11, 31, 58, 0.75)',
        backdropFilter: 'blur(6px)',
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
          maxWidth: '480px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 24px 48px rgba(11, 31, 58, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          animation: 'fadeIn 0.2s ease',
          border: '2px solid var(--metro-blue)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--metro-card-border)', paddingBottom: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--metro-navy)', fontWeight: 800 }}>
                {step === 3 ? t.booking.successTitle : t.booking.bookingTitle}
              </h3>
              <span className="demo-notice-badge">DEMO</span>
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
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Step 1: Configuration */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ marginBottom: '8px', display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--metro-navy)' }}>
                {t.booking.ticketType}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setTicketType('single')}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: '2px solid var(--metro-blue)',
                    background: ticketType === 'single' ? 'var(--metro-blue)' : '#FFFFFF',
                    color: ticketType === 'single' ? '#FFFFFF' : 'var(--metro-blue)',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  🎟️ {t.booking.singleJourney}
                </button>
                <button
                  type="button"
                  onClick={() => setTicketType('group')}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: '2px solid var(--metro-blue)',
                    background: ticketType === 'group' ? 'var(--metro-blue)' : '#FFFFFF',
                    color: ticketType === 'group' ? '#FFFFFF' : 'var(--metro-blue)',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  👥 {t.booking.groupJourney}
                </button>
              </div>
            </div>

            {ticketType === 'group' && (
              <div>
                <label style={{ marginBottom: '8px', display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--metro-navy)' }}>
                  {t.booking.passengers}
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {[2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setPassengers(num)}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        border: '2px solid var(--metro-blue)',
                        background: passengers === num ? 'var(--metro-blue)' : '#FFFFFF',
                        color: passengers === num ? '#FFFFFF' : 'var(--metro-blue)',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Journey Summary */}
            <div style={{ padding: '16px', background: 'var(--metro-light-bg)', borderRadius: '12px', border: '1px solid var(--metro-card-border)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--metro-text-subtle)', textTransform: 'uppercase' }}>
                JOURNEY SUMMARY (DEMO)
              </div>
              <div style={{ fontWeight: 800, color: 'var(--metro-navy)', fontSize: '1.05rem', marginTop: '4px' }}>
                {sourceStationName} ➔ {destinationStationName}
              </div>
              <div style={{ fontSize: '0.88rem', color: 'var(--metro-text-muted)', marginTop: '2px' }}>
                Network: {sourceCity}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--metro-card-border)', marginTop: '12px', paddingTop: '8px', fontWeight: 800, fontSize: '1.1rem' }}>
                <span>Total Amount:</span>
                <span style={{ color: 'var(--metro-green)' }}>₹ {totalFare}</span>
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={() => setStep(2)}
              style={{ width: '100%' }}
            >
              Continue to Demo Payment (₹ {totalFare})
            </button>
          </div>
        )}

        {/* Step 2: Payment Simulator */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ marginBottom: '8px', display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--metro-navy)' }}>
                {t.booking.selectPayment}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: '2px solid var(--metro-blue)',
                    background: paymentMethod === 'upi' ? 'var(--metro-blue)' : '#FFFFFF',
                    color: paymentMethod === 'upi' ? '#FFFFFF' : 'var(--metro-blue)',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  ⚡ UPI / GPay
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: '2px solid var(--metro-blue)',
                    background: paymentMethod === 'card' ? 'var(--metro-blue)' : '#FFFFFF',
                    color: paymentMethod === 'card' ? '#FFFFFF' : 'var(--metro-blue)',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  💳 Card Payment
                </button>
              </div>

              {paymentMethod === 'upi' ? (
                <div>
                  <input
                    type="text"
                    placeholder="Enter UPI ID (e.g. user@upi)"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="Card Number (Demo)"
                    maxLength={16}
                    value={cardNo}
                    onChange={(e) => setCardNo(e.target.value)}
                  />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                    />
                    <input
                      type="password"
                      placeholder="CVV"
                      maxLength={3}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-outline"
                style={{ flex: 1 }}
              >
                Back
              </button>
              <button
                type="button"
                onClick={handlePay}
                disabled={isProcessing}
                className="btn-primary"
                style={{ flex: 2 }}
              >
                {isProcessing ? 'Processing Payment...' : `Simulate Pay ₹${totalFare}`}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Ticket Presentation */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, var(--metro-navy) 0%, #0e294f 100%)',
                color: '#FFFFFF',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 12px 32px rgba(11, 31, 58, 0.3)',
                border: '2px solid var(--metro-blue)',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--metro-cyan)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
                    MetroSathi Demo Pass
                  </span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', marginTop: '2px' }}>
                    {ticketType === 'single' ? 'Single Journey QR' : 'Group Ticket'}
                  </div>
                </div>
                <span style={{ fontSize: '1.4rem' }}>🚇</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.08)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block' }}>FROM</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800 }}>{sourceStationName}</span>
                </div>
                <div style={{ color: 'var(--metro-cyan)', fontSize: '1.1rem' }}>➔</div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block' }}>TO</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800 }}>{destinationStationName}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem', marginBottom: '16px' }}>
                <div>
                  <span style={{ color: '#94A3B8', fontSize: '0.72rem', display: 'block' }}>TICKET ID</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{ticketId}</span>
                </div>
                <div>
                  <span style={{ color: '#94A3B8', fontSize: '0.72rem', display: 'block' }}>PAX</span>
                  <span style={{ fontWeight: 700 }}>{passengers} Person(s)</span>
                </div>
                <div>
                  <span style={{ color: '#94A3B8', fontSize: '0.72rem', display: 'block' }}>FARE</span>
                  <span style={{ fontWeight: 700, color: '#4ADE80' }}>₹ {totalFare}</span>
                </div>
                <div>
                  <span style={{ color: '#94A3B8', fontSize: '0.72rem', display: 'block' }}>DATE</span>
                  <span style={{ fontWeight: 700 }}>{new Date().toLocaleDateString()}</span>
                </div>
              </div>

              {/* QR Vector */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#FFFFFF', padding: '16px', borderRadius: '12px', width: '150px', margin: '0 auto' }}>
                <svg width="110" height="110" viewBox="0 0 120 120" style={{ fill: 'var(--metro-navy)' }}>
                  <path d={qrSvgContent} />
                </svg>
                <span style={{ color: 'var(--metro-text-subtle)', fontSize: '0.68rem', marginTop: '6px', textAlign: 'center' }}>
                  {t.booking.qrDescription}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <button
                type="button"
                onClick={downloadTicket}
                className="btn-outline"
                style={{ flex: 1 }}
              >
                💾 Download
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-primary"
                style={{ flex: 1 }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
