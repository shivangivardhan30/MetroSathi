import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useLanguage } from '../lib/languageContext';
import { useTranslation } from '../lib/translations';
import { useAuth } from '../lib/authContext';
import MetroSathiLogo from './MetroSathiLogo';
import { HomeIcon, JourneyIcon, MapIcon, AssistantIcon, ProfileIcon } from './NavIcons';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const { user, isLoggedIn } = useAuth();
  const t = useTranslation(language);

  const navItems = [
    { href: '/', label: language === 'en' ? 'Home' : 'मुख्य', icon: <HomeIcon size={18} /> },
    { href: '/journey', label: language === 'en' ? 'Plan Journey' : 'यात्रा योजनाकार', icon: <JourneyIcon size={18} /> },
    { href: '/map', label: language === 'en' ? 'Metro Networks' : 'मेट्रो नेटवर्क', icon: <MapIcon size={18} /> },
    { href: '/assistant', label: language === 'en' ? 'AI Assistant' : 'AI सहायक', icon: <AssistantIcon size={18} /> },
  ];

  const handleLanguageChange = (lang: 'en' | 'hi') => {
    setLanguage(lang);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--metro-light-bg)' }}>
      {/* Global Metro Navbar */}
      <header className="global-header">
        <div className="header-container">
          <Link href="/" style={{ textDecoration: 'none' }}>
            <MetroSathiLogo size="md" variant="light" />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="desktop-nav">
            {navItems.map((item) => {
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link-item ${isActive ? 'active' : ''}`}
                >
                  <span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Header Actions */}
          <div className="header-right">
            {/* Bilingual Switcher */}
            <div className="language-selector">
              <button
                className={`lang-btn ${language === 'en' ? 'active' : ''}`}
                onClick={() => handleLanguageChange('en')}
                aria-label="Switch to English"
              >
                EN
              </button>
              <button
                className={`lang-btn ${language === 'hi' ? 'active' : ''}`}
                onClick={() => handleLanguageChange('hi')}
                aria-label="हिंदी भाषा चुनें"
              >
                हिंदी
              </button>
            </div>

            {/* User Profile Indicator */}
            {isLoggedIn && user ? (
              <div className="profile-indicator" title={user.name || 'User'}>
                <div className="avatar-circle">
                  {user.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
                </div>
              </div>
            ) : (
              <div className="guest-indicator" title="Guest User" style={{ opacity: 0.85, display: 'flex', alignItems: 'center' }}>
                <ProfileIcon size={20} color="#CBD5E1" />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main style={{ flex: 1 }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: 'var(--metro-navy)', color: '#94A3B8', padding: '28px 20px', borderTop: '3px solid var(--metro-blue)', textAlign: 'center', fontSize: '0.85rem' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff', fontWeight: 800, fontSize: '1.05rem' }}>
            <MetroSathiLogo size="sm" variant="light" />
          </div>
          <div style={{ marginTop: '4px' }}>
            {language === 'en'
              ? 'Multi-city metro travel guidance for Delhi NCR, Noida Metro, Mumbai, Bengaluru, Hyderabad & more.'
              : 'दिल्ली एनसीआर, नोएडा मेट्रो, मुंबई, बेंगलुरु, हैदराबाद और अन्य के लिए बहु-शहर मेट्रो यात्रा मार्गदर्शन।'}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px' }}>
            © {new Date().getFullYear()} MetroSathi. All rights reserved. Demo / Simulated Data where indicated.
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <nav className="bottom-nav">
        {navItems.map((item) => {
          const isActive = router.pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="bottom-nav-icon">{item.icon}</span>
              <span className="bottom-nav-label">
                {item.label.split(' ')[0]}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
