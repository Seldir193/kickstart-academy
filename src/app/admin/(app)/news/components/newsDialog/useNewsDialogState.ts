import { useEffect, useMemo, useRef, useState } from "react";
import type { Dispatch, RefObject, SetStateAction } from "react";
import { toastErrorMessage } from "@/lib/toast-messages";
import type { News } from "../../types";
import { WP_DETAIL_BASE } from "../../constants";
import { ensureNewsDefaults, finalizeNewsPayload } from "../../news";
import { safeSlug } from "../../utils/slug";
import { translateNews } from "../../api";
import { MAX_CONTENT_CHARS } from "./constants";
import { defaultI18n, defaultNewsForm, withI18nDefaults } from "./i18nDefaults";
import { mergeDraftIntoItem } from "./newsDraft";
import { applyInsert, templateText } from "./template";
import { nextContent, nextI18n, tagsFromText } from "./formHelpers";
import type {
  NewsDialogProps,
  NewsLanguage,
  TranslationField,
  Translate,
} from "./types";

export function useNewsDialogState(props: NewsDialogProps, t: Translate) {
  const base = useNewsBaseState();
  useDialogReset(props, base);
  const form = base.values.form;
  const previewUrl = usePreviewUrl(form.slug);
  const i18n = defaultI18n(form.i18n);
  const metrics = useMemo(() => getMetrics(form, i18n), [form, i18n]);
  const actions = useNewsActions({
    props,
    t,
    refs: base.refs,
    state: base.state,
  });
  return { ...base.values, i18n, previewUrl, metrics, actions };
}

function useNewsBaseState() {
  const refs = { coverRef: useRef<HTMLInputElement>(null) };
  const state = useNewsStateValues();
  return {
    refs,
    state,
    values: { coverRef: refs.coverRef, ...stateValues(state) },
  };
}

function useNewsStateValues() {
  const [form, setForm] = useState<News>(() => defaultNewsForm());
  const [busy, setBusy] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [translationsOpen, setTranslationsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [coverFileName, setCoverFileName] = useState("");
  return {
    form,
    setForm,
    busy,
    setBusy,
    translating,
    setTranslating,
    translationsOpen,
    setTranslationsOpen,
    error,
    setError,
    categoryOpen,
    setCategoryOpen,
    coverFileName,
    setCoverFileName,
  };
}

function stateValues(state: NewsStateValues) {
  const {
    form,
    busy,
    translating,
    translationsOpen,
    error,
    categoryOpen,
    coverFileName,
  } = state;
  return {
    form,
    busy,
    translating,
    translationsOpen,
    error,
    categoryOpen,
    coverFileName,
  };
}

function useDialogReset(props: NewsDialogProps, base: NewsBaseState) {
  useEffect(() => {
    const next = nextForm(props.mode, props.initial);
    base.state.setForm(withI18nDefaults(next));
    resetDialogUi(base);
  }, [props.mode, props.initial?._id]);
}

function resetDialogUi(base: NewsBaseState) {
  base.state.setCategoryOpen(false);
  base.state.setCoverFileName("");
  base.state.setTranslationsOpen(false);
  if (base.refs.coverRef.current) base.refs.coverRef.current.value = "";
}

function nextForm(mode: NewsDialogProps["mode"], initial?: News | null) {
  return mode === "edit" && initial
    ? ensureNewsDefaults(mergeDraftIntoItem(initial))
    : defaultNewsForm();
}

function usePreviewUrl(slug: string) {
  return useMemo(
    () => (slug ? `${WP_DETAIL_BASE}${encodeURIComponent(slug)}` : ""),
    [slug],
  );
}

function getMetrics(form: News, i18n: ReturnType<typeof defaultI18n>) {
  return {
    contentLen: (form.content || "").length,
    enContentLen: i18n.en.content.length,
    trContentLen: i18n.tr.content.length,
  };
}

type NewsStateValues = ReturnType<typeof useNewsStateValues>;
type NewsBaseState = ReturnType<typeof useNewsBaseState>;

type ActionContext = {
  props: NewsDialogProps;
  t: Translate;
  refs: { coverRef: RefObject<HTMLInputElement | null> };
  state: NewsStateValues;
};

function useNewsActions(ctx: ActionContext) {
  const update = updateFactory(ctx.state.setForm);
  return {
    ...formActions(ctx, update),
    ...asyncActions(ctx, update),
    ...uiActions(ctx, update),
  };
}

function formActions(ctx: ActionContext, update: NewsUpdate) {
  return {
    update,
    updateI18n: updateI18nFactory(ctx.state.setForm),
    setContent: (value: string) => update("content", nextContent(value)),
    setTagsFromText: (text: string) => update("tags", tagsFromText(text)),
  };
}

function asyncActions(ctx: ActionContext, update: NewsUpdate) {
  return {
    saveNow: () => saveNow(ctx),
    translateNow: () => translateNow(ctx),
    uploadCover: (file?: File) => uploadCover(ctx, update, file),
    uploadMedia: ctx.props.upload,
  };
}

function uiActions(ctx: ActionContext, update: NewsUpdate) {
  return {
    autoSlug: () => autoSlug(ctx.state.form, update),
    updateCoverFileName: ctx.state.setCoverFileName,
    togglePublished: () => update("published", !ctx.state.form.published),
    toggleTranslations: () => toggleTranslations(ctx.state.setTranslationsOpen),
    insertTemplate: () => insertTemplate(ctx.state.form, ctx.t, update),
    insertSnippet: (snippet: string) =>
      insertSnippet(ctx.state.form, update, snippet),
    toggleCategory: () => toggleCategory(ctx.state.setCategoryOpen),
    pickCategory: (category: News["category"]) =>
      pickCategory(update, ctx.state.setCategoryOpen, category),
  };
}

type NewsUpdate = ReturnType<typeof updateFactory>;

function updateFactory(setForm: Dispatch<SetStateAction<News>>) {
  return <K extends keyof News>(key: K, value: News[K]) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };
}

