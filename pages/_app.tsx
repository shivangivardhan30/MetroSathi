import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { AuthProvider } from '../lib/authContext';
import { LanguageProvider } from '../lib/languageContext';
import Layout from '../components/Layout';
import { validateMetroData } from '../lib/validateMetroData';

import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      validateMetroData();
    }
  }, []);

  return (
    <>
      <Head>
        <title>MetroSathi | AI Metro Navigation</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="MetroSathi - India's AI-Powered Multi-City Metro Journey Navigation System" />
      </Head>
      <AuthProvider>
        <LanguageProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </LanguageProvider>
      </AuthProvider>
    </>
  );
}
