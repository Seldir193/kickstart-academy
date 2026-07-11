import type { TFunction } from "i18next";
import { LicenseeInfoSectionGrid } from "./LicenseeInfoSections";
import type { LicenseeInfoSections } from "./licenseeInfoDialog.types";

type Props = {
  sections: LicenseeInfoSections;
  onClose: () => void;
  t: TFunction;
};

export default function LicenseeInfoDialogView({ sections, onClose, t }: Props) {
  const closeLabel = t("common.admin.franchiseLocations.infoDialog.close");
  return (
    <div className="dialog-backdrop fl-info" role="dialog" aria-modal="true">
      <button type="button" className="dialog-backdrop-hit fl-info__backdrop-hit" aria-label={closeLabel} onClick={onClose} />
      <div className="dialog fl-info__dialog">
        <DialogHead title={sections.header.title} closeLabel={closeLabel} onClose={onClose} t={t} />
        <div className="dialog-body fl-info__body">
          <LicenseeInfoSectionGrid sections={sections} t={t} />
        </div>
      </div>
    </div>
  );
}

function DialogHead(props: { title: string; closeLabel: string; onClose: () => void; t: TFunction }) {
  return (
    <div className="dialog-head fl-info__head">
      <div className="fl-info__head-left">
        <div className="dialog-title fl-info__title">{props.title}</div>
        <div className="dialog-subtitle fl-info__subtitle">{props.t("common.admin.franchiseLocations.infoDialog.subtitle")}</div>
      </div>
      <CloseButton label={props.closeLabel} onClose={props.onClose} />
    </div>
  );
}

function CloseButton({ label, onClose }: { label: string; onClose: () => void }) {
  return (
    <div className="fl-info__head-right">
      <div className="dialog-head__actions">
        <button type="button" className="dialog-close modal__close" aria-label={label} onClick={onClose}>
          <img src="/icons/close.svg" alt="" aria-hidden="true" className="icon-img" />
        </button>
      </div>
    </div>
  );
}
