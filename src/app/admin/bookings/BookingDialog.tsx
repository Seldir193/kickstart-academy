// app/admin/bookings/BookingDialog.tsx
'use client';

import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

type Status = 'pending' | 'processing' | 'confirmed' | 'cancelled' | 'deleted';

export type Booking = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  date: string; // yyyy-mm-dd oder ISO
  level: string;
  message?: string;
  createdAt: string;
  status?: Status;
  confirmationCode?: string;
};

type Props = {
  booking: Booking;
  onClose: () => void;
  onConfirm: () => Promise<string>;
  onResend: () => Promise<string>;
  onSetStatus: (s: Status) => Promise<string>;
  onDelete: () => Promise<string>;
  onCancelConfirmed: () => Promise<string>;
  notify: (text: string) => void;
};

/* ============ Portal ============ */
function ModalPortal({ children }: { children: React.ReactNode }) {
  if (typeof document === 'undefined') return null;
  return createPortal(children, document.body);
}

/* ============ Helper ============ */

function fmtDate_DE(value?: string) {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat('de-DE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(d);
}

function fmtDateOnly_DE(value?: string) {
  if (!value) return '—';
  const isoGuess = /T|\d{2}:\d{2}/.test(value) ? value : value + 'T00:00:00';
  const d = new Date(isoGuess);
  if (isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium' }).format(d);
}

function asStatus(s?: Booking['status']): Status {
  return (s ?? 'pending') as Status;
}

/** Zerlegt bekannte Teile der Freitext-Message in Zeilen */
function messageToLines(msg?: string): string[] {
  if (!msg) return [];
  let t = msg.trim();

  t = t
    .replace(/\s*,\s*Geburtstag:/gi, '\nGeburtstag:')
    .replace(/\s*,\s*Kontakt:/gi, '\nKontakt:')
    .replace(/\s*,\s*Adresse:/gi, '\nAdresse:')
    .replace(/\s*,\s*Telefon:/gi, '\nTelefon:')
    .replace(/\s*,\s*Gutschein:/gi, '\nGutschein:')
    .replace(/\s*,\s*Quelle:/gi, '\nQuelle:')
    .replace(/\s*,\s*Kind:/gi, '\nKind:');

  t = t.replace(/^\s*Anmeldung\b/i, 'Anmeldung');

  return t.split('\n').map((s) => s.trim()).filter(Boolean);
}

function splitLabelValue(line: string): { label?: string; value: string } {
  const i = line.indexOf(':');
  if (i === -1) return { value: line };
  const label = line.slice(0, i).trim();
  const value = line.slice(i + 1).trim();
  return { label, value };
}

/** Holt „Programm“ / „Kind Programm“ aus der Message */
function extractProgramInfo(msg?: string): { label: string; value: string } | null {
  const lines = messageToLines(msg);
  for (const ln of lines) {
    const { label, value } = splitLabelValue(ln);
    if (!label) continue;
    const l = label.toLowerCase();
    if (l.includes('programm')) {
      return { label, value };
    }
  }
  return null;
}

function extractProgramName(msg?: string): string | null {
  if (!msg) return null;
  const m = msg.match(/Programm:\s*(.+)/i);
  return m ? m[1].trim() : null;
}


/** Entscheidet, ob Wunschtermin angezeigt werden soll */
function shouldShowWishDate(programName?: string, level?: string): boolean {
  const text = (programName || level || '').toLowerCase();

  if (!text) return true; // zur Sicherheit anzeigen, wenn wir nichts wissen

  // Nicht-Weekly: Rent a Coach / Trainer, Coach Education, Camps, Powertraining, Individual
  const nonWeeklyKeywords = [
    'rent a coach',
    'rent a trainer',
    'rentacoach',
    'rentatrainer',
    'coach education',
    'training camp',
    'camp',
    'feriencamp',
    'holiday camp',
    'powertraining',
    '1:1',
    'individual',
    'athletik',
    'torwart'
  ];

  if (nonWeeklyKeywords.some((k) => text.includes(k))) return false;

  // Typische Weekly-Schlüsselwörter – eher zur Doku
  const weeklyKeywords = ['fördertraining', 'foerdertraining', 'kindergarten'];
  if (weeklyKeywords.some((k) => text.includes(k))) return true;

  // Default: anzeigen
  return true;
}

/* ============ Component ============ */

export default function BookingDialog({
  booking,
  onClose,
  onConfirm,
  onResend,
  onSetStatus,
  onDelete,
  onCancelConfirmed,
  notify,
}: Props) {
  const [busy, setBusy] = useState<string>('');
  const [msg, setMsg] = useState<{
    processing?: string;
    confirm?: string;
    resend?: string;
    cancelled?: string;
    cancelConfirmed?: string;
  }>({});

  const s = booking.status ?? 'pending';

  function flash(key: keyof typeof msg, text: string) {
    setMsg((prev) => ({ ...prev, [key]: text }));
    window.setTimeout(() => {
      setMsg((prev) => ({ ...prev, [key]: undefined }));
    }, 5000);
  }

  const programInfo = useMemo(
    () => extractProgramInfo(booking.message),
    [booking.message]
  );

  const showWishDate = useMemo(
    () => shouldShowWishDate(programInfo?.value, booking.level),
    [programInfo?.value, booking.level]
  );

  const messageLines = useMemo(() => {
    const lines = messageToLines(booking.message);
    // Programm-Zeile aus der Nachricht entfernen, weil wir sie oben separat anzeigen
    return lines.filter((ln) => {
      const { label } = splitLabelValue(ln);
      if (!label) return true;
      const l = label.toLowerCase();
      return !l.includes('programm');
    });
  }, [booking.message]);

  return (
    <ModalPortal>
      <div className="ks-modal-root ks-modal-root--top">
        <div className="ks-backdrop" onClick={onClose} />
        <div
          className="ks-panel ks-panel--md card"
          role="dialog"
          aria-modal="true"
          aria-label="Booking details"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="dialog-head">
            <div className="dialog-head__left">
              <h2 className="text-xl font-bold">
                {booking.firstName} {booking.lastName}
              </h2>
              
              <span
                className={`badge ${
                  s === 'cancelled' || s === 'deleted' ? 'badge-muted' : ''
                }`}
              >
                {asStatus(booking.status)}
              </span>
            </div>
            <div className="dialog-head__actions">
              <button className="btn" onClick={onClose}>
                Close
              </button>
            </div>
          </div>

          {/* Aktionsleiste (Einzel) */}
          <div className="flex flex-wrap gap-2 justify-end mb-3">
            {/* „In Bearbeitung“ nur aus pending */}
            {s === 'pending' && (
              <div className="flex items-center gap-2">
                <button
                  className="btn"
                  disabled={busy === 'processing'}
                  onClick={async () => {
                    try {
                      setBusy('processing');
                      const text = await onSetStatus('processing');
                      flash('processing', text);
                      notify(text);
                    } catch (e: any) {
                      const t = e?.message || 'Aktion fehlgeschlagen';
                      flash('processing', t);
                      notify(t);
                    } finally {
                      setBusy('');
                    }
                  }}
                >
                  {busy === 'processing' ? 'Bitte warten…' : 'In Bearbeitung'}
                </button>
                {msg.processing && (
                  <span className="text-sm ok">{msg.processing}</span>
                )}
              </div>
            )}

            {/* Bestätigen NICHT wenn cancelled/deleted/confirmed */}
            {s !== 'confirmed' && s !== 'cancelled' && s !== 'deleted' && (
              <div className="flex items-center gap-2">
                <button
                  className="btn btn-primary"
                  disabled={busy === 'confirm'}
                  onClick={async () => {
                    try {
                      setBusy('confirm');
                      const text = await onConfirm();
                      flash('confirm', text);
                      notify(text);
                    } catch (e: any) {
                      const t = e?.message || 'Aktion fehlgeschlagen';
                      flash('confirm', t);
                      notify(t);
                    } finally {
                      setBusy('');
                    }
                  }}
                >
                  {busy === 'confirm' ? 'Bitte warten…' : 'Bestätigen'}
                </button>
                {msg.confirm && (
                  <span className="text-sm ok">{msg.confirm}</span>
                )}
              </div>
            )}

            {/* Erneut senden nur im confirmed */}
            {s === 'confirmed' && (
              <div className="flex items-center gap-2">
                <button
                  className="btn"
                  disabled={busy === 'resend'}
                  onClick={async () => {
                    try {
                      setBusy('resend');
                      const text = await onResend();
                      flash('resend', text);
                      notify(text);
                    } catch (e: any) {
                      const t = e?.message || 'Aktion fehlgeschlagen';
                      flash('resend', t);
                      notify(t);
                    } finally {
                      setBusy('');
                    }
                  }}
                >
                  {busy === 'resend' ? 'Bitte warten…' : 'Erneut senden'}
                </button>
                {msg.resend && (
                  <span className="text-sm ok">{msg.resend}</span>
                )}
              </div>
            )}

            {/* Absage für bestätigte Termine */}
            {s === 'confirmed' && (
              <div className="flex items-center gap-2">
                <button
                  className="btn btn--danger"
                  disabled={busy === 'cancelConfirmed'}
                  onClick={async () => {
                    try {
                      setBusy('cancelConfirmed');
                      const text = await onCancelConfirmed();
                      flash('cancelConfirmed', text);
                      notify(text);
                    } catch (e: any) {
                      const t = e?.message || 'Aktion fehlgeschlagen';
                      flash('cancelConfirmed', t);
                      notify(t);
                    } finally {
                      setBusy('');
                    }
                  }}
                >
                  {busy === 'cancelConfirmed'
                    ? 'Bitte warten…'
                    : 'Bestätigten Termin absagen'}
                </button>
                {msg.cancelConfirmed && (
                  <span className="text-sm ok">{msg.cancelConfirmed}</span>
                )}
              </div>
            )}

            {/* Normale Absage NICHT in confirmed/cancelled/deleted */}
            {s !== 'cancelled' && s !== 'deleted' && s !== 'confirmed' && (
              <div className="flex items-center gap-2">
                <button
                  className="btn"
                  disabled={busy === 'cancelled'}
                  onClick={async () => {
                    try {
                      setBusy('cancelled');
                      const text = await onSetStatus('cancelled');
                      flash('cancelled', text);
                      notify(text);
                    } catch (e: any) {
                      const t = e?.message || 'Aktion fehlgeschlagen';
                      flash('cancelled', t);
                      notify(t);
                    } finally {
                      setBusy('');
                    }
                  }}
                >
                  {busy === 'cancelled' ? 'Bitte warten…' : 'Absagen'}
                </button>
                {msg.cancelled && (
                  <span className="text-sm ok">{msg.cancelled}</span>
                )}
              </div>
            )}

            {/* Löschen immer möglich außer schon deleted */}
            {s !== 'deleted' && (
              <div className="flex items-center gap-2">
                <button
                  className="btn"
                  disabled={busy === 'delete'}
                  onClick={async () => {
                    try {
                      setBusy('delete');
                      const text = await onDelete();
                      notify(text);
                      onClose();
                    } finally {
                      setBusy('');
                    }
                  }}
                >
                  {busy === 'delete' ? 'Bitte warten…' : 'Löschen'}
                </button>
              </div>
            )}
          </div>

          {/* Read-only Inhalte */}
          <div className="form-columns mb-3">
            <fieldset className="card">
              <legend className="font-bold">Buchung</legend>
              <div className="grid grid-cols-2 gap-2">
                {/* Programm: immer über dem Kind / restlichen Infos */}
                {programInfo && (
                  <div className="col-span-2">
                    <label className="lbl">Programm</label>
                    
                    <div>{extractProgramName(booking.message) || '—'}</div>
                  </div>
                )}

                <div>
                  <label className="lbl">Name</label>
                  <div>
                    {booking.firstName} {booking.lastName}
                  </div>
                </div>
                <div>
                  <label className="lbl">E-Mail</label>
                  <div>{booking.email || '—'}</div>
                </div>
                <div>
                  <label className="lbl">Alter</label>
                  <div>{booking.age ?? '—'}</div>
                </div>

               

                {/* Wunschtermin nur anzeigen, wenn es ein Schnuppertraining (Weekly) ist */}
                  { /schnuppertraining/i.test(booking.message || '') && (
                    <div>
                      <label className="lbl">Wunschtermin</label>
                      <div>{fmtDateOnly_DE(booking.date)}</div>
                    </div>
                  )}

                <div>
                  <label className="lbl">Erstellt</label>
                  <div>{fmtDate_DE(booking.createdAt)}</div>
                </div>
                <div>
                  <label className="lbl">Bestätigungscode</label>
                  <div>{booking.confirmationCode || '—'}</div>
                </div>
              </div>
            </fieldset>

            <fieldset className="card">
              <legend className="font-bold">Nachricht</legend>
              {messageLines.length ? (
                <ul className="card-list">
                  {messageLines.map((ln, i) => {
                    const { label, value } = splitLabelValue(ln);
                    return (
                      <li key={i}>
                        {label ? (
                          <>
                            <strong>{label}:</strong> {value || '—'}
                          </>
                        ) : (
                          ln
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div>—</div>
              )}
            </fieldset>
          </div>

          <div className="flex justify-end mt-3">
            <button className="btn" onClick={onClose}>
              Schließen
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}














