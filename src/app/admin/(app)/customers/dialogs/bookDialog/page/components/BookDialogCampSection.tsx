import KsDatePicker from "@/app/admin/(app)/invoices/components/KsDatePicker";
import BookDialogBookingFields from "./BookDialogBookingFields";
import {
  BookingDetailsTitle,
  CampCard,
  DetailsSection,
  SummaryGrid,
} from "./BookDialogDetailsLayout";
import BookDialogTShirtSelect from "./BookDialogTShirtSelect";
import { GenderToggle, GoalkeeperToggle } from "./BookDialogToggleButtons";
import type { BookDialogController } from "../types";

type Props = { controller: BookDialogController };

export default function BookDialogCampSection({ controller }: Props) {
  if (!controller.offers.isCamp) return null;
  return (
    <DetailsSection
      title={controller.t("common.admin.customers.bookDialog.campDetails")}
    >
      <CampCard
        eyebrow={controller.t(
          "common.admin.customers.bookDialog.holidayProgram",
        )}
        title={controller.t("common.admin.customers.bookDialog.campDetails")}
      >
        <CampSummary controller={controller} />
        <MainChildBlock controller={controller} />
        <SiblingBlock controller={controller} />
        <FooterBlock controller={controller} />
      </CampCard>
    </DetailsSection>
  );
}

function CampSummary({ controller }: Props) {
  return (
    <SummaryGrid
      items={[
        {
          label: controller.t("common.admin.customers.bookDialog.holiday"),
          value: controller.offers.holidayLabel || "-",
        },
        {
          label: controller.t("common.admin.customers.bookDialog.period"),
          value: controller.offers.holidayRange || "-",
        },
      ]}
    />
  );
}

function MainChildBlock({ controller }: Props) {
  return (
    <div className="camp-block">
      <div className="camp-block__title">
        {controller.t("common.admin.customers.bookDialog.mainChild")}
      </div>
      <div className="camp-grid">
        <MainTShirtField controller={controller} />
        <MainGoalkeeperField controller={controller} />
      </div>
    </div>
  );
}

function MainTShirtField({ controller }: Props) {
  return (
    <div className="field">
      <label className="dialog-label">
        {controller.t("common.admin.customers.bookDialog.tShirtSize")}
      </label>
      <BookDialogTShirtSelect
        t={controller.t}
        value={controller.details.mainTShirtSize}
        setValue={controller.details.setMainTShirtSize}
        open={controller.dropdowns.isMainTShirtOpen}
        setOpen={controller.dropdowns.setIsMainTShirtOpen}
        rootRef={controller.dropdowns.mainTShirtDropdownRef}
      />
    </div>
  );
}

function MainGoalkeeperField({ controller }: Props) {
  return (
    <div className="field">
      <label className="dialog-label">
        {controller.t("common.admin.customers.bookDialog.goalkeeperSchool")}
      </label>
      <GoalkeeperToggle
        t={controller.t}
        value={controller.details.mainGoalkeeperSchool}
        setValue={controller.details.setMainGoalkeeperSchool}
      />
    </div>
  );
}

function SiblingBlock({ controller }: Props) {
  return (
    <div className="camp-block camp-block--sibling">
      <SiblingHead controller={controller} />
      {controller.details.hasSibling && (
        <SiblingFields controller={controller} />
      )}
    </div>
  );
}

function SiblingHead({ controller }: Props) {
  return (
    <div className="sibling-head">
      <div>
        <div className="camp-block__title">
          {controller.t("common.admin.customers.bookDialog.addSibling")}
        </div>
        <div className="sibling-head__subline">
          {controller.t(
            "common.admin.customers.bookDialog.optionalSiblingDiscount",
          )}
        </div>
      </div>
      <label className="sibling-switch">
        <input
          type="checkbox"
          checked={controller.details.hasSibling}
          onChange={(event) =>
            controller.details.setHasSibling(event.target.checked)
          }
        />
        <span className="sibling-switch__text">
          {controller.t("common.admin.customers.bookDialog.yesGet14Discount")}
        </span>
      </label>
    </div>
  );
}

function SiblingFields({ controller }: Props) {
  return (
    <div className="sibling-fields is-open">
      <SiblingMetaGrid controller={controller} />
      <SiblingNameGrid controller={controller} />
      <SiblingOptionsGrid controller={controller} />
    </div>
  );
}

function SiblingMetaGrid({ controller }: Props) {
  return (
    <div className="camp-grid">
      <div className="field">
        <label className="dialog-label">
          {controller.t("common.admin.customers.bookDialog.gender")}
        </label>
        <GenderToggle
          t={controller.t}
          value={controller.details.siblingGender}
          setValue={controller.details.setSiblingGender}
        />
      </div>
      <div className="field">
        <label className="dialog-label">
          {controller.t("common.admin.customers.bookDialog.birthDate")}
        </label>
        <KsDatePicker
          value={controller.details.siblingBirthDate}
          onChange={(nextIso) =>
            controller.details.setSiblingBirthDate(nextIso)
          }
          placeholder={controller.t("common.placeholders.date")}
          disabled={false}
        />
      </div>
    </div>
  );
}

function SiblingNameGrid({ controller }: Props) {
  return (
    <div className="camp-grid">
      <NameField
        controller={controller}
        label={controller.t("common.admin.customers.bookDialog.firstName")}
        value={controller.details.siblingFirstName}
        setValue={controller.details.setSiblingFirstName}
      />
      <NameField
        controller={controller}
        label={controller.t("common.admin.customers.bookDialog.lastName")}
        value={controller.details.siblingLastName}
        setValue={controller.details.setSiblingLastName}
      />
    </div>
  );
}

function NameField({
  label,
  value,
  setValue,
}: {
  controller: BookDialogController;
  label: string;
  value: string;
  setValue: (value: string) => void;
}) {
  return (
    <div className="field">
      <label className="dialog-label">{label}</label>
      <input
        className="input"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
    </div>
  );
}

function SiblingOptionsGrid({ controller }: Props) {
  return (
    <div className="camp-grid">
      <SiblingTShirtField controller={controller} />
      <SiblingGoalkeeperField controller={controller} />
    </div>
  );
}

function SiblingTShirtField({ controller }: Props) {
  return (
    <div className="field">
      <label className="dialog-label">
        {controller.t("common.admin.customers.bookDialog.tShirtSize")}
      </label>
      <BookDialogTShirtSelect
        t={controller.t}
        value={controller.details.siblingTShirtSize}
        setValue={controller.details.setSiblingTShirtSize}
        open={controller.dropdowns.isSiblingTShirtOpen}
        setOpen={controller.dropdowns.setIsSiblingTShirtOpen}
        rootRef={controller.dropdowns.siblingTShirtDropdownRef}
      />
    </div>
  );
}

function SiblingGoalkeeperField({ controller }: Props) {
  return (
    <div className="field">
      <label className="dialog-label">
        {controller.t("common.admin.customers.bookDialog.goalkeeperSchool")}
      </label>
      <GoalkeeperToggle
        t={controller.t}
        value={controller.details.siblingGoalkeeperSchool}
        setValue={controller.details.setSiblingGoalkeeperSchool}
      />
    </div>
  );
}

function FooterBlock({ controller }: Props) {
  return (
    <div className="camp-block camp-block--footer">
      <BookingDetailsTitle t={controller.t} />
      <BookDialogBookingFields controller={controller} />
    </div>
  );
}
