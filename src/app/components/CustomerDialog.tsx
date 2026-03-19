// "use client";

// import { useEffect, useMemo, useRef, useState } from "react";

// /* ================== Types ================== */
// type Offer = {
//   _id: string;
//   title?: string;
//   type?: string;
//   location?: string;
// };

// type Booking = {
//   _id: string;
//   offerId: string;
//   offerTitle?: string;
//   status?: "active" | "cancelled" | "pending" | "completed";
//   startDate?: string | null; // optional
//   cancelAt?: string | null;
//   createdAt?: string;
// };

// type Customer = {
//   _id: string;
//   userId?: number;
//   newsletter?: boolean;
//   notes?: string;

//   // Child
//   child?: {
//     firstName?: string;
//     lastName?: string;
//     gender?: "weiblich" | "männlich" | "";
//     birthDate?: string | null;
//     club?: string;
//   };
//   // Parent
//   parent?: {
//     salutation?: "Frau" | "Herr" | "";
//     firstName?: string;
//     lastName?: string;
//     email?: string;
//     phone?: string;
//     phone2?: string;
//   };
//   // Address
//   address?: {
//     street?: string;
//     houseNo?: string;
//     zip?: string;
//     city?: string;
//   };

//   bookings?: Booking[];
// };

// /* ================== Body lock helpers (wie offers-dialog) ================== */
// const LOCK_ATTR = "data-ks-modal-lock";
// function lockBody() {
//   if (!document.body.hasAttribute(LOCK_ATTR)) {
//     document.body.setAttribute(LOCK_ATTR, document.body.style.overflow || "");
//     document.body.style.overflow = "hidden";
//   }
//   document.body.classList.add("ks-modal-open");
// }
// function unlockBody() {
//   if (document.body.hasAttribute(LOCK_ATTR)) {
//     document.body.style.overflow = document.body.getAttribute(LOCK_ATTR) || "";
//     document.body.removeAttribute(LOCK_ATTR);
//   }
//   document.body.classList.remove("ks-modal-open");
// }

// /* ================== Component ================== */
// export default function CustomerDialog({
//   mode = "edit",
//   initial,
//   onClose,
//   onSaved,
// }: {
//   mode?: "create" | "edit";
//   initial: Customer | null;
//   onClose: () => void;
//   onSaved: () => void;
// }) {
//   const blank: Customer = {
//     _id: "",
//     newsletter: false,
//     notes: "",
//     child: {
//       firstName: "",
//       lastName: "",
//       gender: "",
//       birthDate: null,
//       club: "",
//     },
//     parent: {
//       salutation: "",
//       firstName: "",
//       lastName: "",
//       email: "",
//       phone: "",
//       phone2: "",
//     },
//     address: { street: "", houseNo: "", zip: "", city: "" },
//     bookings: [],
//   };

//   const [form, setForm] = useState<Customer>(initial || blank);
//   const [saving, setSaving] = useState(false);

//   // Offers zum Buchen
//   const [offers, setOffers] = useState<Offer[]>([]);
//   const [offersLoadErr, setOffersLoadErr] = useState<string | null>(null);
//   const [offersLoading, setOffersLoading] = useState(false);

//   // Buchen
//   const [selOffer, setSelOffer] = useState<string>("");
//   const [wishDate, setWishDate] = useState<string>("");

//   // Kündigen (pro Buchung Subdialog)
//   const [cancelFor, setCancelFor] = useState<Booking | null>(null);
//   const [cancelDate, setCancelDate] = useState<string>("");
//   const [cancelReason, setCancelReason] = useState<string>("");
//   const panelRef = useRef<HTMLDivElement | null>(null);

//   /* ---------- init ---------- */
//   useEffect(() => {
//     setForm(initial || blank);
//   }, [initial, mode]);

//   // Modal: Body lock + ESC + Overlay close
//   useEffect(() => {
//     function onEsc(e: KeyboardEvent) {
//       if (e.key === "Escape") onClose();
//     }
//     function onOverlay(e: MouseEvent) {
//       if (!panelRef.current) return;
//       if (!(e.target instanceof Element)) return;
//       const clickedInside = panelRef.current.contains(e.target);
//       if (!clickedInside) onClose();
//     }
//     lockBody();
//     document.addEventListener("keydown", onEsc);
//     document.addEventListener("click", onOverlay);
//     return () => {
//       document.removeEventListener("keydown", onEsc);
//       document.removeEventListener("click", onOverlay);
//       unlockBody();
//     };
//   }, [onClose]);

