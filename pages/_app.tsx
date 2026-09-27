import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { AuthProvider } from '../lib/authContext';
import { LanguageProvider } from '../lib/languageContext';
import Layout from '../components/Layout';
import { validateMetroData } from '../lib/validateMetroData';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      validateMetroData();
    }
  }, []);

  return (
    <AuthProvider>
      <LanguageProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </LanguageProvider>
    </AuthProvider>
  );
}
