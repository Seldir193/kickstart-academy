"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { usePathname } from "next/navigation";

function isAdminMinimalFooterRoute(pathname: string) {
  const path = pathname.toLowerCase();

  return (
    path === "/admin/login" ||
    path === "/admin/signup" ||
    path === "/admin/password-reset" ||
    path === "/admin/new-password" ||
    path === "/admin/imprint" ||
    path === "/admin/privacy" ||
    path === "/admin/agb" ||
    path.startsWith("/admin/login/") ||
    path.startsWith("/admin/signup/") ||
    path.startsWith("/admin/password-reset/") ||
    path.startsWith("/admin/new-password/") ||
    path.startsWith("/admin/imprint/") ||
    path.startsWith("/admin/privacy/") ||
    path.startsWith("/admin/agb/")
  );
}

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  const pathname = usePathname() || "";
  const isMinimalFooterRoute = isAdminMinimalFooterRoute(pathname);

  const IMPRINT_URL =
    process.env.NEXT_PUBLIC_LEGAL_IMPRINT_URL || "/admin/imprint";
  const PRIVACY_URL =
    process.env.NEXT_PUBLIC_LEGAL_PRIVACY_URL || "/admin/privacy";
  const TERMS_URL = process.env.NEXT_PUBLIC_LEGAL_TERMS_URL || "/admin/agb";

  const EMAIL =
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ||
    "info@dortmunder-fussballschule.de";
  const LOGO_SRC = process.env.NEXT_PUBLIC_MINI_LOGO || "/assets/img/logo.jpg";

  const CONTACT_URL =
    process.env.NEXT_PUBLIC_CONTACT_URL ||
    (process.env.NEXT_PUBLIC_WP_BASE_URL
      ? `${process.env.NEXT_PUBLIC_WP_BASE_URL.replace(/\/$/, "")}/?page_id=143`
      : "/kontakt");

  if (isMinimalFooterRoute) {
    return (
      <footer
        className="site-footer site-footer--auth-minimal"
        role="contentinfo"
      >
        <div className="container footer-auth-min">
          <nav
            className="footer-auth-min__links"
            aria-label={t("common.footer.legalLinks")}
          >
            <a href={IMPRINT_URL}>{t("common.footer.imprint")}</a>
            <a href={PRIVACY_URL}>{t("common.footer.privacy")}</a>
          </nav>

          <div className="footer-auth-min__copy">
            © {year} {t("common.footer.brand")}
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="site-footer site-footer--minimal" role="contentinfo">
      <div className="container footer-min">
        <div className="footer-min__left">
          {LOGO_SRC ? (
            <img
              src={LOGO_SRC}
              alt=""
              aria-hidden="true"
              className="footer-min__logo"
            />
          ) : null}

          <div className="footer-min__brand">
            <span className="footer-min__brand-name">
              {t("common.footer.brand")}
            </span>
            <span className="footer-min__copy">© {year}</span>
          </div>
        </div>

        <a className="footer-min__mail" href={`mailto:${EMAIL}`}>
          {EMAIL}
        </a>

        <nav
          className="footer-min__links"
          aria-label={t("common.footer.links")}
        >
          <a href={CONTACT_URL}>{t("common.footer.contact")}</a>
          <a href={IMPRINT_URL}>{t("common.footer.imprint")}</a>
          <a href={PRIVACY_URL}>{t("common.footer.privacy")}</a>
          <a href={TERMS_URL}>{t("common.footer.terms")}</a>
        </nav>
      </div>
    </footer>
  );
}
