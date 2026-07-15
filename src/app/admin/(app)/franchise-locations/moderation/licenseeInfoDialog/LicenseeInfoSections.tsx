import type { TFunction } from "i18next";
import LicenseeInfoRow from "./LicenseeInfoRow";
import { displayValue, statusClass } from "./licenseeInfoDialog.helpers";
import type { LicenseeInfoSections } from "./licenseeInfoDialog.types";

type Props = { sections: LicenseeInfoSections; t: TFunction };

type Field = {
  key: string;
  value: unknown;
  mono?: boolean;
  multiline?: boolean;
};

export function LicenseeInfoSectionGrid({ sections, t }: Props) {
  return (
    <div className="fl-info__grid">
      <LocationSection sections={sections} t={t} />
      <ContactSection sections={sections} t={t} />
      <StatusSection sections={sections} t={t} />
      <RejectionSection sections={sections} t={t} />
    </div>
  );
}

function LocationSection({ sections, t }: Props) {
  return (
    <InfoSection
      title={sectionLabel(t, "location")}
      fields={locationFields(sections)}
      t={t}
    />
  );
}

function ContactSection({ sections, t }: Props) {
  return (
    <InfoSection
      title={sectionLabel(t, "contact")}
      fields={contactFields(sections)}
      t={t}
    />
  );
}

function StatusSection({ sections, t }: Props) {
  return (
    <section className="dialog-section fl-info__section fl-info__section--status">
      <SectionHead title={sectionLabel(t, "status")} />
      <div className="dialog-section__body fl-info__list">
        <StatusRow status={sections.meta.status} t={t} />
        <LicenseeInfoRow
          label={fieldLabel(t, "updated")}
          value={sections.meta.updated}
          mono
        />
      </div>
    </section>
  );
}

function RejectionSection({ sections, t }: Props) {
  if (!sections.reject) return null;
  return (
    <InfoSection
      title={sectionLabel(t, "rejection")}
      fields={[
        { key: "reason", value: sections.reject.reason, multiline: true },
      ]}
      t={t}
      danger
    />
  );
}

function InfoSection(props: {
  title: string;
  fields: Field[];
  t: TFunction;
  danger?: boolean;
}) {
  const className = `dialog-section fl-info__section${props.danger ? " fl-info__section--danger" : ""}`;
  return (
    <section className={className}>
      <SectionHead title={props.title} />
      <div className="dialog-section__body fl-info__list">
        {props.fields.map((field) => (
          <FieldRow key={field.key} field={field} t={props.t} />
        ))}
      </div>
    </section>
  );
}

function FieldRow({ field, t }: { field: Field; t: TFunction }) {
  const { key, ...rowProps } = field;
  return <LicenseeInfoRow label={fieldLabel(t, key)} {...rowProps} />;
}

function SectionHead({ title }: { title: string }) {
  return (
    <div className="dialog-section__head">
      <div className="dialog-section__title">{title}</div>
    </div>
  );
}

function StatusRow({ status, t }: { status: string; t: TFunction }) {
  return (
    <div className="fl-info__status-row">
      <div className="dialog-label">{fieldLabel(t, "status")}</div>
      <div className="dialog-value">
        <span className={`dialog-status ${statusClass(status)}`}>
          {displayValue(status)}
        </span>
      </div>
    </div>
  );
}

function locationFields(sections: LicenseeInfoSections): Field[] {
  return [
    { key: "firstName", value: sections.location.firstName },
    { key: "lastName", value: sections.location.lastName },
    { key: "country", value: sections.location.country },
    { key: "city", value: sections.location.city },
    { key: "state", value: sections.location.state },
    { key: "zip", value: sections.location.zip, mono: true },
    { key: "address", value: sections.location.address, multiline: true },
  ];
}

function contactFields(sections: LicenseeInfoSections): Field[] {
  return [
    { key: "website", value: sections.contact.website },
    { key: "publicEmail", value: sections.contact.emailPublic, mono: true },
    { key: "publicPhone", value: sections.contact.phonePublic, mono: true },
  ];
}

function sectionLabel(t: TFunction, key: string) {
  return t(`common.admin.franchiseLocations.infoDialog.sections.${key}`);
}

function fieldLabel(t: TFunction, key: string) {
  return t(`common.admin.franchiseLocations.infoDialog.fields.${key}`);
}
