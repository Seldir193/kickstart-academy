import { useTranslation } from "react-i18next";

type Props = {
  busy: boolean;
  onCreate: () => void;
};

export default function PartnerPageHeader({ busy, onCreate }: Props) {
  const { t } = useTranslation();

  function handleCreate() {
    if (busy) return;
    onCreate();
  }

  return (
    <button
      className="btn partner-admin__create"
      type="button"
      aria-disabled={busy}
      onClick={handleCreate}
    >
      <img
        src="/icons/plus.svg"
        alt=""
        aria-hidden="true"
        className="btn__icon"
      />
      {t("admin.partners.create")}
    </button>
  );
}
