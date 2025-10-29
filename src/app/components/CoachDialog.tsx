'use client';

import React from 'react';

type Coach = {
  slug: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  position?: string;
  degree?: string;
  since?: string;
  dfbLicense?: string;
  mfsLicense?: string;
  favClub?: string;
  favCoach?: string;
  favTrick?: string;
  photoUrl?: string;
};

export default function CoachDialog({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
}: {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: Partial<Coach>;
  onClose: () => void;
  onSubmit: (values: Partial<Coach>) => Promise<void>;
}) {
  const [values, setValues] = React.useState<Partial<Coach>>(initial || {});
  const [uploading, setUploading] = React.useState(false);
  const [fileName, setFileName] = React.useState<string>("");

  React.useEffect(() => {
    if (open) {
      setValues(initial || {});
      setUploading(false);
      setFileName(""); // Reset Dateiname bei neuem Öffnen
    }
  }, [initial, open]);

  function set<K extends keyof Coach>(k: K, v: Coach[K]) {
    setValues((prev) => ({ ...prev, [k]: v }));
  }

  const title = mode === 'create' ? 'Neuer Coach' : 'Coach bearbeiten';

  function isValidPhotoUrl(u?: string): boolean {
  if (!u) return false;
  return /^data:image\//.test(u) || /^https?:\/\//.test(u) || u.startsWith('/');
}


  if (!open) return null;

  async function handleSave() {
    await onSubmit(values);
  }

  // Datei -> Data-URL -> photoUrl
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Bitte eine Bilddatei auswählen.');
      return;
    }
    setFileName(file.name);
    setUploading(true);
    try {
      const dataUrl = await readFileAsDataURL(file);
      set('photoUrl', dataUrl as unknown as string);
    } catch {
      alert('Bild konnte nicht gelesen werden.');
    } finally {
      setUploading(false);
    }
  }

  function readFileAsDataURL(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('read error'));
      reader.onload = () => resolve(String(reader.result || ''));
      reader.readAsDataURL(file);
    });
  }

  function clearPhoto() {
    set('photoUrl', '');
    setFileName('');
  }

  // Dateiname auf Form "Sel....png" kürzen
  function formatFileName(name: string) {
    if (!name) return '';
    const dot = name.lastIndexOf('.');
    const base = dot > 0 ? name.slice(0, dot) : name;
    const ext  = dot > 0 ? name.slice(dot) : '';
    if (base.length <= 6) return name; // kurze Namen unverändert
    return `${base.slice(0, 3)}....${ext || ''}`;
  }

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-head">
          <h3 className="dialog-title m-0">{title}</h3>
        </div>

        <div className="dialog-body grid grid-cols-2 gap-3">
          <label className="col-span-1">
            <div className="label">Vorname</div>
            <input
              className="input"
              value={values.firstName || ''}
              onChange={(e) => set('firstName', e.target.value)}
            />
          </label>

          <label className="col-span-1">
            <div className="label">Nachname</div>
            <input
              className="input"
              value={values.lastName || ''}
              onChange={(e) => set('lastName', e.target.value)}
            />
          </label>

          <label className="col-span-2">
            <div className="label">Name (optional, überschreibt Vor/Nachname)</div>
            <input
              className="input"
              value={values.name || ''}
              onChange={(e) => set('name', e.target.value)}
            />
          </label>

          <label className="col-span-1">
            <div className="label">Position</div>
            <input
              className="input"
              value={values.position || 'Trainer'}
              onChange={(e) => set('position', e.target.value)}
            />
          </label>

          <label className="col-span-1">
            <div className="label">Seit (z. B. 2021)</div>
            <input
              className="input"
              value={values.since || ''}
              onChange={(e) => set('since', e.target.value)}
            />
          </label>

          <label className="col-span-2">
            <div className="label">Abschluss</div>
            <input
              className="input"
              value={values.degree || ''}
              onChange={(e) => set('degree', e.target.value)}
            />
          </label>

          <label className="col-span-1">
            <div className="label">DFB Lizenz</div>
            <input
              className="input"
              value={values.dfbLicense || ''}
              onChange={(e) => set('dfbLicense', e.target.value)}
            />
          </label>

          <label className="col-span-1">
            <div className="label">MFS Lizenz</div>
            <input
              className="input"
              value={values.mfsLicense || ''}
              onChange={(e) => set('mfsLicense', e.target.value)}
            />
          </label>

          <label className="col-span-1">
            <div className="label">Lieblingsverein</div>
            <input
              className="input"
              value={values.favClub || ''}
              onChange={(e) => set('favClub', e.target.value)}
            />
          </label>

          <label className="col-span-1">
            <div className="label">Lieblingstrainer</div>
            <input
              className="input"
              value={values.favCoach || ''}
              onChange={(e) => set('favCoach', e.target.value)}
            />
          </label>

          <label className="col-span-2">
            <div className="label">Lieblingstrick</div>
            <input
              className="input"
              value={values.favTrick || ''}
              onChange={(e) => set('favTrick', e.target.value)}
            />
          </label>

          {/* Foto: Vorschau, Upload (custom Button + gekürzter Dateiname), Entfernen darunter */}
          <div className="col-span-2">
            <div className="label">Foto</div>

            {/* Vorschau */}
        
{isValidPhotoUrl(values.photoUrl) ? (
  <img
    src={values.photoUrl!}
    alt="Coach Foto"
    className="coach-table__avatar"
    onError={(e) => {
      // Falls eine scheinbar gültige URL 404 liefert → leise auf Placeholder umschalten
      const el = e.currentTarget;
      el.replaceWith(Object.assign(document.createElement('span'), {
        className: 'coach-table__avatar coach-table__avatar--ph',
        ariaHidden: 'true'
      }) as unknown as Node);
    }}
  />
) : (
  <span className="coach-table__avatar coach-table__avatar--ph" aria-hidden="true" />
)}



            {/* Uploadzeile: eigener Button + gekürzter Dateiname */}
            <div className="mt-3">
              <label className="btn">
                Datei auswählen
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="sr-only"
                />
              </label>
              <span className="ml-2">
                {fileName ? formatFileName(fileName) : 'Keine Datei gewählt'}
              </span>
            </div>

            {/* Entfernen-Button unter dem Upload */}
            <div className="mt-3">
              <button
                type="button"
                className="btn"
                onClick={clearPhoto}
                disabled={!values.photoUrl || uploading}
              >
                Bild entfernen
              </button>
            </div>
          </div>
        </div>

        <div className="dialog-foot">
          <button className="btn" onClick={onClose} disabled={uploading}>
            Abbrechen
          </button>
          <button className="btn btn--primary" onClick={handleSave} disabled={uploading}>
            {uploading ? 'Lädt…' : 'Speichern'}
          </button>
        </div>
      </div>
    </div>
  );
}















