// src/app/admin/layout.tsx
import React from 'react';
import HeaderServer from '../components/HeaderServer';
import Footer from '../components/Footer';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HeaderServer />
      {/* alter Wrapper wieder da */}
      <main className="container">
        {children}
      </main>
      <Footer />
    </>
  );
}
