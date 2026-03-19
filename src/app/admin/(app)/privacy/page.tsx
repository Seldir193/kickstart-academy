// src/app/admin/privacy/page.tsx
export default function AdminPrivacyPage() {
  return (
    <section className="ks-privacy">
      <div className="container">
        <div className="ks-privacy__content">
          <header className="ks-privacy__head">
            <h1 className="ks-privacy__title">
              Datenschutzerklärung (Anbieter-Portal)
            </h1>
          </header>
          <h2>1. Datenschutz auf einen Blick</h2>
          <h3>Worum geht es hier?</h3>
          <p>
            Diese Datenschutzerklärung gilt für unser internes
            Anbieter-/Lizenznehmer-Portal („Portal“). Das Portal richtet sich an
            registrierte Nutzer (z.&nbsp;B. Lizenznehmer, Mitarbeiter,
            Administratoren), um Angebote zu erstellen, Buchungen zu verwalten,
            Rechnungen/Dokumente zu erzeugen (PDF/CSV), sowie Inhalte wie News
            oder Trainerprofile zu pflegen.
          </p>

          <h3>Welche Daten verarbeiten wir?</h3>
          <ul>
            <li>
              <strong>Account-/Login-Daten:</strong> Name (falls hinterlegt),
              E-Mail, Passwort-Hash, Rollen/Rechte, Session-/Token-Daten.
            </li>
            <li>
              <strong>Portal-Inhalte:</strong> Angebote/Kurse, Texte, Medien
              (Uploads), Einstellungen.
            </li>
            <li>
              <strong>Geschäftsdaten:</strong> Buchungen, Stornos, Kündigungen,
              Rechnungsdaten, Dokumente (PDF/CSV), ggf. DATEV-Exportdaten.
            </li>
            <li>
              <strong>Kundendaten (Endkunden):</strong> sofern Lizenznehmer im
              Portal Kundendaten verwalten (z.&nbsp;B. Teilnehmer, Kontaktdaten,
              Buchungshistorie).
            </li>
            <li>
              <strong>Technische Daten:</strong> IP-Adresse, Logfiles,
              Browser-/Geräteinfos, Zeitstempel, Fehlermeldungen.
            </li>
          </ul>

          <h3>Wofür nutzen wir die Daten?</h3>
          <ul>
            <li>
              Bereitstellung des Portals, Nutzerverwaltung, Login/Sicherheit
            </li>
            <li>
              Durchführung/Verwaltung von Angeboten, Buchungen, Rechnungen,
              Dokumenten
            </li>
            <li>Support, Kommunikation, Fehleranalyse und Systemstabilität</li>
            <li>
              Erfüllung rechtlicher Pflichten (z.&nbsp;B.
              Aufbewahrungspflichten)
            </li>
          </ul>

          <h3>Rechtsgrundlagen</h3>
          <ul>
            <li>
              <strong>Art. 6 Abs. 1 lit. b DSGVO</strong>{" "}
              (Vertrag/Vertragsanbahnung): Portalbereitstellung, Account,
              Buchungs-/Rechnungsprozesse.
            </li>
            <li>
              <strong>Art. 6 Abs. 1 lit. c DSGVO</strong> (rechtliche Pflicht):
              z.&nbsp;B. handels-/steuerrechtliche Aufbewahrung.
            </li>
            <li>
              <strong>Art. 6 Abs. 1 lit. f DSGVO</strong> (berechtigtes
              Interesse): IT-Sicherheit, Missbrauchs-/Betrugsprävention,
              Fehlerdiagnose, Systemstabilität.
            </li>
            <li>
              <strong>Art. 6 Abs. 1 lit. a DSGVO</strong> (Einwilligung), falls
              wir optional Analyse-/Marketing-Tools einsetzen (derzeit: nur
              falls aktiviert).
            </li>
          </ul>

          <hr className="ks-privacy__hr" />

          <h2>2. Hinweis zur verantwortlichen Stelle</h2>
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
            Telefon: +49 (0) 176 4320 3362
            <br />
            E-Mail:{" "}
            <a href="mailto:fussballschule@selcuk-kocyigit.de">
              fussballschule@selcuk-kocyigit.de
            </a>
          </p>

          <h2>3. Rollen im Portal (wichtig)</h2>
          <p>
            Je nach Nutzung kann es sein, dass <strong>Lizenznehmer</strong> im
            Portal Daten ihrer eigenen Endkunden (z.&nbsp;B. Teilnehmer)
            verwalten. In diesem Fall sind Lizenznehmer ggf.
            <strong> eigenständige Verantwortliche</strong> für diese
            Endkundendaten. Wir stellen als Portalbetreiber die technische
            Plattform bereit und verarbeiten Daten zur Bereitstellung des
            Portals und zur Vertragserfüllung.
          </p>
          <p>
            Hinweis: Ob zusätzlich eine{" "}
            <strong>Auftragsverarbeitung (AVV/DPA)</strong> erforderlich ist,
            hängt vom konkreten Setup und den Verantwortlichkeiten ab.
          </p>

          <hr className="ks-privacy__hr" />

          <h2>4. Hosting, Infrastruktur und Dienstleister</h2>
          <p>
            Wir betreiben/hosten das Portal und die zugehörige API/DB über
            technische Dienstleister. Dabei können personenbezogene Daten
            verarbeitet werden.
          </p>

          <h3>Hosting/Server</h3>
          <p>
            Anbieter: <strong>[Hosting-Anbieter eintragen]</strong>
            <br />
            Adresse: <strong>[Adresse eintragen]</strong>
            <br />
            Datenschutzhinweise: <strong>[Link eintragen]</strong>
          </p>

          <h3>Datenbank / Speicherung</h3>
          <p>
            Datenbank: <strong>[z.B. MongoDB Atlas / eigener Server]</strong>
            <br />
            Anbieter/Ort: <strong>[eintragen]</strong>
          </p>

          <h3>Auftragsverarbeitung</h3>
          <p>
            Sofern erforderlich, schließen wir mit Dienstleistern Verträge zur
            Auftragsverarbeitung (AVV) nach Art. 28 DSGVO.
          </p>

          <hr className="ks-privacy__hr" />

          <h2>5. Login, Sessions, Cookies</h2>
          <p>
            Für den Betrieb des Portals nutzen wir technisch notwendige
            Cookies/Token, um Anmeldungen (Session) und Sicherheitsfunktionen zu
            ermöglichen. Ohne diese Funktionen kann das Portal nicht zuverlässig
            betrieben werden.
          </p>

          <h2>6. Protokollierung (Logfiles) &amp; Sicherheit</h2>
          <p>
            Zur Sicherstellung von Stabilität und Sicherheit verarbeiten wir
            Logdaten (z.&nbsp;B. IP-Adresse, Zeitstempel, angeforderte
            Ressourcen, Statuscodes). Das erfolgt auf Grundlage von Art. 6 Abs.
            1 lit. f DSGVO (berechtigtes Interesse an IT-Sicherheit und
            Missbrauchsprävention).
          </p>

          <h2>7. Empfänger von Daten</h2>
          <ul>
            <li>IT-/Hosting-Dienstleister (Serverbetrieb, Wartung)</li>
            <li>
              Zahlungs-/Buchhaltungsprozesse (z.&nbsp;B. DATEV-Export) nur,
              sofern du das im Portal nutzt und entsprechend konfiguriert hast
            </li>
            <li>
              Behörden/öffentliche Stellen, wenn eine rechtliche Pflicht besteht
            </li>
          </ul>

          <h2>8. Drittlandübermittlung</h2>
          <p>
            Sofern Dienstleister außerhalb der EU/des EWR eingesetzt werden,
            stellen wir ein angemessenes Datenschutzniveau sicher (z.&nbsp;B.
            EU-Standardvertragsklauseln).
          </p>

          <h2>9. Speicherdauer</h2>
          <p>
            Wir speichern personenbezogene Daten nur so lange, wie es für die
            genannten Zwecke erforderlich ist oder gesetzliche
            Aufbewahrungspflichten bestehen (z.&nbsp;B.
            steuer-/handelsrechtlich).
          </p>

          <h2>10. Ihre Rechte</h2>
          <p>
            Sie haben – soweit anwendbar – das Recht auf Auskunft, Berichtigung,
            Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit sowie
            Widerspruch. Außerdem besteht ein Beschwerderecht bei einer
            Datenschutzaufsichtsbehörde.
          </p>

          <h2>11. Kontakt zum Datenschutz</h2>
          <p>
            Bei Fragen zum Datenschutz wenden Sie sich bitte an{" "}
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
