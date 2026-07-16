import { useTranslation } from "react-i18next";

type Props = {
  busy: boolean;
  onCreate: () => void;
};

export default function PartnerPageHeader({ busy, onCreate }: Props) {
  const { t } = useTranslation();
  const handleCreate = () => runCreate(busy, onCreate);

  return (
    <button
      className="btn partner-admin__create"
      type="button"
      aria-disabled={busy}
      onClick={handleCreate}
    >
      {renderPlusIcon()}
      {t("admin.partners.create")}
    </button>
  );
}

function renderPlusIcon() {
  return (
    <img
      src="/icons/plus.svg"
      alt=""
      aria-hidden="true"
      className="btn__icon"
    />
  );
}

function runCreate(busy: boolean, onCreate: () => void) {
  if (busy) return;
  onCreate();
}