//   // Offers laden (einfach alle aktiven – Backend filtert je Provider)
//   useEffect(() => {
//     (async () => {
//       setOffersLoading(true);
//       setOffersLoadErr(null);
//       try {
//         const r = await fetch("/api/offers?limit=200", { cache: "no-store" });
//         if (!r.ok) throw new Error(`HTTP ${r.status}`);
//         const data = await r.json();
//         setOffers(
//           Array.isArray(data.items)
//             ? data.items
//             : Array.isArray(data)
//             ? data
//             : []
//         );
//       } catch (e: any) {
//         setOffersLoadErr(e?.message || "Load offers failed");
//       } finally {
//         setOffersLoading(false);
//       }
//     })();
//   }, []);

//   /* ---------- helpers ---------- */
//   function up(path: string, value: any) {
//     setForm((prev) => {
//       const c: any = structuredClone(prev);
//       const parts = path.split(".");
//       let ref = c;
//       for (let i = 0; i < parts.length - 1; i++) {
//         ref[parts[i]] = ref[parts[i]] ?? {};
//         ref = ref[parts[i]];
//       }
//       ref[parts[parts.length - 1]] = value;
//       return c;
//     });
//   }

//   /* ---------- save / create ---------- */
//   async function saveCreate() {
//     setSaving(true);
//     try {
//       const r = await fetch("/api/admin/customers", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(form),
//       });
//       if (!r.ok) throw new Error(`Create failed (${r.status})`);
//       onSaved();
//     } catch (e) {
//       /* soft */
//     } finally {
//       setSaving(false);
//     }
//   }
//   async function saveUpdate() {
//     if (!form._id) return;
//     setSaving(true);
//     try {
//       const r = await fetch(
//         `/api/admin/customers/${encodeURIComponent(form._id)}`,
//         {
//           method: "PUT",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(form),
//         }
//       );
//       if (!r.ok) throw new Error(`Save failed (${r.status})`);
//       onSaved();
//     } catch (e) {
//       /* soft */
//     } finally {
//       setSaving(false);
//     }
//   }

//   /* ---------- booking: create ---------- */
//   async function addBooking() {
//     if (!form._id || !selOffer) return;
//     setSaving(true);
//     try {
//       const r = await fetch(
//         `/api/admin/customers/${encodeURIComponent(form._id)}/bookings`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             offerId: selOffer,
//             startDate: wishDate || null,
//           }),
//         }
//       );
//       if (!r.ok) throw new Error(`Booking failed (${r.status})`);
//       // frisch laden
//       await reloadCustomer();
//       setSelOffer("");
//       setWishDate("");
//     } catch (e) {
//       /* soft */
//     } finally {
//       setSaving(false);
//     }
//   }

//   /* ---------- booking: cancel (mit Datum/Grund) ---------- */
//   async function cancelBooking() {
//     if (!form._id || !cancelFor?._id) return;
//     setSaving(true);
//     try {
//       const r = await fetch(
//         `/api/admin/customers/${encodeURIComponent(
//           form._id
//         )}/bookings/${encodeURIComponent(cancelFor._id)}/cancel`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             date: cancelDate || null,
//             reason: cancelReason || "",
//           }),
//         }
//       );
//       if (!r.ok) throw new Error(`Cancel failed (${r.status})`);
//       setCancelFor(null);
//       setCancelDate("");
//       setCancelReason("");
//       await reloadCustomer();
//     } catch (e) {
//       /* soft */
//     } finally {
//       setSaving(false);
//     }
//   }

//   async function reloadCustomer() {
//     if (!form._id) return;
//     const r = await fetch(
//       `/api/admin/customers/${encodeURIComponent(form._id)}`,
//       { cache: "no-store" }
//     );
//     if (r.ok) {
//       const full = await r.json();
//       setForm(full);
//     }
//   }

//   const offersOptions = useMemo(() => {
//     return offers.map((o) => ({
//       id: o._id,
//       label:
//         o.title || [o.type, o.location].filter(Boolean).join(" • ") || o._id,
//     }));
//   }, [offers]);

//   const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

//   return (
//     <div
//       className="ks-modal"
//       aria-modal="true"
//       role="dialog"
//       aria-label="Customer"
//     >
//       <div className="ks-overlay" />
//       <div className="ks-panel" ref={panelRef}>
//         <button className="ks-close" aria-label="Schließen" onClick={onClose}>
//           ✕
//         </button>
//         <h2 className="ks-title">
//           {mode === "create"
//             ? "Neuen Kunden anlegen"
//             : `Kunde #${form.userId ?? "—"} bearbeiten`}
//         </h2>

