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

// // src/app/admin/privacy/page.tsx
// export default function AdminPrivacyPage() {
//   return (
//     <section className="ks-privacy">
//       <div className="container">
//         <div className="ks-privacy__content">
//           <header className="ks-privacy__head">
//             <h1 className="ks-privacy__title">
//               Datenschutzerklärung (Anbieter-Portal)
//             </h1>
//           </header>
//           <h2>1. Datenschutz auf einen Blick</h2>
//           <h3>Worum geht es hier?</h3>
//           <p>
//             Diese Datenschutzerklärung gilt für unser internes
//             Anbieter-/Lizenznehmer-Portal („Portal“). Das Portal richtet sich an
//             registrierte Nutzer (z.&nbsp;B. Lizenznehmer, Mitarbeiter,
//             Administratoren), um Angebote zu erstellen, Buchungen zu verwalten,
//             Rechnungen/Dokumente zu erzeugen (PDF/CSV), sowie Inhalte wie News
//             oder Trainerprofile zu pflegen.
//           </p>

//           <h3>Welche Daten verarbeiten wir?</h3>
//           <ul>
//             <li>
//               <strong>Account-/Login-Daten:</strong> Name (falls hinterlegt),
//               E-Mail, Passwort-Hash, Rollen/Rechte, Session-/Token-Daten.
//             </li>
//             <li>
//               <strong>Portal-Inhalte:</strong> Angebote/Kurse, Texte, Medien
//               (Uploads), Einstellungen.
//             </li>
//             <li>
//               <strong>Geschäftsdaten:</strong> Buchungen, Stornos, Kündigungen,
//               Rechnungsdaten, Dokumente (PDF/CSV), ggf. DATEV-Exportdaten.
//             </li>
//             <li>
//               <strong>Kundendaten (Endkunden):</strong> sofern Lizenznehmer im
//               Portal Kundendaten verwalten (z.&nbsp;B. Teilnehmer, Kontaktdaten,
//               Buchungshistorie).
//             </li>
//             <li>
//               <strong>Technische Daten:</strong> IP-Adresse, Logfiles,
//               Browser-/Geräteinfos, Zeitstempel, Fehlermeldungen.
//             </li>
//           </ul>

//           <h3>Wofür nutzen wir die Daten?</h3>
//           <ul>
//             <li>
//               Bereitstellung des Portals, Nutzerverwaltung, Login/Sicherheit
//             </li>
//             <li>
//               Durchführung/Verwaltung von Angeboten, Buchungen, Rechnungen,
//               Dokumenten
//             </li>
//             <li>Support, Kommunikation, Fehleranalyse und Systemstabilität</li>
//             <li>
//               Erfüllung rechtlicher Pflichten (z.&nbsp;B.
//               Aufbewahrungspflichten)
//             </li>
//           </ul>

//           <h3>Rechtsgrundlagen</h3>
//           <ul>
//             <li>
//               <strong>Art. 6 Abs. 1 lit. b DSGVO</strong>{" "}
//               (Vertrag/Vertragsanbahnung): Portalbereitstellung, Account,
//               Buchungs-/Rechnungsprozesse.
//             </li>
//             <li>
//               <strong>Art. 6 Abs. 1 lit. c DSGVO</strong> (rechtliche Pflicht):
//               z.&nbsp;B. handels-/steuerrechtliche Aufbewahrung.
//             </li>
//             <li>
//               <strong>Art. 6 Abs. 1 lit. f DSGVO</strong> (berechtigtes
//               Interesse): IT-Sicherheit, Missbrauchs-/Betrugsprävention,
//               Fehlerdiagnose, Systemstabilität.
//             </li>
//             <li>
//               <strong>Art. 6 Abs. 1 lit. a DSGVO</strong> (Einwilligung), falls
//               wir optional Analyse-/Marketing-Tools einsetzen (derzeit: nur
//               falls aktiviert).
//             </li>
//           </ul>

//           <hr className="ks-privacy__hr" />

//           <h2>2. Hinweis zur verantwortlichen Stelle</h2>
//           <p>
//             <strong>Selcuk Kocyigit</strong>
//             <br />
//             Hochfelder Straße 33
//             <br />
//             47226 Duisburg
//             <br />
//             Deutschland
//           </p>
//           <p>
//             Telefon: +49 (0) 176 4320 3362
//             <br />
//             E-Mail:{" "}
//             <a href="mailto:fussballschule@selcuk-kocyigit.de">
//               fussballschule@selcuk-kocyigit.de
//             </a>
//           </p>

