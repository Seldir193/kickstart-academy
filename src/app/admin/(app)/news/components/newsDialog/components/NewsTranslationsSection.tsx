import type { NewsLanguage, TranslationField } from "../types";
import { ContentMeta } from "./NewsContentField";
import type { DialogComponentProps } from "./types";

export default function NewsTranslationsSection({
  state,
  t,
}: DialogComponentProps) {
  return (
    <>
      <TranslationActions state={state} t={t} />
      {state.translationsOpen ? (
        <TranslationFields state={state} t={t} />
      ) : null}
    </>
  );
}

function TranslationActions({ state, t }: DialogComponentProps) {
  return (
    <div className="field field--full news-dialog__translation-actions">
      <button
        className="btn"
        type="button"
        onClick={state.actions.translateNow}
        disabled={state.busy || state.translating}
      >
        {translateLabel(state.translating, t)}
      </button>
      <button
        className="btn"
        type="button"
        onClick={state.actions.toggleTranslations}
      >
        {toggleLabel(state.translationsOpen, t)}
      </button>
    </div>
  );
}

function TranslationFields({ state, t }: DialogComponentProps) {
  return (
    <div className="field field--full news-dialog__translation-fields">
      <TranslationInput
        state={state}
        t={t}
        language="en"
        field="title"
        labelKey="translations.enTitle"
      />
      <TranslationTextarea
        state={state}
        t={t}
        language="en"
        field="excerpt"
        labelKey="translations.enLead"
        rows={3}
      />

      <TranslationContent
        state={state}
        t={t}
        language="en"
        field="content"
        count={state.metrics.enContentLen}
        labelKey="translations.enContent"
      />
      <TranslationInput
        state={state}
        t={t}
        language="tr"
        field="title"
        labelKey="translations.trTitle"
      />
      <TranslationTextarea
        state={state}
        t={t}
        language="tr"
        field="excerpt"
        labelKey="translations.trLead"
        rows={3}
      />

      <TranslationContent
        state={state}
        t={t}
        language="tr"
        field="content"
        count={state.metrics.trContentLen}
        labelKey="translations.trContent"
      />
    </div>
  );
}

function TranslationInput(props: TranslationTextProps) {
  return <TranslationTextField {...props} multiline={false} />;
}

function TranslationTextarea(props: TranslationTextProps) {
  return <TranslationTextField {...props} multiline />;
}

function TranslationContent(props: TranslationTextProps & { count: number }) {
  return (
    <div className="field field--full">
      <TranslationLabel t={props.t} labelKey={props.labelKey} />
      <ContentMeta count={props.count} t={props.t} />
      <textarea
        className="input"
        rows={10}
        value={translationValue(props)}
        onChange={(event) => updateTranslation(props, event.target.value)}
      />
    </div>
  );
}

type TranslationTextProps = DialogComponentProps & {
  language: NewsLanguage;
  field: TranslationField;
  labelKey: string;
  rows?: number;
};

function TranslationTextField(
  props: TranslationTextProps & { multiline: boolean },
) {
  return (
    <div className="field field--full">
      <TranslationLabel t={props.t} labelKey={props.labelKey} />
      {props.multiline ? (
        <TranslationArea {...props} />
      ) : (
        <TranslationPlainInput {...props} />
      )}
    </div>
  );
}

function TranslationPlainInput(props: TranslationTextProps) {
  return (
    <input
      className="input"
      value={translationValue(props)}
      onChange={(event) => updateTranslation(props, event.target.value)}
    />
  );
}

function TranslationArea(props: TranslationTextProps) {
  return (
    <textarea
      className="input"
      rows={props.rows}
      value={translationValue(props)}
      onChange={(event) => updateTranslation(props, event.target.value)}
    />
  );
}

function TranslationLabel({
  t,
  labelKey,
}: Pick<TranslationTextProps, "t" | "labelKey">) {
  return (
    <label className="dialog-label">
      {t(`common.admin.news.dialog.${labelKey}`)}
    </label>
  );
}

function translationValue(props: TranslationTextProps) {
  return props.state.i18n[props.language][props.field];
}

function updateTranslation(props: TranslationTextProps, value: string) {
  props.state.actions.updateI18n(props.language, props.field, value);
}

function translateLabel(translating: boolean, t: DialogComponentProps["t"]) {
  return translating
    ? t("common.admin.news.dialog.translating")
    : t("common.admin.news.dialog.translate");
}

function toggleLabel(open: boolean, t: DialogComponentProps["t"]) {
  return open
    ? t("common.admin.news.dialog.hideTranslations")
    : t("common.admin.news.dialog.showTranslations");
}