//         {/* ===== Stammdaten ===== */}
//         <section className="ks-section">
//           <h3 className="ks-h3">Stammdaten</h3>

//           {/* Kind */}
//           <fieldset className="ks-fs">
//             <legend>Kind</legend>
//             <div className="ks-grid">
//               <div className="ks-field">
//                 <label>Vorname</label>
//                 <input
//                   value={form.child?.firstName || ""}
//                   onChange={(e) => up("child.firstName", e.target.value)}
//                 />
//               </div>
//               <div className="ks-field">
//                 <label>Nachname</label>
//                 <input
//                   value={form.child?.lastName || ""}
//                   onChange={(e) => up("child.lastName", e.target.value)}
//                 />
//               </div>
//               <div className="ks-field">
//                 <label>Geschlecht</label>
//                 <select
//                   value={form.child?.gender || ""}
//                   onChange={(e) => up("child.gender", e.target.value)}
//                 >
//                   <option value="">—</option>
//                   <option value="weiblich">weiblich</option>
//                   <option value="männlich">männlich</option>
//                 </select>
//               </div>
//               <div className="ks-field">
//                 <label>Geburtsdatum</label>
//                 <input
//                   type="date"
//                   value={(form.child?.birthDate || "").slice(0, 10)}
//                   onChange={(e) => up("child.birthDate", e.target.value)}
//                 />
//               </div>
//               <div className="ks-field">
//                 <label>Aktueller Verein</label>
//                 <input
//                   value={form.child?.club || ""}
//                   onChange={(e) => up("child.club", e.target.value)}
//                 />
//               </div>
//             </div>
//           </fieldset>

//           {/* Eltern */}
//           <fieldset className="ks-fs">
//             <legend>Eltern</legend>
//             <div className="ks-grid">
//               <div className="ks-field">
//                 <label>Anrede</label>
//                 <select
//                   value={form.parent?.salutation || ""}
//                   onChange={(e) => up("parent.salutation", e.target.value)}
//                 >
//                   <option value="">—</option>
//                   <option value="Frau">Frau</option>
//                   <option value="Herr">Herr</option>
//                 </select>
//               </div>
//               <div className="ks-field">
//                 <label>Vorname</label>
//                 <input
//                   value={form.parent?.firstName || ""}
//                   onChange={(e) => up("parent.firstName", e.target.value)}
//                 />
//               </div>
//               <div className="ks-field">
//                 <label>Nachname</label>
//                 <input
//                   value={form.parent?.lastName || ""}
//                   onChange={(e) => up("parent.lastName", e.target.value)}
//                 />
//               </div>
//               <div className="ks-field">
//                 <label>E-Mail</label>
//                 <input
//                   type="email"
//                   value={form.parent?.email || ""}
//                   onChange={(e) => up("parent.email", e.target.value)}
//                 />
//               </div>
//               <div className="ks-field">
//                 <label>Telefon</label>
//                 <input
//                   value={form.parent?.phone || ""}
//                   onChange={(e) => up("parent.phone", e.target.value)}
//                 />
//               </div>
//               <div className="ks-field">
//                 <label>Telefon 2</label>
//                 <input
//                   value={form.parent?.phone2 || ""}
//                   onChange={(e) => up("parent.phone2", e.target.value)}
//                 />
//               </div>
//               <label className="ks-check">
//                 <input
//                   type="checkbox"
//                   checked={!!form.newsletter}
//                   onChange={(e) => up("newsletter", e.target.checked)}
//                 />
//                 <span>Newsletter</span>
//               </label>
//             </div>
//           </fieldset>

//           {/* Adresse */}
//           <fieldset className="ks-fs">
//             <legend>Adresse</legend>
//             <div className="ks-grid">
//               <div className="ks-field">
//                 <label>Straße</label>
//                 <input
//                   value={form.address?.street || ""}
//                   onChange={(e) => up("address.street", e.target.value)}
//                 />
//               </div>
//               <div className="ks-field">
//                 <label>Nr.</label>
//                 <input
//                   value={form.address?.houseNo || ""}
//                   onChange={(e) => up("address.houseNo", e.target.value)}
//                 />
//               </div>
//               <div className="ks-field">
//                 <label>PLZ</label>
//                 <input
//                   value={form.address?.zip || ""}
//                   onChange={(e) => up("address.zip", e.target.value)}
//                 />
//               </div>
//               <div className="ks-field">
//                 <label>Ort</label>
//                 <input
//                   value={form.address?.city || ""}
//                   onChange={(e) => up("address.city", e.target.value)}
//                 />
//               </div>
//             </div>
//           </fieldset>

