import type { TFunction } from "i18next";

type Props = { t: TFunction };
type HeadingLevel = 2 | 3;
type KeyPair = { textKey: string; titleKey: string };

const dataItems: KeyPair[] = [
  {
    titleKey: "common.privacy.data.accountTitle",
    textKey: "common.privacy.data.accountText",
  },
  {
    titleKey: "common.privacy.data.portalContentTitle",
    textKey: "common.privacy.data.portalContentText",
  },
  {
    titleKey: "common.privacy.data.businessTitle",
    textKey: "common.privacy.data.businessText",
  },
  {
    titleKey: "common.privacy.data.customerTitle",
    textKey: "common.privacy.data.customerText",
  },
  {
    titleKey: "common.privacy.data.technicalTitle",
    textKey: "common.privacy.data.technicalText",
  },
];

const usageKeys = [
  "common.privacy.usage.portal",
  "common.privacy.usage.operations",
  "common.privacy.usage.support",
  "common.privacy.usage.legal",
];

const legalItems: KeyPair[] = [
  {
    titleKey: "common.privacy.legal.contractTitle",
    textKey: "common.privacy.legal.contractText",
  },
  {
    titleKey: "common.privacy.legal.obligationTitle",
    textKey: "common.privacy.legal.obligationText",
  },
  {
    titleKey: "common.privacy.legal.legitimateTitle",
    textKey: "common.privacy.legal.legitimateText",
  },
  {
    titleKey: "common.privacy.legal.consentTitle",
    textKey: "common.privacy.legal.consentText",
  },
];

const recipientKeys = [
  "common.privacy.recipients.hosting",
  "common.privacy.recipients.accounting",
  "common.privacy.recipients.authorities",
];

function Heading({ level, text }: { level: HeadingLevel; text: string }) {
  return level === 2 ? <h2>{text}</h2> : <h3>{text}</h3>;
}

type TextSectionProps = Props & {
  level: HeadingLevel;
  textKey: string;
  titleKey: string;
};

function TextSection({ level, textKey, titleKey, t }: TextSectionProps) {
  return (
    <>
      <Heading level={level} text={t(titleKey)} />
      <p>{t(textKey)}</p>
    </>
  );
}

type ListSectionProps = Props & {
  itemKeys: string[];
  level: HeadingLevel;
  titleKey: string;
};

function ListSection({ itemKeys, level, titleKey, t }: ListSectionProps) {
  return (
    <>
      <Heading level={level} text={t(titleKey)} />
      <ul>
        {itemKeys.map((key) => (
          <li key={key}>{t(key)}</li>
        ))}
      </ul>
    </>
  );
}

function LabeledListSection({
  items,
  titleKey,
  t,
}: Props & { items: KeyPair[]; titleKey: string }) {
  return (
    <>
      <h3>{t(titleKey)}</h3>
      <ul>
        {items.map((item) => (
          <li key={item.titleKey}>
            <strong>{t(item.titleKey)}</strong> {t(item.textKey)}
          </li>
        ))}
      </ul>
    </>
  );
}

function PrivacyHeader({ t }: Props) {
  return (
    <header className="ks-privacy__head">
      <h1 className="ks-privacy__title">{t("common.privacy.title")}</h1>
    </header>
  );
}

function OverviewSections({ t }: Props) {
  return (
    <>
      <h2>{t("common.privacy.section.overview")}</h2>
      <TextSection
        level={3}
        titleKey="common.privacy.section.whatIsThis"
        textKey="common.privacy.whatIsThisText"
        t={t}
      />
      <LabeledListSection
        titleKey="common.privacy.section.whichData"
        items={dataItems}
        t={t}
      />
      <ListSection
        level={3}
        titleKey="common.privacy.section.usage"
        itemKeys={usageKeys}
        t={t}
      />
      <LabeledListSection
        titleKey="common.privacy.section.legalBasis"
        items={legalItems}
        t={t}
      />
    </>
  );
}

function ControllerAddress({ t }: Props) {
  return (
    <>
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
    </>
  );
}

function ControllerContact({ t }: Props) {
  return (
    <p>
      {t("common.privacy.phone")}: +49 (0) 176 4320 3362
      <br />
      {t("common.privacy.email")}:{" "}
      <a href="mailto:fussballschule@selcuk-kocyigit.de">
        fussballschule@selcuk-kocyigit.de
      </a>
    </p>
  );
}

