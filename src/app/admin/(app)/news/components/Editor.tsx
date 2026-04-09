"use client";

import { useTranslation } from "react-i18next";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onInsertTemplate: () => void;
  onBold: () => void;
  onH2: () => void;
  onUl: () => void;
  onOl: () => void;
  onQuote: () => void;
};

export default function Editor(props: Props) {
  const { t } = useTranslation();
  return (
    <div className="md-editor">
      <div className="md-editor__toolbar">
        <button className="btn" type="button" onClick={props.onInsertTemplate}>
          {t("common.admin.news.editor.insertTemplate")}
        </button>
        <div className="md-editor__tools">
          <button className="btn" type="button" onClick={props.onBold}>
            {t("common.admin.news.editor.bold")}
          </button>
          <button className="btn" type="button" onClick={props.onH2}>
            {t("common.admin.news.editor.h2")}
          </button>
          <button className="btn" type="button" onClick={props.onUl}>
            {t("common.admin.news.editor.bulletList")}
          </button>
          <button className="btn" type="button" onClick={props.onOl}>
            {t("common.admin.news.editor.numberedList")}
          </button>
          <button className="btn" type="button" onClick={props.onQuote}>
            {t("common.admin.news.editor.numberedList")}
          </button>
        </div>
      </div>

      <textarea
        className="input md-editor__textarea"
        rows={12}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={t("common.admin.news.editor.placeholder")}
        aria-label={t("common.admin.news.editor.ariaLabel")}
      />
    </div>
  );
}
