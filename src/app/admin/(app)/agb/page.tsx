// src/app/admin/agb/page.tsx
"use client";

import { useTranslation } from "react-i18next";

export default function AdminTermsPage() {
  const { t } = useTranslation();

  return (
    <section className="ks-agb">
      <div className="ks-agb__body">
        <div className="container">
          <div className="ks-agb__content">
            <header className="ks-agb__head">
              <div className="container">
                <h1 className="ks-agb__title">{t("common.terms.title")}</h1>
              </div>
            </header>

            <p>{t("common.terms.intro")}</p>

            <h2>{t("common.terms.section.scope")}</h2>
            <p>{t("common.terms.scopeText")}</p>

            <h2>{t("common.terms.section.services")}</h2>
            <p>{t("common.terms.servicesText1")}</p>
            <p>{t("common.terms.servicesText2")}</p>

            <h2>{t("common.terms.section.registration")}</h2>
            <p>{t("common.terms.registrationText1")}</p>
            <p>{t("common.terms.registrationText2")}</p>

            <h2>{t("common.terms.section.duties")}</h2>
            <p>{t("common.terms.dutiesText1")}</p>
            <p>{t("common.terms.dutiesText2")}</p>

            <h2>{t("common.terms.section.customerContracts")}</h2>
            <p>{t("common.terms.customerContractsText1")}</p>
            <p>{t("common.terms.customerContractsText2")}</p>

            <h2>{t("common.terms.section.availability")}</h2>
            <p>{t("common.terms.availabilityText1")}</p>
            <p>{t("common.terms.availabilityText2")}</p>

            <h2>{t("common.terms.section.support")}</h2>
            <p>{t("common.terms.supportText")}</p>

            <h2>{t("common.terms.section.privacy")}</h2>
            <p>{t("common.terms.privacyText1")}</p>
            <p>
              {t("common.terms.privacyText2BeforeLink")}{" "}
              <a href="/admin/datenschutz">{t("common.terms.privacyLink")}</a>.
            </p>

            <h2>{t("common.terms.section.security")}</h2>
            <p>{t("common.terms.securityText")}</p>

            <h2>{t("common.terms.section.fees")}</h2>
            <p>{t("common.terms.feesText")}</p>

            <h2>{t("common.terms.section.term")}</h2>
            <p>{t("common.terms.termText1")}</p>
            <p>{t("common.terms.termText2")}</p>

            <h2>{t("common.terms.section.liability")}</h2>
            <p>{t("common.terms.liabilityText1")}</p>
            <p>{t("common.terms.liabilityText2")}</p>
            <p>{t("common.terms.liabilityText3")}</p>

            <h2>{t("common.terms.section.confidentiality")}</h2>
            <p>{t("common.terms.confidentialityText")}</p>

            <h2>{t("common.terms.section.final")}</h2>
            <p>{t("common.terms.finalText")}</p>

            <p>
              <strong>{t("common.terms.noteTitle")}</strong>{" "}
              {t("common.terms.noteText")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
