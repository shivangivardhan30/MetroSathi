import { useLanguage } from '../lib/languageContext';
import { useTranslation } from '../lib/translations';
import MetroMap from '../components/MetroMap';

export default function Map() {
  const { language } = useLanguage();
  const t = useTranslation(language);

  return (
    <main className="container">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--metro-navy)', margin: 0 }}>
          {t.map.title}
        </h1>
        <p style={{ color: 'var(--metro-text-muted)', fontSize: '1rem', marginTop: '6px' }}>
          {t.map.description}
        </p>
      </div>

      <MetroMap language={language} />
    </main>
  );
}
