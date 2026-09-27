import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from '../lib/translations';
import { useLanguage } from '../lib/languageContext';
import { useAuth } from '../lib/authContext';
import LoginForm from '../components/LoginForm';
import UserProfile from '../components/UserProfile';
import MetroSathiLogo from '../components/MetroSathiLogo';
import { availableNetworks } from '../lib/metroData';

export default function Home() {
  const router = useRouter();
  const { language } = useLanguage();
  const { isLoggedIn } = useAuth();
  const t = useTranslation(language);

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
      icon: '🔔',
      title: t.home.feature6Title,
      desc: t.home.feature6Desc,
      link: '/journey',
    },
  ];

  return (
    <main className="container">
      {/* Hero Section */}
      <header className="hero" style={{ padding: '40px 24px' }}>
        <div style={{ maxWidth: '680px' }}>
          <div style={{ marginBottom: '20px' }}>
            <MetroSathiLogo size="xl" />
          </div>
          <h1>{t.home.title}</h1>
          <p className="description">
            {t.home.subtitle}
          </p>

          <div className="hero-cta-group">
            <Link href="/journey" className="button">
              <span>📍</span> {t.home.planJourneyBtn}
            </Link>
            <Link href="/journey?autoGps=1" className="btn-secondary">
              <span>🛰️</span> {t.home.useLocationBtn}
            </Link>
          </div>
        </div>
      </header>

      {/* Feature Grid */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--metro-navy)', margin: '0 0 16px' }}>
          {t.home.featuresTitle}
        </h2>

        <div className="feature-grid">
          {featureCards.map((card, idx) => (
            <Link
              key={idx}
              href={card.link}
              style={{ textDecoration: 'none' }}
            >
              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  {card.icon}
                </div>
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Supported Metro Networks Section */}
      <section className="card" style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--metro-navy)', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🚆</span> Popular Metro Networks Across India
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
