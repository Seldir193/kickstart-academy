import type { TFunction } from "i18next";

type Props = { t: TFunction };
type SectionProps = Props & {
  titleKey: string;
  paragraphKeys: readonly string[];
};

function TermsHeader({ t }: Props) {
  return (
    <header className="ks-agb__head">
      <div className="container">
        <h1 className="ks-agb__title">{t("common.terms.title")}</h1>
      </div>
    </header>
  );
}

function TextSection({ t, titleKey, paragraphKeys }: SectionProps) {
  return (
    <>
      <h2>{t(titleKey)}</h2>
      {paragraphKeys.map((key) => <p key={key}>{t(key)}</p>)}
    </>
  );
}

function PrimaryTerms({ t }: Props) {
  return (
    <>
      <TextSection t={t} titleKey="common.terms.section.scope" paragraphKeys={["common.terms.scopeText"]} />
      <TextSection t={t} titleKey="common.terms.section.services" paragraphKeys={["common.terms.servicesText1", "common.terms.servicesText2"]} />
      <TextSection t={t} titleKey="common.terms.section.registration" paragraphKeys={["common.terms.registrationText1", "common.terms.registrationText2"]} />
      <TextSection t={t} titleKey="common.terms.section.duties" paragraphKeys={["common.terms.dutiesText1", "common.terms.dutiesText2"]} />
    </>
  );
}

function ServiceTerms({ t }: Props) {
  return (
    <>
      <TextSection t={t} titleKey="common.terms.section.customerContracts" paragraphKeys={["common.terms.customerContractsText1", "common.terms.customerContractsText2"]} />
      <TextSection t={t} titleKey="common.terms.section.availability" paragraphKeys={["common.terms.availabilityText1", "common.terms.availabilityText2"]} />
      <TextSection t={t} titleKey="common.terms.section.support" paragraphKeys={["common.terms.supportText"]} />
      <PrivacyTerms t={t} />
    </>
  );
}

function PrivacyTerms({ t }: Props) {
  return (
    <>
      <h2>{t("common.terms.section.privacy")}</h2>
      <p>{t("common.terms.privacyText1")}</p>
      <p>
        {t("common.terms.privacyText2BeforeLink")}{" "}
        <a href="/admin/datenschutz">{t("common.terms.privacyLink")}</a>.
      </p>
    </>
  );
}

function ContractTerms({ t }: Props) {
  return (
    <>
      <TextSection t={t} titleKey="common.terms.section.security" paragraphKeys={["common.terms.securityText"]} />
      <TextSection t={t} titleKey="common.terms.section.fees" paragraphKeys={["common.terms.feesText"]} />
      <TextSection t={t} titleKey="common.terms.section.term" paragraphKeys={["common.terms.termText1", "common.terms.termText2"]} />
      <TextSection t={t} titleKey="common.terms.section.liability" paragraphKeys={["common.terms.liabilityText1", "common.terms.liabilityText2", "common.terms.liabilityText3"]} />
    </>
  );
}

function FinalTerms({ t }: Props) {
  return (
    <>
      <TextSection t={t} titleKey="common.terms.section.confidentiality" paragraphKeys={["common.terms.confidentialityText"]} />
      <TextSection t={t} titleKey="common.terms.section.final" paragraphKeys={["common.terms.finalText"]} />
      <p>
        <strong>{t("common.terms.noteTitle")}</strong>{" "}
        {t("common.terms.noteText")}
      </p>
    </>
  );
}

function TermsArticle({ t }: Props) {
  return (
    <div className="ks-agb__content">
      <TermsHeader t={t} />
      <p>{t("common.terms.intro")}</p>
      <PrimaryTerms t={t} />
      <ServiceTerms t={t} />
      <ContractTerms t={t} />
      <FinalTerms t={t} />
    </div>
  );
}

function TermsBody({ t }: Props) {
  return (
    <div className="ks-agb__body">
      <div className="container">
        <TermsArticle t={t} />
      </div>
    </div>
  );
}

export default function TermsContent({ t }: Props) {
  return <section className="ks-agb"><TermsBody t={t} /></section>;
}
