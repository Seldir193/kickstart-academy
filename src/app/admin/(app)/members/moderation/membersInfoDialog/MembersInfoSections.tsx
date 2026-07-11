import type { ReactNode } from "react";
import type { TFunction } from "i18next";
import type { MembersInfoData } from "./membersInfoDialog.types";

type Props = { data: MembersInfoData; t: TFunction };
type RowProps = { label: string; value: ReactNode; className?: string };

function InfoRow({ label, value, className = "" }: RowProps) {
  return <div className="members-info-dialog__row">
    <div className="dialog-label">{label}</div>
    <div className={`dialog-value ${className}`.trim()}>{value}</div>
  </div>;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return <section className="dialog-section members-info-dialog__section">
    <div className="dialog-section__head">
      <h3 className="dialog-section__title">{title}</h3>
    </div>
    <div className="dialog-section__body">{children}</div>
  </section>;
}

function ProfileRows({ data, t }: Props) {
  return <div className="members-info-dialog__list">
    <InfoRow label={t("common.admin.members.table.email")} value={data.email} />
    <InfoRow label={t("common.admin.members.table.role")} value={data.role} />
    <InfoRow label={t("common.admin.members.info.owner")} value={data.isOwner ? t("common.admin.common.yes") : t("common.admin.common.no")} />
    <InfoRow label={t("common.admin.members.info.id")} value={data.id} className="members-info-dialog__value--mono" />
  </div>;
}

export function MemberProfileSection(props: Props) {
  return <Section title={props.t("common.admin.members.info.profile")}>
    <ProfileRows {...props} />
  </Section>;
}

function AvatarValue({ avatarUrl }: { avatarUrl: string }) {
  return avatarUrl !== "—"
    ? <img src={avatarUrl} alt="" className="members-info-dialog__avatar-preview" />
    : <div className="dialog-value">—</div>;
}

export function MemberAvatarSection({ data, t }: Props) {
  return <Section title={t("common.admin.members.info.avatar")}>
    <div className="members-info-dialog__list">
      <div className="members-info-dialog__row members-info-dialog__row--multiline">
        <div className="dialog-label">{t("common.admin.members.info.avatarUrl")}</div>
        <div className="dialog-value members-info-dialog__value--break"><AvatarValue avatarUrl={data.avatarUrl} /></div>
      </div>
    </div>
  </Section>;
}
