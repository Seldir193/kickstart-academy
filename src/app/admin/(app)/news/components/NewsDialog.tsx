"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toastErrorMessage } from "@/lib/toast-messages";
import KsDatePicker from "@/app/admin/(app)/invoices/components/KsDatePicker";
import type {
  News,
  NewsI18n,
  NewsTranslation,
  NewsUploadPurpose,
} from "../types";
import { WP_DETAIL_BASE } from "../constants";
import { todayIsoDate } from "../date";
import { ensureNewsDefaults, finalizeNewsPayload } from "../news";
import { safeSlug } from "../utils/slug";
import { translateNews } from "../api";
import CategorySelect from "./CategorySelect";
import MediaManager from "./MediaManager";
import Editor from "./Editor";

type UploadResult = { url: string; mimetype: string };

type Props = {
  mode: "create" | "edit";
  initial?: News | null;
  onClose: () => void;
  upload: (file: File, purpose: NewsUploadPurpose) => Promise<UploadResult>;
  save: (n: News) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

type NewsLanguage = "en" | "tr";
type TranslationField = keyof NewsTranslation;

const MAX_CONTENT_CHARS = 3000;

function emptyTranslation(): NewsTranslation {
  return { title: "", excerpt: "", content: "" };
}

function mergeTranslation(value?: Partial<NewsTranslation>): NewsTranslation {
  return { ...emptyTranslation(), ...(value || {}) };
}

function defaultI18n(value?: Partial<NewsI18n>): NewsI18n {
  return {
    en: mergeTranslation(value?.en),
    tr: mergeTranslation(value?.tr),
  };
}

function withI18nDefaults(news: News): News {
  return { ...news, i18n: defaultI18n(news.i18n) };
}

function defaultForm() {
  return withI18nDefaults(
    ensureNewsDefaults({ date: todayIsoDate(), published: true }),
  );
}

function templateIntro(t: (key: string) => string) {
  return [
    `## ${t("common.admin.news.dialog.template.intro")}`,
    "",
    t("common.admin.news.dialog.template.introText"),
  ];
}

function templateMain(t: (key: string) => string) {
  return [
    "",
    `## ${t("common.admin.news.dialog.template.mainSection")}`,
    "",
    `1. ${t("common.admin.news.dialog.template.firstPoint")}`,
    `2. ${t("common.admin.news.dialog.template.secondPoint")}`,
    `3. ${t("common.admin.news.dialog.template.thirdPoint")}`,
  ];
}

function templateChecklist(t: (key: string) => string) {
  return [
    "",
    `> ${t("common.admin.news.dialog.template.quoteHint")}`,
    "",
    `## ${t("common.admin.news.dialog.template.checklist")}`,
    "",
    `- ${t("common.admin.news.dialog.template.bulletOne")}`,
    `- ${t("common.admin.news.dialog.template.bulletTwo")}`,
    `- ${t("common.admin.news.dialog.template.bulletThree")}`,
  ];
}

function templateText(t: (key: string) => string) {
  return [
    ...templateIntro(t),
    ...templateMain(t),
    ...templateChecklist(t),
  ].join("\n");
}

function applyInsert(value: string, insert: string) {
  const trimmed = value ? `${value}\n\n` : "";
  return `${trimmed}${insert}`.trim();
}

function mergeDraftIntoItem(n: News) {
  const anyNews = n as any;

  if (
    anyNews?.hasDraft &&
    anyNews?.draft &&
    typeof anyNews.draft === "object"
  ) {
    return { ...n, ...anyNews.draft } as News;
  }

  return n;
}

export default function NewsDialog({
  mode,
  initial,
  onClose,
  upload,
  save,
}: Props) {
  const { t } = useTranslation();
  const coverRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<News>(() => defaultForm());
  const [busy, setBusy] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [translationsOpen, setTranslationsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [coverFileName, setCoverFileName] = useState("");

  useEffect(() => {
    const next =
      mode === "edit" && initial
        ? ensureNewsDefaults(mergeDraftIntoItem(initial))
        : defaultForm();

    setForm(withI18nDefaults(next));
    setCategoryOpen(false);
    setCoverFileName("");
    setTranslationsOpen(false);
    if (coverRef.current) coverRef.current.value = "";
  }, [mode, initial?._id]);

  const previewUrl = useMemo(() => {
    return form.slug ? `${WP_DETAIL_BASE}${encodeURIComponent(form.slug)}` : "";
  }, [form.slug]);

  const contentLen = (form.content || "").length;
  const i18n = defaultI18n(form.i18n);
  const enContentLen = i18n.en.content.length;
  const trContentLen = i18n.tr.content.length;

  function update<K extends keyof News>(key: K, value: News[K]) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  function updateI18n(
    language: NewsLanguage,
    field: TranslationField,
    value: string,
  ) {
    setForm((previous) => {
      const currentI18n = defaultI18n(previous.i18n);
      const nextValue =
        field === "content" ? value.slice(0, MAX_CONTENT_CHARS) : value;

      return {
        ...previous,
        i18n: {
          ...currentI18n,
          [language]: { ...currentI18n[language], [field]: nextValue },
        },
      };
    });
  }

  function setContent(next: string) {
    update("content", (next || "").slice(0, MAX_CONTENT_CHARS));
  }

  function autoSlug() {
    if (!form.slug?.trim() && form.title) update("slug", safeSlug(form.title));
  }

  async function saveNow() {
    setBusy(true);
    setError(null);

    try {
      const final = finalizeNewsPayload(form);
      if (!final.title)
        throw new Error(t("common.admin.news.dialog.errorTitleMissing"));
      await save(final);
      onClose();
    } catch (error: unknown) {
      setError(
        toastErrorMessage(t, error, "common.admin.news.dialog.errorSaveFailed"),
      );
    } finally {
      setBusy(false);
    }
  }

  async function translateNow() {
    setTranslating(true);
    setError(null);

    try {
      const i18n = await translateNews(form);
      setForm((previous) => ({ ...previous, i18n }));
      setTranslationsOpen(true);
    } catch (error: unknown) {
      setError(
        toastErrorMessage(
          t,
          error,
          "common.admin.news.dialog.errorTranslateFailed",
        ),
      );
    } finally {
      setTranslating(false);
    }
  }

  async function uploadCover(file?: File) {
    if (!file) return;
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError(t("common.admin.news.dialog.errorCoverNotImage"));
      return;
    }

    const uploaded = await upload(file, "news-cover");
    update("coverImage", uploaded.url);
    if (coverRef.current) coverRef.current.value = "";
    setCoverFileName("");
  }

  function togglePublished() {
    update("published", !form.published);
  }

  function toggleTranslations() {
    setTranslationsOpen((current) => !current);
  }

  function setTagsFromText(text: string) {
    const tags = text
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    update("tags", tags);
  }

  function insertTemplate() {
    setContent(applyInsert(form.content || "", templateText(t)));
  }

  function insertSnippet(snippet: string) {
    setContent(applyInsert(form.content || "", snippet));
  }

  return (
    <div
      className="dialog-backdrop news-dialog"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="dialog-backdrop-hit news-dialog__backdrop-hit"
        aria-label={t("common.close")}
        onClick={onClose}
      />

      <div className="dialog news-dialog__dialog">
        <div className="dialog-head news-dialog__head">
          <div className="news-dialog__head-left">
            <div className="dialog-title news-dialog__title">
              {mode === "create"
                ? t("common.admin.news.dialog.newArticle")
                : form.title || t("common.admin.news.dialog.article")}
            </div>

            <div className="dialog-subtitle news-dialog__subtitle">
              {t("common.admin.news.dialog.subtitle")}
            </div>

            <div className="news-dialog__title-actions">
              <span className="dialog-status dialog-status--neutral">
                {mode === "create"
                  ? t("common.admin.news.dialog.new")
                  : t("common.admin.news.dialog.edit")}
              </span>

              {mode === "edit" && previewUrl ? (
                <a
                  className="btn"
                  href={previewUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("common.admin.news.dialog.preview")}
                </a>
              ) : null}
            </div>
          </div>

          <div className="news-dialog__head-right">
            <div className="dialog-head__actions">
              <button
                type="button"
                className="dialog-close modal__close"
                aria-label={t("common.close")}
                onClick={onClose}
              >
                <img
                  src="/icons/close.svg"
                  alt=""
                  aria-hidden="true"
                  className="icon-img"
                />
              </button>
            </div>
          </div>
        </div>

        <div className="dialog-body news-dialog__body">
          {error ? (
            <div className="error news-dialog__error">{error}</div>
          ) : null}

          <div className="news-dialog__grid">
            <div className="field">
              <label className="dialog-label">
                {t("common.admin.news.dialog.date")}
              </label>
              <KsDatePicker
                value={form.date}
                onChange={(value) => update("date", value)}
                placeholder={t("common.admin.news.dialog.datePlaceholder")}
                disabled={false}
              />
            </div>

            <div className="field">
              <label className="dialog-label">
                {t("common.admin.news.dialog.category")}
              </label>
              <CategorySelect
                value={form.category}
                open={categoryOpen}
                onToggle={() => setCategoryOpen((current) => !current)}
                onPick={(category) => {
                  update("category", category);
                  setCategoryOpen(false);
                }}
              />
            </div>

            <div className="field field--full">
              <label className="dialog-label">
                {t("common.admin.news.dialog.title")}
              </label>
              <input
                className="input"
                value={form.title}
                onChange={(event) => update("title", event.target.value)}
                onBlur={autoSlug}
              />
            </div>

            <div className="field">
              <label className="dialog-label">
                {t("common.admin.news.dialog.slug")}
              </label>
              <input
                className="input"
                value={form.slug}
                onChange={(event) =>
                  update("slug", safeSlug(event.target.value))
                }
              />
            </div>

            <div className="field news-dialog__slug-actions">
              <label className="dialog-label">&nbsp;</label>
              <button
                className="btn"
                type="button"
                onClick={() => update("slug", safeSlug(form.title))}
              >
                {t("common.admin.news.dialog.generate")}
              </button>
            </div>

            <div className="field field--full">
              <label className="dialog-label">
                {t("common.admin.news.dialog.tags")}
              </label>
              <input
                className="input"
                value={(form.tags || []).join(", ")}
                onChange={(event) => setTagsFromText(event.target.value)}
              />
            </div>

            <div className="field field--full">
              <label className="dialog-label">
                {t("common.admin.news.dialog.lead")}
              </label>
              <textarea
                className="input"
                rows={3}
                value={form.excerpt || ""}
                onChange={(event) => update("excerpt", event.target.value)}
              />
            </div>

            <div className="field field--full">
              <label className="dialog-label">
                {t("common.admin.news.dialog.coverImageUrl")}
              </label>
              <input
                className="input"
                value={form.coverImage || ""}
                onChange={(event) => update("coverImage", event.target.value)}
                placeholder={t(
                  "common.admin.news.dialog.coverImagePlaceholder",
                )}
              />
            </div>

            <div className="field field--full">
              <label className="dialog-label">
                {t("common.admin.news.dialog.uploadCover")}
              </label>

              <div className="news-dialog__file">
                <input
                  ref={coverRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    setCoverFileName(file?.name || "");
                    uploadCover(file);
                  }}
                />

                <button
                  type="button"
                  className="btn"
                  onClick={() => coverRef.current?.click()}
                >
                  {t("common.admin.news.dialog.chooseFile")}
                </button>

                <span
                  className={
                    "news-dialog__file-name" +
                    (!coverFileName ? " is-empty" : "")
                  }
                >
                  {coverFileName ||
                    t("common.admin.news.dialog.noFileSelected")}
                </span>
              </div>
            </div>

            <div className="field field--full">
              <label className="dialog-label">
                {t("common.admin.news.dialog.articleContent")}
              </label>

              <div className="news-dialog__content-meta">
                {contentLen.toLocaleString()} /{" "}
                {MAX_CONTENT_CHARS.toLocaleString()}{" "}
                {t("common.admin.news.dialog.characters")}
              </div>

              <Editor
                value={form.content || ""}
                onChange={(value) => setContent(value)}
                onInsertTemplate={insertTemplate}
                onBold={() =>
                  insertSnippet(
                    `**${t("common.admin.news.dialog.snippet.bold")}**`,
                  )
                }
                onH2={() =>
                  insertSnippet(
                    `## ${t("common.admin.news.dialog.snippet.heading")}`,
                  )
                }
                onUl={() =>
                  insertSnippet(
                    `- ${t("common.admin.news.dialog.snippet.item")}\n- ${t("common.admin.news.dialog.snippet.item")}\n- ${t("common.admin.news.dialog.snippet.item")}`,
                  )
                }
                onOl={() =>
                  insertSnippet(
                    `1. ${t("common.admin.news.dialog.snippet.item")}\n2. ${t("common.admin.news.dialog.snippet.item")}\n3. ${t("common.admin.news.dialog.snippet.item")}`,
                  )
                }
                onQuote={() =>
                  insertSnippet(
                    `> ${t("common.admin.news.dialog.snippet.quote")}`,
                  )
                }
              />
            </div>

            <div className="field field--full news-dialog__translation-actions">
              <button
                className="btn"
                type="button"
                onClick={translateNow}
                disabled={busy || translating}
              >
                {translating
                  ? t("common.admin.news.dialog.translating")
                  : t("common.admin.news.dialog.translate")}
              </button>

              <button
                className="btn"
                type="button"
                onClick={toggleTranslations}
              >
                {translationsOpen
                  ? t("common.admin.news.dialog.hideTranslations")
                  : t("common.admin.news.dialog.showTranslations")}
              </button>
            </div>
            {translationsOpen ? (
              <div className="field field--full news-dialog__translation-fields">
                <div className="field field--full">
                  <label className="dialog-label">
                    {t("common.admin.news.dialog.translations.enTitle")}
                  </label>
                  <input
                    className="input"
                    value={i18n.en.title}
                    onChange={(event) =>
                      updateI18n("en", "title", event.target.value)
                    }
                  />
                </div>

                <div className="field field--full">
                  <label className="dialog-label">
                    {t("common.admin.news.dialog.translations.enLead")}
                  </label>
                  <textarea
                    className="input"
                    rows={3}
                    value={i18n.en.excerpt}
                    onChange={(event) =>
                      updateI18n("en", "excerpt", event.target.value)
                    }
                  />
                </div>

                <div className="field field--full">
                  <label className="dialog-label">
                    {t("common.admin.news.dialog.translations.enContent")}
                  </label>

                  <div className="news-dialog__content-meta">
                    {enContentLen.toLocaleString()} /{" "}
                    {MAX_CONTENT_CHARS.toLocaleString()}{" "}
                    {t("common.admin.news.dialog.characters")}
                  </div>

                  <textarea
                    className="input"
                    rows={10}
                    value={i18n.en.content}
                    onChange={(event) =>
                      updateI18n("en", "content", event.target.value)
                    }
                  />
                </div>

                <div className="field field--full">
                  <label className="dialog-label">
                    {t("common.admin.news.dialog.translations.trTitle")}
                  </label>
                  <input
                    className="input"
                    value={i18n.tr.title}
                    onChange={(event) =>
                      updateI18n("tr", "title", event.target.value)
                    }
                  />
                </div>

                <div className="field field--full">
                  <label className="dialog-label">
                    {t("common.admin.news.dialog.translations.trLead")}
                  </label>
                  <textarea
                    className="input"
                    rows={3}
                    value={i18n.tr.excerpt}
                    onChange={(event) =>
                      updateI18n("tr", "excerpt", event.target.value)
                    }
                  />
                </div>

                <div className="field field--full">
                  <label className="dialog-label">
                    {t("common.admin.news.dialog.translations.trContent")}
                  </label>

                  <div className="news-dialog__content-meta">
                    {trContentLen.toLocaleString()} /{" "}
                    {MAX_CONTENT_CHARS.toLocaleString()}{" "}
                    {t("common.admin.news.dialog.characters")}
                  </div>

                  <textarea
                    className="input"
                    rows={10}
                    value={i18n.tr.content}
                    onChange={(event) =>
                      updateI18n("tr", "content", event.target.value)
                    }
                  />
                </div>
              </div>
            ) : null}

            <div className="field field--full">
              <label className="dialog-label">
                {t("common.admin.news.dialog.media")}
              </label>
              <MediaManager
                items={form.media || []}
                upload={upload}
                onChange={(media) => update("media", media)}
              />
            </div>

            <div className="field field--full news-dialog__publish">
              <label className="news-dialog__check">
                <input
                  type="checkbox"
                  checked={!!form.published}
                  onChange={togglePublished}
                />
                <span>{t("common.admin.news.dialog.published")}</span>
              </label>
            </div>
          </div>
        </div>

        <div className="dialog-footer news-dialog__footer">
          <button
            className="btn"
            onClick={saveNow}
            disabled={busy}
            type="button"
          >
            {busy
              ? t("common.admin.news.dialog.saving")
              : mode === "create"
                ? t("common.admin.news.dialog.create")
                : t("common.admin.news.dialog.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
