// app/admin/news/page.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Media = { type: 'image' | 'video'; url: string; alt?: string; title?: string };
type News = {
  _id?: string;
  date: string; // YYYY-MM-DD
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  media?: Media[];
  published?: boolean;
  category?: 'Allgemein' | 'News' | 'Partnerverein' | 'Projekte';
  tags?: string[];
};

type ListResponse = {
  ok: boolean;
  items: News[];
  total: number;
  page: number;
  pages: number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';
const NEWS_API = `${API_BASE}/api/news`;
const UPLOAD_API = `${API_BASE}/api/upload`;
const WP_DETAIL = 'http://localhost/wordpress/index.php/news-detail/?slug=';

const CATEGORIES: News['category'][] = ['Allgemein', 'News', 'Partnerverein', 'Projekte'];

function safeSlug(s: string) {
  return (s || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/* =========================
   Dialog-Komponente (Create/Edit)
========================= */
type NewsDialogProps = {
  mode: 'create' | 'edit';
  initial?: News | null;
  onClose: () => void;
  onCreated?: () => void;
  onSaved?: () => void;
  onDeleted?: () => void;
  uploadFile: (file: File) => Promise<{ url: string; mimetype: string }>;
  saveRecord: (n: News) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
};

function NewsDialog({
  mode,
  initial,
  onClose,
  onCreated,
  onSaved,
  onDeleted,
  uploadFile,
  saveRecord,
  deleteRecord,
}: NewsDialogProps) {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  const blank: News = {
    date: todayISO(),
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    coverImage: '',
    media: [],
    published: true,
    category: 'News',
    tags: [],
  };

  const [form, setForm] = useState<News>(() =>
    mode === 'edit' && initial ? { ...initial } : { ...blank }
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [categoryOpen, setCategoryOpen] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && initial) setForm({ ...initial });
    if (mode === 'create') setForm({ ...blank });
    setCategoryOpen(false);  
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, initial?._id]);

  const tagInput = useMemo(() => (form.tags || []).join(', '), [form.tags]);

  async function handleSave() {
    setBusy(true);
    setErr(null);
    try {
      const final: News = {
        ...form,
        title: (form.title || '').trim(),
        slug: form.slug?.trim() ? form.slug : safeSlug(form.title),
        date: (form.date || todayISO()).slice(0, 10),
        tags: (form.tags || []).map((t) => t.trim()).filter(Boolean),
      };
      if (!final.title) throw new Error('Titel fehlt.');
      await saveRecord(final);
      if (mode === 'create') onCreated?.();
      else onSaved?.();
      onClose();
    } catch (e: any) {
      setErr(e?.message || 'Speichern fehlgeschlagen.');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!form._id) return;
    const ok = confirm('Wirklich löschen?');
    if (!ok) return;
    setBusy(true);
    setErr(null);
    try {
      await deleteRecord(form._id);
      onDeleted?.();
      onClose();
    } catch (e: any) {
      setErr(e?.message || 'Löschen fehlgeschlagen.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ks-modal-root">
      <div className="ks-backdrop" onClick={onClose} />
      <div className="ks-panel card ks-panel--md" onClick={(e) => e.stopPropagation()}>
        {/* Header im CustomerDialog-Stil */}
        <div className="dialog-head">
          <div className="dialog-head__left">
            <h2 className="text-xl font-bold">
              {mode === 'create' ? 'Neuer Beitrag' : form.title || 'Beitrag'}
            </h2>
            <span className="badge">{mode === 'create' ? 'Neu' : 'Bearbeiten'}</span>
          </div>
          <div className="dialog-head__actions">
            {mode === 'edit' && form.slug ? (
              <a
                className="btn"
                href={`${WP_DETAIL}${encodeURIComponent(form.slug)}`}
                target="_blank"
                rel="noreferrer"
              >
                Vorschau
              </a>
            ) : null}
            <button className="btn" onClick={onClose} type="button">
              Schließen
            </button>
          </div>
        </div>

        {err && <div className="mb-2 text-red-600">{err}</div>}

        {/* Formular-Inhalt */}
        <div className="form">
          <div className="grid" style={{ gap: 16, gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <label className="lbl">Datum</label>
              <input
                type="date"
                className="input"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div>
             
             


            
  <label className="lbl">Kategorie</label>
  <div
    className={
      'ks-selectbox' + (categoryOpen ? ' ks-selectbox--open' : '')
    }
  >
    <button
      type="button"
      className="ks-selectbox__trigger"
      onClick={() => setCategoryOpen((o) => !o)}
      aria-haspopup="listbox"
      aria-expanded={categoryOpen}
    >
      <span className="ks-selectbox__label">
        {form.category || 'News'}
      </span>
      <span className="ks-selectbox__chevron" aria-hidden="true" />
    </button>

    {categoryOpen && (
      <div className="ks-selectbox__panel" role="listbox">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            className={
              'ks-selectbox__option' +
              ((form.category || 'News') === c
                ? ' ks-selectbox__option--active'
                : '')
            }
            onClick={() => {
              setForm({ ...form, category: c });
              setCategoryOpen(false);
            }}
          >
            {c}
          </button>
        ))}
      </div>
    )}
  </div>
</div>


</div>
          </div>

          <div>

          <div>
            <label className="lbl">Überschrift</label>
            <input
              className="input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              onBlur={() => {
                if (!form.slug?.trim() && form.title) {
                  setForm((d) => ({ ...d, slug: safeSlug(d.title) }));
                }
              }}
            />
          </div>

          <div className="grid" style={{ gap: 16, gridTemplateColumns: '1fr auto' }}>
            <div>
              <label className="lbl">Slug (für Detailseite)</label>
              <input
                className="input"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: safeSlug(e.target.value) })}
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                className="btn"
                onClick={() => setForm({ ...form, slug: safeSlug(form.title) })}
              >
                Generieren
              </button>
            </div>
          </div>

          <div>
            <label className="lbl">Schlagwörter (kommagetrennt)</label>
            <input
              className="input"
              value={(form.tags || []).join(', ')}
              onChange={(e) =>
                setForm({
                  ...form,
                  tags: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                })
              }
            />
          </div>

          <div>
            <label className="lbl">Teaser (Excerpt)</label>
            <textarea
              className="input"
              rows={2}
              value={form.excerpt || ''}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            />
          </div>

          <div>
            <label className="lbl">Inhalt (HTML/Markdown)</label>
            <textarea
              className="input"
              rows={8}
              value={form.content || ''}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="<p>…</p> oder Markdown"
            />
          </div>

          <div>
            <label className="lbl">Cover-Bild URL</label>
            <input
              className="input"
              value={form.coverImage || ''}
              onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
              placeholder="https://…"
            />
          </div>

          <div className="grid" style={{ gap: 12, gridTemplateColumns: '1fr auto' }}>
            <div>
              <label className="lbl">Cover-Bild hochladen</label>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  try {
                    const up = await uploadFile(f);
                    setForm({ ...form, coverImage: up.url });
                    if (coverInputRef.current) coverInputRef.current.value = '';
                  } catch (err: any) {
                    alert(err?.message || 'Upload fehlgeschlagen');
                  }
                }}
              />
            </div>
            {form.coverImage ? (
              <div className="flex items-end justify-end">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.coverImage} alt="" style={{ maxWidth: 180, maxHeight: 60 }} />
              </div>
            ) : null}
          </div>

          <div>
            <label className="lbl">Medien (Bild/Video) hochladen</label>
            <input
              ref={mediaInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                try {
                  const up = await uploadFile(f);
                  const type: Media['type'] = up.mimetype.startsWith('video/') ? 'video' : 'image';
                  setForm({
                    ...form,
                    media: [...(form.media || []), { type, url: up.url, alt: '', title: '' }],
                  });
                  if (mediaInputRef.current) mediaInputRef.current.value = '';
                } catch (err: any) {
                  alert(err?.message || 'Upload fehlgeschlagen');
                }
              }}
            />
            {(form.media || []).length > 0 && (
              <div className="grid" style={{ gap: 8, marginTop: 8 }}>
                {(form.media || []).map((m, i) => (
                  <div key={i} className="actions">
                    <span className="badge">{m.type.toUpperCase()}</span>
                    <a href={m.url} target="_blank" rel="noreferrer" className="btn">
                      ansehen
                    </a>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => {
                        const next = [...(form.media || [])];
                        next.splice(i, 1);
                        setForm({ ...form, media: next });
                      }}
                    >
                      Entfernen
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
            />
            <span>veröffentlicht</span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap gap-2 justify-end mt-3">
          {mode === 'edit' && form._id ? (
            <button
              className="btn"
              onClick={handleDelete}
              disabled={busy}
              type="button"
              title="Beitrag löschen"
            >
              {busy ? 'Bitte warten…' : 'Löschen'}
            </button>
          ) : null}
          <button className="btn" onClick={handleSave} disabled={busy} type="button">
            {busy ? 'Speichere…' : mode === 'create' ? 'Anlegen' : 'Speichern'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================
   Hauptseite (Liste)
========================= */
export default function NewsAdminPage() {
  const [items, setItems] = useState<News[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 10;
  const [pages, setPages] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<News | null>(null);

  // Auswahl (Checkboxen)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${NEWS_API}?limit=${limit}&page=${page}`);
      const js: ListResponse = await res.json();
      if (!res.ok || !js?.ok) throw new Error('Konnte News nicht laden.');
      setItems(Array.isArray(js.items) ? js.items : []);
      setPages(Number(js.pages || 1));
      // Auswahl leeren, wenn Seite wechselt / reload
      setSelectedIds(new Set());
    } catch (e: any) {
      setError(e?.message || 'Fehler beim Laden.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function uploadFile(file: File) {
    const fd = new FormData();
    fd.append('file', file);
    const r = await fetch(UPLOAD_API, { method: 'POST', body: fd });
    const js = await r.json();
    if (!r.ok || !js?.ok) throw new Error(js?.error || 'Upload fehlgeschlagen.');
    return js as { url: string; mimetype: string };
  }

  async function saveRecord(n: News) {
    const isEdit = Boolean(n._id);
    const url = isEdit ? `${NEWS_API}/${n._id}` : NEWS_API;
    const method = isEdit ? 'PATCH' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(n),
    });
    const js = await res.json().catch(() => ({}));
    if (!res.ok || js?.ok === false) {
      throw new Error(js?.error || 'Speichern fehlgeschlagen.');
    }
    await load();
  }

  async function deleteRecord(id: string) {
    const res = await fetch(`${NEWS_API}/${id}`, { method: 'DELETE' });
    const js = await res.json().catch(() => ({}));
    if (!res.ok || js?.ok === false) {
      throw new Error(js?.error || 'Löschen fehlgeschlagen.');
    }
  }

  // Bulk-Delete ohne Confirm/Alert
  async function deleteSelected() {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    try {
      setLoading(true);
      // nacheinander oder parallel – hier parallel
      await Promise.all(ids.map((id) => deleteRecord(id)));
      await load();
    } finally {
      setLoading(false);
    }
  }

  // Auswahl-Helpers
  const allIdsOnPage = useMemo(
    () => items.map((n) => String(n._id)).filter(Boolean),
    [items]
  );
  const isAllSelected = allIdsOnPage.length > 0 && allIdsOnPage.every((id) => selectedIds.has(id));
  const someSelected = allIdsOnPage.some((id) => selectedIds.has(id));

  function toggleOne(id?: string) {
    if (!id) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function selectAllOnPage() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      allIdsOnPage.forEach((id) => next.add(id));
      return next;
    });
  }
  function clearSelection() {
    setSelectedIds(new Set());
  }

  return (
    <div className="news-admin ks">
      <main className="container">
        {/* Kopfzeile */}
        <div className="dialog-subhead">
          <h1 className="text-2xl font-bold m-0">News verwalten</h1>
          <button className="btn" onClick={() => setCreateOpen(true)} type="button">
            + Neuer Beitrag
          </button>
        </div>

           
    

        {error && (
          <div className="card" role="alert">
            <div className="text-red-600">{error}</div>
          </div>
        )}

        {/* Auswahl-Aktionen (oben) */}
        <div className="actions" style={{ marginBottom: 8, gap: 8 }}>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={() => {
                if (isAllSelected) {
                  // alle auf dieser Seite aus Auswahl entfernen
                  setSelectedIds((prev) => {
                    const next = new Set(prev);
                    allIdsOnPage.forEach((id) => next.delete(id));
                    return next;
                  });
                } else {
                  selectAllOnPage();
                }
              }}
            />
            <span>Alle auswählen</span>
          </label>

          <button type="button" className="btn" onClick={clearSelection}>
            Clear
          </button>

          <button
            type="button"
            className="btn btn--danger"
            onClick={deleteSelected}
            disabled={selectedIds.size === 0 || loading}
          >
            Delete selected ({selectedIds.size})
          </button>
        </div>

        {/* Liste */}
        <section className="card">
          {loading ? (
            <div className="card__empty">Loading…</div>
          ) : items.length === 0 ? (
            <div className="card__empty">Keine Einträge.</div>
          ) : (
            <ul className="list list--bleed">
              {items.map((n) => {
                const id = String(n._id || '');
                const checked = selectedIds.has(id);
                return (
                  <li
                    key={id}
                    className="list__item chip is-fullhover is-interactive"
                    onClick={() => setEditItem(n)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setEditItem(n);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Beitrag öffnen: ${n.title}`}
                  >
                    {/* Checkbox links */}
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleOne(id);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      aria-label="Eintrag auswählen"
                      style={{ marginRight: 8 }}
                    />

                    <div className="list__body">
                      <div className="list__title">{n.title}</div>
                      <div className="list__meta">
                        {(n.category || 'News')}{' · '}
                        {n.date ? new Date(n.date).toLocaleDateString() : ''}
                      </div>
                      {n.excerpt ? <div className="text-sm mt-3">{n.excerpt}</div> : null}
                    </div>

                    {/* Edit-Icon rechts (kein Button-Style) */}
                    <div className="list__actions" onClick={(e) => e.stopPropagation()}>
                      <span
                        className="edit-trigger"
                        role="button"
                        tabIndex={0}
                        title="Edit"
                        aria-label="Edit"
                        onClick={() => setEditItem(n)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setEditItem(n);
                          }
                        }}
                      >
                        <img src="/icons/edit.svg" alt="" aria-hidden="true" className="icon-img" />
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Pager – Icon-Style wie Invoices */}
        <div className="pager pager--arrows">
          <button
            type="button"
            className="btn"
            aria-label="Previous page"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <img
              src="/icons/arrow_right_alt.svg"
              alt=""
              aria-hidden="true"
              className="icon-img icon-img--left"
            />
          </button>

          <div className="pager__count" aria-live="polite" aria-atomic="true">
            {page} / {pages}
          </div>

          <button
            type="button"
            className="btn"
            aria-label="Next page"
            disabled={page >= pages}
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
          >
            <img src="/icons/arrow_right_alt.svg" alt="" aria-hidden="true" className="icon-img" />
          </button>
        </div>
      </main>

      {/* Dialogs */}
      {createOpen && (
        <NewsDialog
          mode="create"
          initial={null}
          onClose={() => setCreateOpen(false)}
          onCreated={() => {}}
          uploadFile={uploadFile}
          saveRecord={saveRecord}
          deleteRecord={deleteRecord}
        />
      )}
      {editItem && (
        <NewsDialog
          mode="edit"
          initial={editItem}
          onClose={() => setEditItem(null)}
          onSaved={() => {}}
          onDeleted={() => {}}
          uploadFile={uploadFile}
          saveRecord={saveRecord}
          deleteRecord={deleteRecord}
        />
      )}

      <style jsx>{`
        .list__body { flex: 1 1 auto; min-width: 0; }
      `}</style>
    </div>
  );
}













