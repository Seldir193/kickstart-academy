// src/app/admin/privacy/page.tsx
"use client";

import { useTranslation } from "react-i18next";

export default function AdminPrivacyPage() {
  const { t } = useTranslation();

  return (
    <section className="ks-privacy">
      <div className="container">
        <div className="ks-privacy__content">
          <header className="ks-privacy__head">
            <h1 className="ks-privacy__title">{t("common.privacy.title")}</h1>
          </header>

          <h2>{t("common.privacy.section.overview")}</h2>

          <h3>{t("common.privacy.section.whatIsThis")}</h3>
          <p>{t("common.privacy.whatIsThisText")}</p>

          <h3>{t("common.privacy.section.whichData")}</h3>
          <ul>
            <li>
              <strong>{t("common.privacy.data.accountTitle")}</strong>{" "}
              {t("common.privacy.data.accountText")}
            </li>
            <li>
              <strong>{t("common.privacy.data.portalContentTitle")}</strong>{" "}
              {t("common.privacy.data.portalContentText")}
            </li>
            <li>
              <strong>{t("common.privacy.data.businessTitle")}</strong>{" "}
              {t("common.privacy.data.businessText")}
            </li>
            <li>
              <strong>{t("common.privacy.data.customerTitle")}</strong>{" "}
              {t("common.privacy.data.customerText")}
            </li>
            <li>
              <strong>{t("common.privacy.data.technicalTitle")}</strong>{" "}
              {t("common.privacy.data.technicalText")}
            </li>
          </ul>

          <h3>{t("common.privacy.section.usage")}</h3>
          <ul>
            <li>{t("common.privacy.usage.portal")}</li>
            <li>{t("common.privacy.usage.operations")}</li>
            <li>{t("common.privacy.usage.support")}</li>
            <li>{t("common.privacy.usage.legal")}</li>
          </ul>

          <h3>{t("common.privacy.section.legalBasis")}</h3>
          <ul>
            <li>
              <strong>{t("common.privacy.legal.contractTitle")}</strong>{" "}
              {t("common.privacy.legal.contractText")}
            </li>
            <li>
              <strong>{t("common.privacy.legal.obligationTitle")}</strong>{" "}
              {t("common.privacy.legal.obligationText")}
            </li>
            <li>
              <strong>{t("common.privacy.legal.legitimateTitle")}</strong>{" "}
              {t("common.privacy.legal.legitimateText")}
            </li>
            <li>
              <strong>{t("common.privacy.legal.consentTitle")}</strong>{" "}
              {t("common.privacy.legal.consentText")}
            </li>
          </ul>

          <hr className="ks-privacy__hr" />

          <h2>{t("common.privacy.section.controller")}</h2>
          <p>
            <strong>Selcuk Kocyigit</strong>
            <br />
            Hochfelder Straße 33
            <br />
            47226 Duisburg
            <br />
            Deutschland
          </p>
          <p>
            {t("common.privacy.phone")}: +49 (0) 176 4320 3362
            <br />
            {t("common.privacy.email")}:{" "}
            <a href="mailto:fussballschule@selcuk-kocyigit.de">
              fussballschule@selcuk-kocyigit.de
            </a>
          </p>

          <h2>{t("common.privacy.section.roles")}</h2>
          <p>{t("common.privacy.rolesText")}</p>
          <p>{t("common.privacy.rolesNote")}</p>

          <hr className="ks-privacy__hr" />

          <h2>{t("common.privacy.section.hosting")}</h2>
          <p>{t("common.privacy.hostingIntro")}</p>

          <h3>{t("common.privacy.section.serverHosting")}</h3>
          <p>
            {t("common.privacy.hosting.provider")}:{" "}
            <strong>[Hosting-Anbieter eintragen]</strong>
            <br />
            {t("common.privacy.hosting.address")}:{" "}
            <strong>[Adresse eintragen]</strong>
            <br />
            {t("common.privacy.hosting.notice")}:{" "}
            <strong>[Link eintragen]</strong>
          </p>

          <h3>{t("common.privacy.section.database")}</h3>
          <p>
            {t("common.privacy.database.type")}:{" "}
            <strong>[z.B. MongoDB Atlas / eigener Server]</strong>
            <br />
            {t("common.privacy.database.providerPlace")}:{" "}
            <strong>[eintragen]</strong>
          </p>

          <h3>{t("common.privacy.section.processing")}</h3>
          <p>{t("common.privacy.processingText")}</p>

          <hr className="ks-privacy__hr" />

          <h2>{t("common.privacy.section.login")}</h2>
          <p>{t("common.privacy.loginText")}</p>

          <h2>{t("common.privacy.section.logs")}</h2>
          <p>{t("common.privacy.logsText")}</p>

          <h2>{t("common.privacy.section.recipients")}</h2>
          <ul>
            <li>{t("common.privacy.recipients.hosting")}</li>
            <li>{t("common.privacy.recipients.accounting")}</li>
            <li>{t("common.privacy.recipients.authorities")}</li>
          </ul>

          <h2>{t("common.privacy.section.thirdCountry")}</h2>
          <p>{t("common.privacy.thirdCountryText")}</p>

          <h2>{t("common.privacy.section.retention")}</h2>
          <p>{t("common.privacy.retentionText")}</p>

          <h2>{t("common.privacy.section.rights")}</h2>
          <p>{t("common.privacy.rightsText")}</p>

          <h2>{t("common.privacy.section.contactDataProtection")}</h2>
          <p>
            {t("common.privacy.contactDataProtectionText")}{" "}
            <a href="mailto:fussballschule@selcuk-kocyigit.de">
              fussballschule@selcuk-kocyigit.de
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
