// src/app/admin/imprint/page.tsx
"use client";

import { useTranslation } from "react-i18next";

export const runtime = "nodejs";

export default function AdminImprintPage() {
  const { t } = useTranslation();

  const portalUrl =
    process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3000";

  const privacyUrl = "/admin/privacy";
  const publicPrivacyUrl = process.env.NEXT_PUBLIC_WP_BASE_URL
    ? `${process.env.NEXT_PUBLIC_WP_BASE_URL.replace(/\/$/, "")}/datenschutz/`
    : "";

  return (
    <section className="ks-impressum">
      <div className="container">
        <div className="ks-impressum__content">
          <header className="ks-impressum__head">
            <h1 className="ks-impressum__title">{t("common.imprint.title")}</h1>
          </header>

          <p className="text-gray-700">
            <strong>{t("common.imprint.scopeTitle")}</strong>{" "}
            {t("common.imprint.scopeTextBeforePortal")}{" "}
            <strong>DFSMANAGER</strong>{" "}
            {t("common.imprint.scopeTextAfterPortal")}{" "}
            <strong>{portalUrl}</strong>.
            <br />
            {t("common.imprint.scopePublicWebsite")}
          </p>

          <h2>{t("common.imprint.section.ddg")}</h2>
          <p>
            Selcuk Kocyigit
            <br />
            Dortmunder Fussballschule
            <br />
            Hochfelder Straße 33
            <br />
            47226 Duisburg
            <br />
            Deutschland
          </p>

          <h2>{t("common.imprint.section.contact")}</h2>
          <p>
            {t("common.imprint.phone")}:{" "}
            <a href="tel:+4917643203362">+49 176 4320 3362</a>
            <br />
            {t("common.imprint.email")}:{" "}
            <a href="mailto:fussballschule@selcuk-kocyigit.de">
              fussballschule@selcuk-kocyigit.de
            </a>
          </p>

          <h2>{t("common.imprint.section.liabilityContent")}</h2>
          <p>{t("common.imprint.liabilityContentText")}</p>

          <h2>{t("common.imprint.section.externalLinks")}</h2>
          <p>{t("common.imprint.externalLinksText")}</p>

          <h2>{t("common.imprint.section.copyright")}</h2>
          <p>{t("common.imprint.copyrightText")}</p>

          <h2>{t("common.imprint.section.privacy")}</h2>
          <p>
            {t("common.imprint.privacyTextBeforeLink")}{" "}
            <a href={privacyUrl}>{t("common.imprint.privacyPolicy")}</a>
            {publicPrivacyUrl ? (
              <>
                {" "}
                ({t("common.imprint.publicWebsite")}:{" "}
                <a href={publicPrivacyUrl} target="_blank" rel="noreferrer">
                  {t("common.imprint.privacyPolicy")}
                </a>
                ).
              </>
            ) : (
              "."
            )}
          </p>

          <h2>{t("common.imprint.section.consumerDispute")}</h2>
          <p>{t("common.imprint.consumerDisputeText")}</p>
        </div>
      </div>
    </section>
  );
}

// // src/app/admin/imprint/page.tsx
// "use client";
// import { useTranslation } from "react-i18next";
// export const runtime = "nodejs";

// export default function AdminImprintPage() {
//   const { t } = useTranslation();
//   const portalUrl =
//     process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3000";

//   const privacyUrl = "/admin/privacy";
//   const publicPrivacyUrl = process.env.NEXT_PUBLIC_WP_BASE_URL
//     ? `${process.env.NEXT_PUBLIC_WP_BASE_URL.replace(/\/$/, "")}/datenschutz/`
//     : "";

//   return (
//     <section className="ks-impressum">
//       <div className="container">
//         <div className="ks-impressum__content">
//           <header className="ks-impressum__head">
//             <h1 className="ks-impressum__title">Impressum</h1>
//           </header>
//           <p className="text-gray-700">
//             <strong>Geltungsbereich:</strong> Dieses Impressum gilt für das
//             Anbieter-Portal <strong>DFSMANAGER</strong>{" "}
//             (Lizenznehmer/Partner-Bereich) unter <strong>{portalUrl}</strong>.
//             <br />
//             Die öffentliche Website (Buchungs-/Kundenseiten) hat ggf. eigene
//             rechtliche Seiten.
//           </p>

//           <h2>Angaben gemäß § 5 DDG</h2>
//           <p>
//             Selcuk Kocyigit
//             <br />
//             Dortmunder Fussballschule
//             <br />
//             Hochfelder Straße 33
//             <br />
//             47226 Duisburg
//             <br />
//             Deutschland
//           </p>

//           <h2>Kontakt</h2>
//           <p>
//             Telefon: <a href="tel:+4917643203362">+49 176 4320 3362</a>
//             <br />
//             E-Mail:{" "}
//             <a href="mailto:fussballschule@selcuk-kocyigit.de">
//               fussballschule@selcuk-kocyigit.de
//             </a>
//           </p>

//           <h2>Haftung für Inhalte</h2>
//           <p>
//             Wir pflegen die Inhalte dieses Portals sorgfältig. Trotzdem können
//             wir keine Gewähr dafür übernehmen, dass sämtliche Informationen
//             jederzeit vollständig, korrekt oder aktuell sind. Für eigene Inhalte
//             sind wir nach den gesetzlichen Vorschriften verantwortlich. Eine
//             allgemeine Pflicht, übermittelte oder gespeicherte fremde
//             Informationen zu überwachen, besteht nicht.
//           </p>

//           <h2>Externe Links</h2>
//           <p>
//             Dieses Portal kann Verknüpfungen zu externen Seiten Dritter
//             enthalten. Auf deren Inhalte haben wir keinen Einfluss. Deshalb
//             können wir hierfür keine Verantwortung übernehmen. Zum Zeitpunkt der
//             Verlinkung waren keine rechtswidrigen Inhalte erkennbar.
//             Verantwortlich ist jeweils der Anbieter der verlinkten Seite.
//           </p>

//           <h2>Urheberrecht</h2>
//           <p>
//             Texte, Bilder, Grafiken und Gestaltung dieses Portals sind
//             urheberrechtlich geschützt. Jede Nutzung außerhalb der gesetzlichen
//             Schranken (z. B. Vervielfältigung, Bearbeitung oder
//             Veröffentlichung) erfordert unsere vorherige Zustimmung. Inhalte von
//             Dritten sind – sofern vorhanden – als solche gekennzeichnet; die
//             Rechte liegen bei den jeweiligen Rechteinhabern.
//           </p>

//           <h2>Datenschutz</h2>
//           <p>
//             Hinweise zum Umgang mit personenbezogenen Daten findest du in
//             unserer <a href={privacyUrl}>Datenschutzerklärung</a>
//             {publicPrivacyUrl ? (
//               <>
//                 {" "}
//                 (öffentliche Website:{" "}
//                 <a href={publicPrivacyUrl} target="_blank" rel="noreferrer">
//                   Datenschutzerklärung
//                 </a>
//                 ).
//               </>
//             ) : (
//               "."
//             )}
//           </p>

//           <h2>Verbraucherstreitbeilegung / Universalschlichtungsstelle</h2>
//           <p>
//             Wir sind nicht bereit oder verpflichtet, an
//             Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
//             teilzunehmen.
//           </p>
//         </div>
//       </div>
//     </section>
//   );
// }
