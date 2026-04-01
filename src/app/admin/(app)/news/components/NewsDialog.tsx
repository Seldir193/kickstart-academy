"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import KsDatePicker from "@/app/admin/(app)/invoices/components/KsDatePicker";
import type { News } from "../types";
import { WP_DETAIL_BASE } from "../constants";
import { todayIsoDate } from "../date";
import { ensureNewsDefaults, finalizeNewsPayload } from "../news";
import { safeSlug } from "../utils/slug";
import CategorySelect from "./CategorySelect";
import MediaManager from "./MediaManager";
import Editor from "./Editor";

type UploadResult = { url: string; mimetype: string };

type Props = {
  mode: "create" | "edit";
  initial?: News | null;
  onClose: () => void;
  upload: (file: File) => Promise<UploadResult>;
  save: (n: News) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

const MAX_CONTENT_CHARS = 3000;

function defaultForm() {
  return ensureNewsDefaults({ date: todayIsoDate(), published: true });
}

function templateText() {
  return [
    "## Intro",
    "",
    "Write 2–4 sentences that hook the reader.",
    "",
    "## Main section",
    "",
    "1. First point",
    "2. Second point",
    "3. Third point",
    "",
    "> Add a quote if needed.",
    "",
    "## Checklist",
    "",
    "- Bullet one",
    "- Bullet two",
    "- Bullet three",
  ].join("\n");
}

function applyInsert(value: string, insert: string) {
  const trimmed = value ? `${value}\n\n` : "";
  return `${trimmed}${insert}`.trim();
}

function mergeDraftIntoItem(n: News) {
  const anyN = n as any;
  if (anyN?.hasDraft && anyN?.draft && typeof anyN.draft === "object") {
    return { ...n, ...anyN.draft } as News;
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
  const coverRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<News>(() => defaultForm());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [coverFileName, setCoverFileName] = useState("");

  useEffect(() => {
    const next =
      mode === "edit" && initial
        ? ensureNewsDefaults(mergeDraftIntoItem(initial))
        : defaultForm();
    setForm(next);
    setCategoryOpen(false);
    setCoverFileName("");
    if (coverRef.current) coverRef.current.value = "";
  }, [mode, initial?._id]);

  const previewUrl = useMemo(() => {
    return form.slug ? `${WP_DETAIL_BASE}${encodeURIComponent(form.slug)}` : "";
  }, [form.slug]);

  function update<K extends keyof News>(key: K, value: News[K]) {
    setForm((p) => ({ ...p, [key]: value }));
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
      if (!final.title) throw new Error("Title is missing.");
      await save(final);
      onClose();
    } catch (e: any) {
      setError(e?.message || "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  async function uploadCover(file?: File) {
    if (!file) return;
    const up = await upload(file);
    update("coverImage", up.url);
    if (coverRef.current) coverRef.current.value = "";
    setCoverFileName("");
  }

  function togglePublished() {
    update("published", !form.published);
  }

  function setTagsFromText(text: string) {
    const tags = text
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    update("tags", tags);
  }

  function insertTemplate() {
    setContent(applyInsert(form.content || "", templateText()));
  }

  function insertSnippet(snippet: string) {
    setContent(applyInsert(form.content || "", snippet));
  }

  const contentLen = (form.content || "").length;

  return (
    <div
      className="dialog-backdrop news-dialog"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="dialog-backdrop-hit news-dialog__backdrop-hit"
        aria-label="Close"
        onClick={onClose}
      />

      <div className="dialog news-dialog__dialog">
        <div className="dialog-head news-dialog__head">
          <div className="news-dialog__head-left">
            <div className="dialog-title news-dialog__title">
              {mode === "create" ? "New article" : form.title || "Article"}
            </div>

            <div className="dialog-subtitle news-dialog__subtitle">
              Create and manage article content, media, and publishing state.
            </div>

            <div className="news-dialog__title-actions">
              <span className="dialog-status dialog-status--neutral">
                {mode === "create" ? "New" : "Edit"}
              </span>

              {mode === "edit" && previewUrl ? (
                <a
                  className="btn"
                  href={previewUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Preview
                </a>
              ) : null}
            </div>
          </div>

          <div className="news-dialog__head-right">
            <div className="dialog-head__actions">
              <button
                type="button"
                className="dialog-close modal__close"
                aria-label="Close"
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
        {/* <div className="dialog-head news-dialog__head">
          <div className="news-dialog__head-left">
            <div className="dialog-title news-dialog__title">
              {mode === "create" ? "New article" : form.title || "Article"}
            </div>
            <div className="dialog-subtitle news-dialog__subtitle">
              Create and manage article content, media, and publishing state.
            </div>
          </div>

          <div className="news-dialog__head-right">
            <span className="dialog-status dialog-status--neutral">
              {mode === "create" ? "New" : "Edit"}
            </span>

            <div className="dialog-head__actions">
              {mode === "edit" && previewUrl ? (
                <a
                  className="btn"
                  href={previewUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Preview
                </a>
              ) : null}

              <button
                type="button"
                className="dialog-close modal__close"
                aria-label="Close"
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
        </div> */}

        <div className="dialog-body news-dialog__body">
          {error ? (
            <div className="error news-dialog__error">{error}</div>
          ) : null}

          <div className="news-dialog__grid">
            <div className="field">
              <label className="dialog-label">Date</label>
              <KsDatePicker
                value={form.date}
                onChange={(v) => update("date", v)}
                placeholder="dd.mm.yyyy"
                disabled={false}
              />
            </div>

            <div className="field">
              <label className="dialog-label">Category</label>
              <CategorySelect
                value={form.category}
                open={categoryOpen}
                onToggle={() => setCategoryOpen((p) => !p)}
                onPick={(c) => {
                  update("category", c);
                  setCategoryOpen(false);
                }}
              />
            </div>

            <div className="field field--full">
              <label className="dialog-label">Title</label>
              <input
                className="input"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                onBlur={autoSlug}
              />
            </div>

            <div className="field">
              <label className="dialog-label">Slug</label>
              <input
                className="input"
                value={form.slug}
                onChange={(e) => update("slug", safeSlug(e.target.value))}
              />
            </div>

            <div className="field news-dialog__slug-actions">
              <label className="dialog-label">&nbsp;</label>
              <button
                className="btn"
                type="button"
                onClick={() => update("slug", safeSlug(form.title))}
              >
                Generate
              </button>
            </div>

            <div className="field field--full">
              <label className="dialog-label">Tags (comma separated)</label>
              <input
                className="input"
                value={(form.tags || []).join(", ")}
                onChange={(e) => setTagsFromText(e.target.value)}
              />
            </div>

            <div className="field field--full">
              <label className="dialog-label">Lead (bold intro)</label>
              <textarea
                className="input"
                rows={3}
                value={form.excerpt || ""}
                onChange={(e) => update("excerpt", e.target.value)}
              />
            </div>

            <div className="field field--full">
              <label className="dialog-label">Cover image URL</label>
              <input
                className="input"
                value={form.coverImage || ""}
                onChange={(e) => update("coverImage", e.target.value)}
                placeholder="https://"
              />
            </div>

            <div className="field field--full">
              <label className="dialog-label">Upload cover</label>

              <div className="news-dialog__file">
                <input
                  ref={coverRef}
                  type="file"
                  accept="image/*"
                  // className="news-dialog__file-hidden"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    setCoverFileName(f?.name || "");
                    uploadCover(f);
                  }}
                />

                <button
                  type="button"
                  className="btn"
                  onClick={() => coverRef.current?.click()}
                >
                  Choose file
                </button>

                <span
                  className={
                    "news-dialog__file-name" +
                    (!coverFileName ? " is-empty" : "")
                  }
                >
                  {coverFileName || "No file selected"}
                </span>
              </div>
            </div>

            <div className="field field--full">
              <label className="dialog-label">Article content</label>

              <div className="news-dialog__content-meta">
                {contentLen.toLocaleString()} /{" "}
                {MAX_CONTENT_CHARS.toLocaleString()} characters
              </div>

              <Editor
                value={form.content || ""}
                onChange={(v) => setContent(v)}
                onInsertTemplate={insertTemplate}
                onBold={() => insertSnippet("**Bold text**")}
                onH2={() => insertSnippet("## Heading")}
                onUl={() => insertSnippet("- Item\n- Item\n- Item")}
                onOl={() => insertSnippet("1. Item\n2. Item\n3. Item")}
                onQuote={() => insertSnippet("> Quote")}
              />
            </div>

            <div className="field field--full">
              <label className="dialog-label">Media (image/video)</label>
              <MediaManager
                items={form.media || []}
                upload={upload}
                onChange={(m) => update("media", m)}
              />
            </div>

            <div className="field field--full news-dialog__publish">
              <label className="news-dialog__check">
                <input
                  type="checkbox"
                  checked={!!form.published}
                  onChange={togglePublished}
                />
                <span>Published</span>
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
            {busy ? "Saving..." : mode === "create" ? "Create" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// //src\app\admin\(app)\news\components\NewsDialog.tsx
// "use client";

// import { useEffect, useMemo, useRef, useState } from "react";
// import KsDatePicker from "@/app/admin/(app)/invoices/components/KsDatePicker";
// import type { News } from "../types";
// import { WP_DETAIL_BASE } from "../constants";
// import { todayIsoDate } from "../date";
// import { ensureNewsDefaults, finalizeNewsPayload } from "../news";
// import { safeSlug } from "../utils/slug";
// import CategorySelect from "./CategorySelect";
// import MediaManager from "./MediaManager";
// import Editor from "./Editor";

// type UploadResult = { url: string; mimetype: string };

// type Props = {
//   mode: "create" | "edit";
//   initial?: News | null;
//   onClose: () => void;
//   upload: (file: File) => Promise<UploadResult>;
//   save: (n: News) => Promise<void>;
//   remove: (id: string) => Promise<void>;
// };

// const MAX_CONTENT_CHARS = 3000;

// function defaultForm() {
//   return ensureNewsDefaults({ date: todayIsoDate(), published: true });
// }

// function templateText() {
//   return [
//     "## Intro",
//     "",
//     "Write 2–4 sentences that hook the reader.",
//     "",
//     "## Main section",
//     "",
//     "1. First point",
//     "2. Second point",
//     "3. Third point",
//     "",
//     "> Add a quote if needed.",
//     "",
//     "## Checklist",
//     "",
//     "- Bullet one",
//     "- Bullet two",
//     "- Bullet three",
//   ].join("\n");
// }

// function applyInsert(value: string, insert: string) {
//   const trimmed = value ? `${value}\n\n` : "";
//   return `${trimmed}${insert}`.trim();
// }

// function mergeDraftIntoItem(n: News) {
//   const anyN = n as any;
//   if (anyN?.hasDraft && anyN?.draft && typeof anyN.draft === "object") {
//     return { ...n, ...anyN.draft } as News;
//   }
//   return n;
// }

// export default function NewsDialog({
//   mode,
//   initial,
//   onClose,
//   upload,
//   save,
// }: Props) {
//   const coverRef = useRef<HTMLInputElement>(null);

//   const [form, setForm] = useState<News>(() => defaultForm());
//   const [busy, setBusy] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [categoryOpen, setCategoryOpen] = useState(false);
//   const [coverFileName, setCoverFileName] = useState("");

//   useEffect(() => {
//     const next =
//       mode === "edit" && initial
//         ? ensureNewsDefaults(mergeDraftIntoItem(initial))
//         : defaultForm();
//     setForm(next);
//     setCategoryOpen(false);
//     setCoverFileName("");
//     if (coverRef.current) coverRef.current.value = "";
//   }, [mode, initial?._id]);

//   const previewUrl = useMemo(() => {
//     return form.slug ? `${WP_DETAIL_BASE}${encodeURIComponent(form.slug)}` : "";
//   }, [form.slug]);

//   function update<K extends keyof News>(key: K, value: News[K]) {
//     setForm((p) => ({ ...p, [key]: value }));
//   }

//   function setContent(next: string) {
//     update("content", (next || "").slice(0, MAX_CONTENT_CHARS));
//   }

//   function autoSlug() {
//     if (!form.slug?.trim() && form.title) update("slug", safeSlug(form.title));
//   }

//   async function saveNow() {
//     setBusy(true);
//     setError(null);
//     try {
//       const final = finalizeNewsPayload(form);
//       if (!final.title) throw new Error("Title is missing.");
//       await save(final);
//       onClose();
//     } catch (e: any) {
//       setError(e?.message || "Save failed.");
//     } finally {
//       setBusy(false);
//     }
//   }

//   async function uploadCover(file?: File) {
//     if (!file) return;
//     const up = await upload(file);
//     update("coverImage", up.url);
//     if (coverRef.current) coverRef.current.value = "";
//     setCoverFileName("");
//   }

//   function togglePublished() {
//     update("published", !form.published);
//   }

//   function setTagsFromText(text: string) {
//     const tags = text
//       .split(",")
//       .map((t) => t.trim())
//       .filter(Boolean);
//     update("tags", tags);
//   }

//   function insertTemplate() {
//     setContent(applyInsert(form.content || "", templateText()));
//   }

//   function insertSnippet(snippet: string) {
//     setContent(applyInsert(form.content || "", snippet));
//   }

//   const contentLen = (form.content || "").length;

//   return (
//     <div className="ks-modal-root">
//       <div className="ks-backdrop" onClick={onClose} />
//       <div
//         className="ks-panel card ks-panel--md"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="dialog-head">
//           <div className="dialog-head__left">
//             <h2 className="text-xl font-bold">
//               {mode === "create" ? "New article" : form.title || "Article"}
//             </h2>
//             <span className="badge">{mode === "create" ? "New" : "Edit"}</span>
//           </div>

//           <div className="dialog-head__actions">
//             {mode === "edit" && previewUrl ? (
//               <a
//                 className="btn"
//                 href={previewUrl}
//                 target="_blank"
//                 rel="noreferrer"
//               >
//                 Preview
//               </a>
//             ) : null}

//             <button
//               type="button"
//               className="modal__close"
//               aria-label="Close"
//               onClick={onClose}
//             >
//               <img
//                 src="/icons/close.svg"
//                 alt=""
//                 aria-hidden="true"
//                 className="icon-img"
//               />
//             </button>
//           </div>
//         </div>

//         {error ? <div className="mb-2 text-red-600">{error}</div> : null}

//         <div className="news-dialog__grid">
//           <div className="field">
//             <label className="lbl">Date</label>
//             <KsDatePicker
//               value={form.date}
//               onChange={(v) => update("date", v)}
//               placeholder="dd.mm.yyyy"
//               disabled={false}
//             />
//           </div>

//           <div className="field">
//             <label className="lbl">Category</label>
//             <CategorySelect
//               value={form.category}
//               open={categoryOpen}
//               onToggle={() => setCategoryOpen((p) => !p)}
//               onPick={(c) => {
//                 update("category", c);
//                 setCategoryOpen(false);
//               }}
//             />
//           </div>

//           <div className="field field--full">
//             <label className="lbl">Title</label>
//             <input
//               className="input"
//               value={form.title}
//               onChange={(e) => update("title", e.target.value)}
//               onBlur={autoSlug}
//             />
//           </div>

//           <div className="field">
//             <label className="lbl">Slug</label>
//             <input
//               className="input"
//               value={form.slug}
//               onChange={(e) => update("slug", safeSlug(e.target.value))}
//             />
//           </div>

//           <div className="field news-dialog__slug-actions">
//             <label className="lbl">&nbsp;</label>
//             <button
//               className="btn"
//               type="button"
//               onClick={() => update("slug", safeSlug(form.title))}
//             >
//               Generate
//             </button>
//           </div>

//           <div className="field field--full">
//             <label className="lbl">Tags (comma separated)</label>
//             <input
//               className="input"
//               value={(form.tags || []).join(", ")}
//               onChange={(e) => setTagsFromText(e.target.value)}
//             />
//           </div>

//           <div className="field field--full">
//             <label className="lbl">Lead (bold intro)</label>
//             <textarea
//               className="input"
//               rows={3}
//               value={form.excerpt || ""}
//               onChange={(e) => update("excerpt", e.target.value)}
//             />
//           </div>

//           <div className="field field--full">
//             <label className="lbl">Cover image URL</label>
//             <input
//               className="input"
//               value={form.coverImage || ""}
//               onChange={(e) => update("coverImage", e.target.value)}
//               placeholder="https://"
//             />
//           </div>

//           <div className="field field--full">
//             <label className="lbl">Upload cover</label>

//             <div className="news-dialog__file">
//               <input
//                 ref={coverRef}
//                 type="file"
//                 accept="image/*"
//                 className="news-dialog__file-hidden"
//                 onChange={(e) => {
//                   const f = e.target.files?.[0];
//                   setCoverFileName(f?.name || "");
//                   uploadCover(f);
//                 }}
//               />

//               <button
//                 type="button"
//                 className="btn"
//                 onClick={() => coverRef.current?.click()}
//               >
//                 Datei auswählen
//               </button>

//               <span
//                 className={
//                   "news-dialog__file-name" + (!coverFileName ? " is-empty" : "")
//                 }
//               >
//                 {coverFileName || "Keine ausgewählt"}
//               </span>
//             </div>
//           </div>

//           <div className="field field--full">
//             <label className="lbl">Article content</label>

//             <div className="mb-2 text-sm">
//               {contentLen.toLocaleString()} /{" "}
//               {MAX_CONTENT_CHARS.toLocaleString()} Zeichen
//             </div>

//             <Editor
//               value={form.content || ""}
//               onChange={(v) => setContent(v)}
//               onInsertTemplate={insertTemplate}
//               onBold={() => insertSnippet("**Bold text**")}
//               onH2={() => insertSnippet("## Heading")}
//               onUl={() => insertSnippet("- Item\n- Item\n- Item")}
//               onOl={() => insertSnippet("1. Item\n2. Item\n3. Item")}
//               onQuote={() => insertSnippet("> Quote")}
//             />
//           </div>

//           <div className="field field--full">
//             <label className="lbl">Media (image/video)</label>
//             <MediaManager
//               items={form.media || []}
//               upload={upload}
//               onChange={(m) => update("media", m)}
//             />
//           </div>

//           <div className="field field--full news-dialog__publish">
//             <label className="news-dialog__check">
//               <input
//                 type="checkbox"
//                 checked={!!form.published}
//                 onChange={togglePublished}
//               />
//               <span>Published</span>
//             </label>
//           </div>
//         </div>

//         <div className="news-dialog__footer">
//           <button
//             className="btn"
//             onClick={saveNow}
//             disabled={busy}
//             type="button"
//           >
//             {busy ? "Saving..." : mode === "create" ? "Create" : "Save"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
