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
      title: 'Passenger Sign In / Access',
      email: 'Email Address (Optional)',
      phone: 'Phone Number (Optional)',
      placeholder_email: 'passenger@example.com',
      placeholder_phone: '+91 XXXXXXXXXX',
      note: 'Enter email or phone number to access saved travel routes',
      loginBtn: 'Sign In',
      loginError: 'Error:',
    },
    hi: {
      title: 'यात्री साइन इन / पंजीकरण',
      email: 'ईमेल पता (वैकल्पिक)',
      phone: 'फोन नंबर (वैकल्पिक)',
      placeholder_email: 'passenger@example.com',
      placeholder_phone: '+91 XXXXXXXXXX',
      note: 'सहेजे गए मार्गों के लिए ईमेल या फोन नंबर दर्ज करें',
      loginBtn: 'साइन इन करें',
      loginError: 'त्रुटि:',
    },
  };

  const t = labels[language];

  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: '6px',
        padding: '28px',
        maxWidth: '420px',
        margin: '0 auto',
        border: '1px solid var(--metro-card-border)',
        borderTop: '3px solid var(--metro-blue)',
      }}
    >
      <h2
        style={{
          textAlign: 'center',
          color: 'var(--metro-navy)',
          marginTop: 0,
          marginBottom: '20px',
          fontWeight: '700',
          fontSize: '1.2rem',
        }}
      >
        {t.title}
      </h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label
            style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: '600',
              color: 'var(--metro-navy)',
              fontSize: '0.88rem',
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
              padding: '10px 14px',
              border: '1px solid var(--metro-card-border)',
              borderRadius: '4px',
              fontSize: '0.92rem',
              boxSizing: 'border-box',
              background: '#FFFFFF',
              color: 'var(--metro-text-main)',
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: '600',
              color: 'var(--metro-navy)',
              fontSize: '0.88rem',
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
              padding: '10px 14px',
              border: '1px solid var(--metro-card-border)',
              borderRadius: '4px',
              fontSize: '0.92rem',
              boxSizing: 'border-box',
              background: '#FFFFFF',
              color: 'var(--metro-text-main)',
            }}
          />
        </div>

        <p
          style={{
            fontSize: '0.8rem',
            color: 'var(--metro-text-subtle)',
            margin: '2px 0',
          }}
        >
          {t.note}
        </p>

        {error && (
          <div
            style={{
              padding: '10px 14px',
              background: '#FEF2F2',
              borderRadius: '4px',
              color: '#DC2626',
              fontSize: '0.85rem',
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
            marginTop: '8px',
            opacity: isLoading ? 0.6 : 1,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            width: '100%',
          }}
        >
          {isLoading ? 'Signing In...' : t.loginBtn}
        </button>
      </form>
    </div>
  );
}
