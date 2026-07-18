import React from "react";
import HeaderServer from "../../components/HeaderServer";
import Footer from "../../components/Footer";

export default function AdminAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <HeaderServer />

      <main className="site-main site-main--auth">
        <div className="auth-center">
          <div className="container">{children}</div>
        </div>
        <Footer />
      </main>
    </>
  );
}
