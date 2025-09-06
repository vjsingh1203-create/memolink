
import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css';
import Header from '../components/Header';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head><link rel="icon" href="/logo.png" /><title>MemoLink</title></Head>
      <Header />
      <Component {...pageProps} />
    </>
  );
}
