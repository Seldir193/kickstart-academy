


import '@/app/styles/revenue.module.css';

import '@/app/styles/header.css';

import './styles/header-nav-hover.css';
import './styles/profile-button.scss';

import './styles/globals.scss';
import type { Metadata } from 'next';

import 'leaflet/dist/leaflet.css';
import Header from './components/HeaderServer';

import Footer from './components/Footer';


export const metadata: Metadata = {
  title: 'Dortmunder Fussballschule',
  description: 'Football School for the Next Generation',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Header />
        <main className="container">{children}</main>
         <Footer />
      </body>
    </html>
  );
}