//           <h2>3. Rollen im Portal (wichtig)</h2>
//           <p>
//             Je nach Nutzung kann es sein, dass <strong>Lizenznehmer</strong> im
//             Portal Daten ihrer eigenen Endkunden (z.&nbsp;B. Teilnehmer)
//             verwalten. In diesem Fall sind Lizenznehmer ggf.
//             <strong> eigenständige Verantwortliche</strong> für diese
//             Endkundendaten. Wir stellen als Portalbetreiber die technische
//             Plattform bereit und verarbeiten Daten zur Bereitstellung des
//             Portals und zur Vertragserfüllung.
//           </p>
//           <p>
//             Hinweis: Ob zusätzlich eine{" "}
//             <strong>Auftragsverarbeitung (AVV/DPA)</strong> erforderlich ist,
//             hängt vom konkreten Setup und den Verantwortlichkeiten ab.
//           </p>

//           <hr className="ks-privacy__hr" />

//           <h2>4. Hosting, Infrastruktur und Dienstleister</h2>
//           <p>
//             Wir betreiben/hosten das Portal und die zugehörige API/DB über
//             technische Dienstleister. Dabei können personenbezogene Daten
//             verarbeitet werden.
//           </p>

//           <h3>Hosting/Server</h3>
//           <p>
//             Anbieter: <strong>[Hosting-Anbieter eintragen]</strong>
//             <br />
//             Adresse: <strong>[Adresse eintragen]</strong>
//             <br />
//             Datenschutzhinweise: <strong>[Link eintragen]</strong>
//           </p>

//           <h3>Datenbank / Speicherung</h3>
//           <p>
//             Datenbank: <strong>[z.B. MongoDB Atlas / eigener Server]</strong>
//             <br />
//             Anbieter/Ort: <strong>[eintragen]</strong>
//           </p>

//           <h3>Auftragsverarbeitung</h3>
//           <p>
//             Sofern erforderlich, schließen wir mit Dienstleistern Verträge zur
//             Auftragsverarbeitung (AVV) nach Art. 28 DSGVO.
//           </p>

//           <hr className="ks-privacy__hr" />

//           <h2>5. Login, Sessions, Cookies</h2>
//           <p>
//             Für den Betrieb des Portals nutzen wir technisch notwendige
//             Cookies/Token, um Anmeldungen (Session) und Sicherheitsfunktionen zu
//             ermöglichen. Ohne diese Funktionen kann das Portal nicht zuverlässig
//             betrieben werden.
//           </p>

//           <h2>6. Protokollierung (Logfiles) &amp; Sicherheit</h2>
//           <p>
//             Zur Sicherstellung von Stabilität und Sicherheit verarbeiten wir
//             Logdaten (z.&nbsp;B. IP-Adresse, Zeitstempel, angeforderte
//             Ressourcen, Statuscodes). Das erfolgt auf Grundlage von Art. 6 Abs.
//             1 lit. f DSGVO (berechtigtes Interesse an IT-Sicherheit und
//             Missbrauchsprävention).
//           </p>

//           <h2>7. Empfänger von Daten</h2>
//           <ul>
//             <li>IT-/Hosting-Dienstleister (Serverbetrieb, Wartung)</li>
//             <li>
//               Zahlungs-/Buchhaltungsprozesse (z.&nbsp;B. DATEV-Export) nur,
//               sofern du das im Portal nutzt und entsprechend konfiguriert hast
//             </li>
//             <li>
//               Behörden/öffentliche Stellen, wenn eine rechtliche Pflicht besteht
//             </li>
//           </ul>

//           <h2>8. Drittlandübermittlung</h2>
//           <p>
//             Sofern Dienstleister außerhalb der EU/des EWR eingesetzt werden,
//             stellen wir ein angemessenes Datenschutzniveau sicher (z.&nbsp;B.
//             EU-Standardvertragsklauseln).
//           </p>

//           <h2>9. Speicherdauer</h2>
//           <p>
//             Wir speichern personenbezogene Daten nur so lange, wie es für die
//             genannten Zwecke erforderlich ist oder gesetzliche
//             Aufbewahrungspflichten bestehen (z.&nbsp;B.
//             steuer-/handelsrechtlich).
//           </p>

//           <h2>10. Ihre Rechte</h2>
//           <p>
//             Sie haben – soweit anwendbar – das Recht auf Auskunft, Berichtigung,
//             Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit sowie
//             Widerspruch. Außerdem besteht ein Beschwerderecht bei einer
//             Datenschutzaufsichtsbehörde.
//           </p>

//           <h2>11. Kontakt zum Datenschutz</h2>
//           <p>
//             Bei Fragen zum Datenschutz wenden Sie sich bitte an{" "}
//             <a href="mailto:fussballschule@selcuk-kocyigit.de">
//               fussballschule@selcuk-kocyigit.de
//             </a>
//             .
//           </p>
//         </div>
//       </div>
//     </section>
//   );
// }
