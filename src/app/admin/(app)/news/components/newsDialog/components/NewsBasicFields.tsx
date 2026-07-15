import KsDatePicker from "@/app/admin/(app)/invoices/components/KsDatePicker";
import { safeSlug } from "../../../utils/slug";
import CategorySelect from "../../CategorySelect";
import type { DialogComponentProps } from "./types";

export default function NewsBasicFields({ state, t }: DialogComponentProps) {
  return (
    <>
      <DateField state={state} t={t} />
      <CategoryField state={state} t={t} />
      <TitleField state={state} t={t} />
      <SlugField state={state} t={t} />
      <SlugAction state={state} t={t} />
      <TagsField state={state} t={t} />
      <LeadField state={state} t={t} />
    </>
  );
}

function DateField({ state, t }: DialogComponentProps) {
  return (
    <div className="field">
      <label className="dialog-label">
        {t("common.admin.news.dialog.date")}
      </label>
      <KsDatePicker
        value={state.form.date}
        onChange={(value) => state.actions.update("date", value)}
        placeholder={t("common.admin.news.dialog.datePlaceholder")}
        disabled={false}
      />
    </div>
  );
}

function CategoryField({ state, t }: DialogComponentProps) {
  return (
    <div className="field">
      <label className="dialog-label">
        {t("common.admin.news.dialog.category")}
      </label>
      <CategorySelect
        value={state.form.category}
        open={state.categoryOpen}
        onToggle={state.actions.toggleCategory}
        onPick={state.actions.pickCategory}
      />
    </div>
  );
}

function TitleField({ state, t }: DialogComponentProps) {
  return (
    <div className="field field--full">
      <label className="dialog-label">
        {t("common.admin.news.dialog.title")}
      </label>
      <input
        className="input"
        value={state.form.title}
        onChange={(event) => state.actions.update("title", event.target.value)}
        onBlur={state.actions.autoSlug}
      />
    </div>
  );
}

function SlugField({ state, t }: DialogComponentProps) {
  return (
    <div className="field">
      <label className="dialog-label">
        {t("common.admin.news.dialog.slug")}
      </label>
      <input
        className="input"
        value={state.form.slug}
        onChange={(event) =>
          state.actions.update("slug", safeSlug(event.target.value))
        }
      />
    </div>
  );
}

function SlugAction({ state, t }: DialogComponentProps) {
  return (
    <div className="field news-dialog__slug-actions">
      <label className="dialog-label">&nbsp;</label>
      <button
        className="btn"
        type="button"
        onClick={() => state.actions.update("slug", safeSlug(state.form.title))}
      >
        {t("common.admin.news.dialog.generate")}
      </button>
    </div>
  );
}

function TagsField({ state, t }: DialogComponentProps) {
  return (
    <div className="field field--full">
      <label className="dialog-label">
        {t("common.admin.news.dialog.tags")}
      </label>
      <input
        className="input"
        value={(state.form.tags || []).join(", ")}
        onChange={(event) => state.actions.setTagsFromText(event.target.value)}
      />
    </div>
  );
}

function LeadField({ state, t }: DialogComponentProps) {
  return (
    <div className="field field--full">
      <label className="dialog-label">
        {t("common.admin.news.dialog.lead")}
      </label>
      <textarea
        className="input"
        rows={3}
        value={state.form.excerpt || ""}
        onChange={(event) =>
          state.actions.update("excerpt", event.target.value)
        }
      />
    </div>
  );
}