function ControllerSections({ t }: Props) {
  return (
    <>
      <ControllerAddress t={t} />
      <ControllerContact t={t} />
      <h2>{t("common.privacy.section.roles")}</h2>
      <p>{t("common.privacy.rolesText")}</p>
      <p>{t("common.privacy.rolesNote")}</p>
    </>
  );
}

function ServerHostingSection({ t }: Props) {
  return (
    <>
      <h3>{t("common.privacy.section.serverHosting")}</h3>
      <p>
        {t("common.privacy.hosting.provider")}:{" "}
        <strong>[Hosting-Anbieter eintragen]</strong>
        <br />
        {t("common.privacy.hosting.address")}:{" "}
        <strong>[Adresse eintragen]</strong>
        <br />
        {t("common.privacy.hosting.notice")}: <strong>[Link eintragen]</strong>
      </p>
    </>
  );
}

function DatabaseSection({ t }: Props) {
  return (
    <>
      <h3>{t("common.privacy.section.database")}</h3>
      <p>
        {t("common.privacy.database.type")}:{" "}
        <strong>[z.B. MongoDB Atlas / eigener Server]</strong>
        <br />
        {t("common.privacy.database.providerPlace")}:{" "}
        <strong>[eintragen]</strong>
      </p>
    </>
  );
}

function HostingSections({ t }: Props) {
  return (
    <>
      <TextSection
        level={2}
        titleKey="common.privacy.section.hosting"
        textKey="common.privacy.hostingIntro"
        t={t}
      />
      <ServerHostingSection t={t} />
      <DatabaseSection t={t} />
      <TextSection
        level={3}
        titleKey="common.privacy.section.processing"
        textKey="common.privacy.processingText"
        t={t}
      />
    </>
  );
}

function RightsSections({ t }: Props) {
  return (
    <>
      <TextSection
        level={2}
        titleKey="common.privacy.section.login"
        textKey="common.privacy.loginText"
        t={t}
      />
      <TextSection
        level={2}
        titleKey="common.privacy.section.logs"
        textKey="common.privacy.logsText"
        t={t}
      />
      <ListSection
        level={2}
        titleKey="common.privacy.section.recipients"
        itemKeys={recipientKeys}
        t={t}
      />
      <TextSection
        level={2}
        titleKey="common.privacy.section.thirdCountry"
        textKey="common.privacy.thirdCountryText"
        t={t}
      />
      <TextSection
        level={2}
        titleKey="common.privacy.section.retention"
        textKey="common.privacy.retentionText"
        t={t}
      />
      <TextSection
        level={2}
        titleKey="common.privacy.section.rights"
        textKey="common.privacy.rightsText"
        t={t}
      />
    </>
  );
}

function DataProtectionContact({ t }: Props) {
  return (
    <>
      <h2>{t("common.privacy.section.contactDataProtection")}</h2>
      <p>
        {t("common.privacy.contactDataProtectionText")}{" "}
        <a href="mailto:fussballschule@selcuk-kocyigit.de">
          fussballschule@selcuk-kocyigit.de
        </a>
        .
      </p>
    </>
  );
}

function PrivacyIntroSections({ t }: Props) {
  return (
    <>
      <PrivacyHeader t={t} />
      <OverviewSections t={t} />
      <hr className="ks-privacy__hr" />
      <ControllerSections t={t} />
      <hr className="ks-privacy__hr" />
    </>
  );
}

function PrivacyDetailSections({ t }: Props) {
  return (
    <>
      <HostingSections t={t} />
      <hr className="ks-privacy__hr" />
      <RightsSections t={t} />
      <DataProtectionContact t={t} />
    </>
  );
}

function PrivacyArticle({ t }: Props) {
  return (
    <div className="ks-privacy__content">
      <PrivacyIntroSections t={t} />
      <PrivacyDetailSections t={t} />
    </div>
  );
}

export default function PrivacyContent({ t }: Props) {
  return (
    <section className="ks-privacy">
      <div className="container">
        <PrivacyArticle t={t} />
      </div>
    </section>
  );
}
