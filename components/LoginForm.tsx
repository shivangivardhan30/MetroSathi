import { useState } from 'react';
import { useAuth } from '../lib/authContext';

interface LoginFormProps {
  language: 'en' | 'hi';
  onLoginSuccess?: () => void;
}

export default function LoginForm({ language, onLoginSuccess }: LoginFormProps) {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, phone);
      onLoginSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const labels = {
    en: {
      title: '🔐 Login to MetroSathi',
      email: 'Email Address (Optional)',
      phone: 'Phone Number (Optional)',
      placeholder_email: 'user@example.com',
      placeholder_phone: '+91 XXXXXXXXXX',
      note: 'Enter email or phone number (at least one required)',
      loginBtn: '🚀 Login',
      loginError: 'Error:',
    },
    hi: {
      title: '🔐 मेट्रो साथी में लॉगिन करें',
      email: 'ईमेल पता (वैकल्पिक)',
      phone: 'फोन नंबर (वैकल्पिक)',
      placeholder_email: 'user@example.com',
      placeholder_phone: '+91 XXXXXXXXXX',
      note: 'ईमेल या फोन नंबर दर्ज करें (कम से कम एक आवश्यक)',
      loginBtn: '🚀 लॉगिन करें',
      loginError: 'त्रुटि:',
    },
  };

  const t = labels[language];

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '420px',
        margin: '0 auto',
        border: '1px solid rgba(0, 87, 184, 0.15)',
        boxShadow: '0 12px 32px rgba(11, 31, 58, 0.08)',
      }}
    >
      <h2
        style={{
          textAlign: 'center',
          color: '#0B1F3A',
          marginTop: 0,
          marginBottom: '24px',
          fontWeight: '700',
        }}
      >
        {t.title}
      </h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label
            style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#0B1F3A',
              fontSize: '0.95rem',
            }}
          >
            {t.email}
          </label>
          <input
            type="email"
            placeholder={t.placeholder_email}
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #CBD5E1',
              borderRadius: '10px',
              fontSize: '1rem',
              boxSizing: 'border-box',
              background: '#F8FAFC',
              color: '#0F172A',
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#0B1F3A',
              fontSize: '0.95rem',
            }}
          >
            {t.phone}
          </label>
          <input
            type="tel"
            placeholder={t.placeholder_phone}
            value={phone}
            onChange={e => setPhone(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #CBD5E1',
              borderRadius: '10px',
              fontSize: '1rem',
              boxSizing: 'border-box',
              background: '#F8FAFC',
              color: '#0F172A',
            }}
          />
        </div>

        <p
          style={{
            fontSize: '0.85rem',
            color: '#64748B',
            fontStyle: 'italic',
            margin: '4px 0',
          }}
        >
          📝 {t.note}
        </p>

        {error && (
          <div
            style={{
              padding: '12px',
              background: '#FEF2F2',
              borderRadius: '8px',
              color: '#DC2626',
              fontSize: '0.9rem',
              borderLeft: '4px solid #DC2626',
            }}
          >
            <strong>{t.loginError}</strong> {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="button"
          style={{
            marginTop: '12px',
            opacity: isLoading ? 0.6 : 1,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            width: '100%',
          }}
        >
          {isLoading ? '⏳ Logging in...' : t.loginBtn}
        </button>
      </form>
    </div>
  );
}
