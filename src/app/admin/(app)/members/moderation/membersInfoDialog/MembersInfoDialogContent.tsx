"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import type { AdminMember } from "../../api";
import { buildMembersInfoData, getBadgeClass } from "./membersInfoDialog.helpers";
import { MemberAvatarSection, MemberProfileSection } from "./MembersInfoSections";
import type { MembersInfoData, MembersInfoDialogProps } from "./membersInfoDialog.types";

type ViewProps = { data: MembersInfoData; item: AdminMember; onClose: () => void; t: TFunction };

function DialogHeader({ data, item, onClose, t }: ViewProps) {
  return <div className="dialog-head members-info-dialog__head">
    <div className="members-info-dialog__head-main">
      <div className="members-info-dialog__eyebrow">{t("common.admin.members.info.details")}</div>
      <div className="members-info-dialog__title-row"><h2 className="dialog-title members-info-dialog__title">{data.title}</h2><span className={`members-info-dialog__badge ${getBadgeClass(item)}`}>{data.role}</span></div>
      <div className="members-info-dialog__subtitle">{t("common.admin.members.readOnly.label")}</div>
    </div>
    <div className="dialog-head__actions"><button type="button" className="dialog-close" aria-label={t("common.admin.members.info.close")} onClick={onClose}><img src="/icons/close.svg" alt="" aria-hidden="true" className="icon-img" /></button></div>
  </div>;
}

function DialogView(props: ViewProps) {
  return <div className="dialog-backdrop members-info-dialog" role="dialog" aria-modal="true">
    <button type="button" className="dialog-backdrop-hit" aria-label={props.t("common.admin.members.info.close")} onClick={props.onClose} />
    <div className="dialog members-info-dialog__dialog">
      <DialogHeader {...props} />
      <div className="dialog-body members-info-dialog__body"><div className="members-info-dialog__grid">
        <MemberProfileSection data={props.data} t={props.t} />
        <MemberAvatarSection data={props.data} t={props.t} />
      </div></div>
    </div>
  </div>;
}

export default function MembersInfoDialogContent({ open, item, onClose }: MembersInfoDialogProps) {
  const { t } = useTranslation();
  const data = useMemo(() => item ? buildMembersInfoData(t, item) : null, [item, t]);
  if (!open || !item || !data) return null;
  return <DialogView data={data} item={item} onClose={onClose} t={t} />;
}
