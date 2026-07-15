import { useTranslation } from "react-i18next";

export default function CreateButton(props: {
  busy: boolean;
  onOpen: () => void;
}) {
  const { t } = useTranslation();
  return (
    <button className="btn" type="button" onClick={() => openIfReady(props)}>
      <img
        src="/icons/plus.svg"
        alt=""
        aria-hidden="true"
        className="btn__icon"
      />
      {t("common.admin.news.page.createPost")}
    </button>
  );
}

function openIfReady({ busy, onOpen }: { busy: boolean; onOpen: () => void }) {
  if (busy) return;
  onOpen();
}
