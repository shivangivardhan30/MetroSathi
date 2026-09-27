import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useLanguage } from '../lib/languageContext';
import { useTranslation } from '../lib/translations';
import { useAuth } from '../lib/authContext';
import MetroSathiLogo from './MetroSathiLogo';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const { user, isLoggedIn } = useAuth();
  const t = useTranslation(language);

  const navItems = [
    { href: '/', label: language === 'en' ? 'Home' : 'मुख्य', icon: '🏠' },
    { href: '/journey', label: language === 'en' ? 'Journey Planner' : 'यात्रा योजनाकार', icon: '📍' },
    { href: '/map', label: language === 'en' ? 'Metro Maps' : 'मेट्रो मानचित्र', icon: '🗺️' },
    { href: '/assistant', label: language === 'en' ? 'AI Assistant' : 'AI सहायक', icon: '🤖' },
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
            <MetroSathiLogo size="md" />
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
                  <span>{item.icon}</span>
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
              <div className="guest-indicator" title="Guest User" style={{ opacity: 0.8 }}>
                <span style={{ fontSize: '1.2rem', color: '#94A3B8' }}>👤</span>
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
      <footer style={{ backgroundColor: 'var(--metro-navy)', color: '#94A3B8', padding: '24px 20px', borderTop: '3px solid var(--metro-blue)', textAlign: 'center', fontSize: '0.85rem' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ffffff', fontWeight: 700, fontSize: '1rem' }}>
            <span>🚇</span> MetroSathi • Smart Metro Navigation System
          </div>
          <div>
            {language === 'en'
              ? 'Multi-city metro travel guidance for Delhi NCR, Mumbai, Bengaluru, Hyderabad, Chennai & more.'
              : 'दिल्ली एनसीआर, मुंबई, बेंगलुरु, हैदराबाद, चेन्नई और अन्य के लिए बहु-शहर मेट्रो यात्रा मार्गदर्शन।'}
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