function updateI18nFactory(setForm: Dispatch<SetStateAction<News>>) {
  return (language: NewsLanguage, field: TranslationField, value: string) => {
    setForm((previous) => buildI18nUpdate(previous, language, field, value));
  };
}

function buildI18nUpdate(
  news: News,
  language: NewsLanguage,
  field: TranslationField,
  value: string,
) {
  const { currentI18n, nextValue } = nextI18n(news, field, value);
  return {
    ...news,
    i18n: {
      ...currentI18n,
      [language]: { ...currentI18n[language], [field]: nextValue },
    },
  };
}

function autoSlug(form: News, update: NewsUpdate) {
  if (!form.slug?.trim() && form.title) update("slug", safeSlug(form.title));
}

async function saveNow(ctx: ActionContext) {
  ctx.state.setBusy(true);
  ctx.state.setError(null);
  try {
    await saveFinal(ctx);
  } catch (error: unknown) {
    setSaveError(ctx, error);
  } finally {
    ctx.state.setBusy(false);
  }
}

async function saveFinal(ctx: ActionContext) {
  const final = finalizeNewsPayload(ctx.state.form);
  if (!final.title)
    throw new Error(ctx.t("common.admin.news.dialog.errorTitleMissing"));
  await ctx.props.save(final);
  ctx.props.onClose();
}

function setSaveError(ctx: ActionContext, error: unknown) {
  ctx.state.setError(
    toastErrorMessage(ctx.t, error, "common.admin.news.dialog.errorSaveFailed"),
  );
}

async function translateNow(ctx: ActionContext) {
  ctx.state.setTranslating(true);
  ctx.state.setError(null);
  try {
    await applyTranslation(ctx);
  } catch (error: unknown) {
    setTranslateError(ctx, error);
  } finally {
    ctx.state.setTranslating(false);
  }
}

async function applyTranslation(ctx: ActionContext) {
  const i18n = await translateNews(ctx.state.form);
  ctx.state.setForm((previous) => ({ ...previous, i18n }));
  ctx.state.setTranslationsOpen(true);
}

function setTranslateError(ctx: ActionContext, error: unknown) {
  ctx.state.setError(
    toastErrorMessage(
      ctx.t,
      error,
      "common.admin.news.dialog.errorTranslateFailed",
    ),
  );
}

async function uploadCover(
  ctx: ActionContext,
  update: NewsUpdate,
  file?: File,
) {
  if (!file || !validCover(ctx, file)) return;
  const uploaded = await ctx.props.upload(file, "news-cover");
  update("coverImage", uploaded.url);
  resetCover(ctx);
}

function validCover(ctx: ActionContext, file: File) {
  ctx.state.setError(null);
  if (file.type.startsWith("image/")) return true;
  ctx.state.setError(ctx.t("common.admin.news.dialog.errorCoverNotImage"));
  return false;
}

function resetCover(ctx: ActionContext) {
  if (ctx.refs.coverRef.current) ctx.refs.coverRef.current.value = "";
  ctx.state.setCoverFileName("");
}

function toggleTranslations(setOpen: Dispatch<SetStateAction<boolean>>) {
  setOpen((current) => !current);
}

function insertTemplate(form: News, t: Translate, update: NewsUpdate) {
  update(
    "content",
    applyInsert(form.content || "", templateText(t)).slice(
      0,
      MAX_CONTENT_CHARS,
    ),
  );
}

function insertSnippet(form: News, update: NewsUpdate, snippet: string) {
  update(
    "content",
    applyInsert(form.content || "", snippet).slice(0, MAX_CONTENT_CHARS),
  );
}

function toggleCategory(setCategoryOpen: Dispatch<SetStateAction<boolean>>) {
  setCategoryOpen((current) => !current);
}

function pickCategory(
  update: NewsUpdate,
  setCategoryOpen: Dispatch<SetStateAction<boolean>>,
  category: News["category"],
) {
  update("category", category);
  setCategoryOpen(false);
}
