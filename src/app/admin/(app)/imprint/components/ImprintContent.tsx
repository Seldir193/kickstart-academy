import type { TFunction } from "i18next";
import type { ImprintLinks } from "../imprint.helpers";

type Props = { links: ImprintLinks; t: TFunction };
type TranslationProps = { t: TFunction };

function ImprintHeader({ t }: TranslationProps) {
  return (
    <header className="ks-impressum__head">
      <h1 className="ks-impressum__title">{t("common.imprint.title")}</h1>
    </header>
  );
}

function ImprintScope({ links, t }: Props) {
  return (
    <p className="text-gray-700">
      <strong>{t("common.imprint.scopeTitle")}</strong>{" "}
      {t("common.imprint.scopeTextBeforePortal")} <strong>DFSMANAGER</strong>{" "}
      {t("common.imprint.scopeTextAfterPortal")}{" "}
      <strong>{links.portalUrl}</strong>.
      <br />
      {t("common.imprint.scopePublicWebsite")}
    </p>
  );
}

function ImprintAddress({ t }: TranslationProps) {
  return (
    <>
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
    </>
  );
}

function ImprintContact({ t }: TranslationProps) {
  return (
    <>
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
    </>
  );
}

type TextSectionProps = TranslationProps & {
  titleKey: string;
  textKey: string;
};

function TextSection({ t, titleKey, textKey }: TextSectionProps) {
  return (
    <>
      <h2>{t(titleKey)}</h2>
      <p>{t(textKey)}</p>
    </>
  );
}

function LegalTextSections({ t }: TranslationProps) {
  return (
    <>
      <TextSection
        t={t}
        titleKey="common.imprint.section.liabilityContent"
        textKey="common.imprint.liabilityContentText"
      />
      <TextSection
        t={t}
        titleKey="common.imprint.section.externalLinks"
        textKey="common.imprint.externalLinksText"
      />
      <TextSection
        t={t}
        titleKey="common.imprint.section.copyright"
        textKey="common.imprint.copyrightText"
      />
    </>
  );
}

function PublicPrivacyLink({ links, t }: Props) {
  if (!links.publicPrivacyUrl) return <>.</>;
  return (
    <>
      {" "}
      ({t("common.imprint.publicWebsite")}:{" "}
      <a href={links.publicPrivacyUrl} target="_blank" rel="noreferrer">
        {t("common.imprint.privacyPolicy")}
      </a>
      ).
    </>
  );
}

function PrivacySection({ links, t }: Props) {
  return (
    <>
      <h2>{t("common.imprint.section.privacy")}</h2>
      <p>
        {t("common.imprint.privacyTextBeforeLink")}{" "}
        <a href={links.privacyUrl}>{t("common.imprint.privacyPolicy")}</a>
        <PublicPrivacyLink links={links} t={t} />
      </p>
    </>
  );
}

function ImprintIdentity({ links, t }: Props) {
  return (
    <>
      <ImprintHeader t={t} />
      <ImprintScope links={links} t={t} />
      <ImprintAddress t={t} />
      <ImprintContact t={t} />
    </>
  );
}

function ImprintLegal({ links, t }: Props) {
  return (
    <>
      <LegalTextSections t={t} />
      <PrivacySection links={links} t={t} />
      <TextSection
        t={t}
        titleKey="common.imprint.section.consumerDispute"
        textKey="common.imprint.consumerDisputeText"
      />
    </>
  );
}

function ImprintArticle({ links, t }: Props) {
  return (
    <div className="ks-impressum__content">
      <ImprintIdentity links={links} t={t} />
      <ImprintLegal links={links} t={t} />
    </div>
  );
}

export default function ImprintContent({ links, t }: Props) {
  return (
    <section className="ks-impressum">
      <div className="container">
        <ImprintArticle links={links} t={t} />
      </div>
    </section>
  );
}