//           <div className="ks-field">
//             <label>Notizen</label>
//             <textarea
//               rows={4}
//               value={form.notes || ""}
//               onChange={(e) => up("notes", e.target.value)}
//             />
//           </div>

//           <div className="ks-actions">
//             {mode === "create" ? (
//               <button className="btn" onClick={saveCreate} disabled={saving}>
//                 Erstellen
//               </button>
//             ) : (
//               <button className="btn" onClick={saveUpdate} disabled={saving}>
//                 Änderung speichern
//               </button>
//             )}
//           </div>
//         </section>

//         {/* ===== Buchungen ===== */}
//         {mode === "edit" && (
//           <section className="ks-section">
//             <h3 className="ks-h3">Buchungen</h3>

//             {/* Bestehende Buchungen */}
//             <div className="ks-table">
//               <div className="ks-thead">
//                 <div>Kurs</div>
//                 <div>Status</div>
//                 <div>Start</div>
//                 <div>Aktionen</div>
//               </div>
//               {(form.bookings || []).map((b) => (
//                 <div className="ks-row" key={b._id}>
//                   <div>{b.offerTitle || b.offerId}</div>
//                   <div>{b.status || "active"}</div>
//                   <div>{(b.startDate || "").slice(0, 10) || "—"}</div>
//                   <div className="ks-row__actions">
//                     <button
//                       className="btn"
//                       onClick={() => {
//                         setCancelFor(b);
//                         setCancelDate(today);
//                         setCancelReason("");
//                       }}
//                     >
//                       Kündigen
//                     </button>
//                   </div>
//                 </div>
//               ))}
//               {!form.bookings?.length && (
//                 <div className="ks-row">
//                   <div className="muted">Keine Buchungen</div>
//                 </div>
//               )}
//             </div>

//             {/* Buchen */}
//             <div className="ks-fs ks-fs--mt">
//               <legend>Kurs für diesen Kunden buchen</legend>
//               {offersLoading && <p className="muted">Lade Angebote…</p>}
//               {offersLoadErr && <p className="error">{offersLoadErr}</p>}
//               <div className="ks-grid">
//                 <div className="ks-field">
//                   <label>Kurs</label>
//                   <select
//                     value={selOffer}
//                     onChange={(e) => setSelOffer(e.target.value)}
//                   >
//                     <option value="">Bitte wählen…</option>
//                     {offersOptions.map((o) => (
//                       <option key={o.id} value={o.id}>
//                         {o.label}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 <div className="ks-field">
//                   <label>Start (optional)</label>
//                   <input
//                     type="date"
//                     value={wishDate}
//                     onChange={(e) => setWishDate(e.target.value)}
//                   />
//                 </div>
//                 <div className="ks-field ks-field--btn">
//                   <button
//                     className="btn"
//                     onClick={addBooking}
//                     disabled={!selOffer || saving}
//                   >
//                     Buchen
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </section>
//         )}

//         {/* ===== Buchung kündigen: Subdialog ===== */}
//         {cancelFor && (
//           <div className="ks-sub">
//             <div className="ks-sub__panel" role="dialog" aria-label="Kündigen">
//               <h4 className="ks-h4">Buchung kündigen</h4>
//               <div className="ks-grid">
//                 <div className="ks-field">
//                   <label>Wirksam zum</label>
//                   <input
//                     type="date"
//                     value={cancelDate}
//                     onChange={(e) => setCancelDate(e.target.value)}
//                   />
//                 </div>
//                 <div className="ks-field">
//                   <label>Grund (optional)</label>
//                   <textarea
//                     rows={3}
//                     value={cancelReason}
//                     onChange={(e) => setCancelReason(e.target.value)}
//                   />
//                 </div>
//               </div>
//               <div className="ks-actions">
//                 <button className="btn" onClick={() => setCancelFor(null)}>
//                   Abbrechen
//                 </button>
//                 <button
//                   className="btn btn-danger"
//                   onClick={cancelBooking}
//                   disabled={saving}
//                 >
//                   Kündigung bestätigen
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
