import "@/app/styles/globals.scss";
import "leaflet/dist/leaflet.css";

import type { Metadata } from "next";
import I18nProvider from "./components/I18nProvider";

export const metadata: Metadata = {
  title: "Dortmunder Fussballschule",
  description: "Football School for the Next Generation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
// //src\app\layout.tsx
// import "@/app/styles/globals.scss";
// import "leaflet/dist/leaflet.css";

// import type { Metadata } from "next";

// export const metadata: Metadata = {
//   title: "Dortmunder Fussballschule",
//   description: "Football School for the Next Generation",
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <body suppressHydrationWarning>{children}</body>
//     </html>
//   );
// }
