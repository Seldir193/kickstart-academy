
import '@/app/styles/news.scss';
import '@/app/styles/globals.scss';
import 'leaflet/dist/leaflet.css';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dortmunder Fussballschule',
  description: 'Football School for the Next Generation',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
















