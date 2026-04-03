"use client";

import * as React from "react";

export type ProfileUser = {
  id?: string;
  fullName?: string;
  email?: string;
  avatarUrl?: string | null;
};

type Props = { user?: ProfileUser };

export default function ProfileButton({ user }: Props) {
  const [open, setOpen] = React.useState(false);
  const [editMode, setEditMode] = React.useState(false);

  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const closeBtnRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLElement>(null);

  const [id, setId] = React.useState<string | undefined>(user?.id);

  const [fullName, setFullName] = React.useState<string>(() => {
    if (typeof window !== "undefined") {
      const n = localStorage.getItem("ks_full_name");
      if (n) return n;
    }
    return user?.fullName || "";
  });

  const [email, setEmail] = React.useState<string>(user?.email || "");

  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("ks_avatar_url");
      if (cached) return cached;
    }
    return user?.avatarUrl ?? null;
  });

  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const avatarInputId = React.useId();
  const [avatarFileName, setAvatarFileName] =
    React.useState<string>("None selected");

  const [baseFullName, setBaseFullName] = React.useState<string>(() => {
    if (typeof window !== "undefined") {
      const n = localStorage.getItem("ks_full_name");
      if (n) return n;
    }
    return user?.fullName || "";
  });
  const [baseEmail, setBaseEmail] = React.useState<string>(user?.email || "");
  const [baseAvatarUrl, setBaseAvatarUrl] = React.useState<string | null>(
    user?.avatarUrl ?? null,
  );

  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [emailError, setEmailError] = React.useState<string | null>(null);
  const [okMsg, setOkMsg] = React.useState<string | null>(null);

  const [isOnline, setIsOnline] = React.useState(true);
  const lastActivityRef = React.useRef<number>(Date.now());

  React.useEffect(() => {
    const onActivity = () => {
      lastActivityRef.current = Date.now();
      if (!isOnline) setIsOnline(true);
    };

    const check = setInterval(() => {
      if (Date.now() - lastActivityRef.current > 10 * 60 * 1000) {
        setIsOnline(false);
      }
    }, 30 * 1000);

    window.addEventListener("mousemove", onActivity, { passive: true });
    window.addEventListener("keydown", onActivity);
    window.addEventListener("scroll", onActivity, { passive: true });
    window.addEventListener("touchstart", onActivity, { passive: true });

    return () => {
      clearInterval(check);
      window.removeEventListener("mousemove", onActivity);
      window.removeEventListener("keydown", onActivity);
      window.removeEventListener("scroll", onActivity);
      window.removeEventListener("touchstart", onActivity);
    };
  }, [isOnline]);

  const initials =
    (fullName || "Profile")
      .split(/\s+/)
      .map((s) => s[0] || "")
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && open) closeSheet();
    }

    function onMouseDown(e: MouseEvent) {
      if (!open) return;
      const panel = panelRef.current;
      const trigger = triggerRef.current;
      if (!panel || !(e.target instanceof Node)) return;
      if (trigger && trigger.contains(e.target)) return;
      if (!panel.contains(e.target)) closeSheet();
    }

    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onMouseDown);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, [open]);

  React.useEffect(() => {
    if (open) closeBtnRef.current?.focus();
  }, [open]);

  const editModeRef = React.useRef(false);

  React.useEffect(() => {
    editModeRef.current = editMode;
  }, [editMode]);

  const fetchSeq = React.useRef(0);

  async function fetchProfile() {
    const seq = ++fetchSeq.current;
    setError(null);
    setEmailError(null);
    setLoading(true);

    try {
      const r = await fetch("/api/admin/auth/profile", {
        credentials: "include",
        cache: "no-store",
      });

      if (r.status === 401) {
        setError("Please log in again.");
        setTimeout(
          () => window.location.replace("/admin/login?next=/admin/bookings"),
          400,
        );
        return;
      }

      const data = await r.json().catch(() => ({}));
      if (!r.ok || data?.ok === false) {
        throw new Error(data?.error || "Profile could not be loaded");
      }
      if (seq !== fetchSeq.current) return;

      const u: ProfileUser = data.user || {};

      if (!editModeRef.current) {
        setId(u.id);
        setFullName(u.fullName || "");
        setEmail(u.email || "");

        const nextAvatar = u.avatarUrl ?? null;
        setAvatarUrl(nextAvatar);
        setAvatarFile(null);
        setAvatarFileName("None selected");

        setBaseFullName(u.fullName || "");
        setBaseEmail(u.email || "");
        setBaseAvatarUrl(nextAvatar);

        if (typeof window !== "undefined") {
          if (nextAvatar) localStorage.setItem("ks_avatar_url", nextAvatar);
          else localStorage.removeItem("ks_avatar_url");

          if (u.fullName) localStorage.setItem("ks_full_name", u.fullName);
          else localStorage.removeItem("ks_full_name");
        }
      }
    } catch (e: any) {
      if (seq !== fetchSeq.current) return;
      setError(e?.message || "Profile could not be loaded");
    } finally {
      if (seq === fetchSeq.current) setLoading(false);
    }
  }

  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("profile-open", open);
    return () => root.classList.remove("profile-open");
  }, [open]);

  function openSheet() {
    setOkMsg(null);
    setError(null);
    setEmailError(null);
    setEditMode(false);
    setOpen(true);
    fetchProfile();
  }

  function enterEditMode() {
    setOkMsg(null);
    setError(null);
    setEmailError(null);
    fetchSeq.current++;
    setBaseFullName(fullName);
    setBaseEmail(email);
    setBaseAvatarUrl(avatarUrl ?? null);
    setEditMode(true);
  }

  function closeSheet() {
    triggerRef.current?.focus();
    setOpen(false);
  }

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setAvatarFileName(f?.name || "None selected");

    if (f && !editMode) {
      enterEditMode();
    }

    setAvatarFile(f);
    setOkMsg(null);
    setError(null);

    if (f && f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(f);
    }
  }

  function changedName() {
    return fullName.trim() !== (baseFullName ?? "");
  }

  function changedEmail() {
    return (
      email.trim().toLowerCase() !== (baseEmail ?? "").trim().toLowerCase()
    );
  }

  function changedAvatar() {
    return !!avatarFile || (avatarUrl ?? null) !== (baseAvatarUrl ?? null);
  }

  function hasChanges() {
    return changedName() || changedEmail() || changedAvatar();
  }

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSave = !saving && !!fullName.trim() && emailOk && hasChanges();

  function buildUpdateMessage(opts: {
    avatarChanged: boolean;
    nameChanged: boolean;
    emailChanged: boolean;
  }) {
    const parts: string[] = [];
    if (opts.avatarChanged) parts.push("Image");
    if (opts.nameChanged) parts.push("Name");
    if (opts.emailChanged) parts.push("Email");

    if (parts.length === 0) return "No changes.";
    if (parts.length === 1) return `${parts[0]} updated.`;
    if (parts.length === 2) return `${parts[0]} and ${parts[1]} updated.`;
    return `${parts.slice(0, -1).join(", ")} and ${
      parts[parts.length - 1]
    } updated.`;
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setEmailError(null);

    const nameChanged = fullName.trim() !== (baseFullName ?? "");
    const emailChanged =
      email.trim().toLowerCase() !== (baseEmail ?? "").trim().toLowerCase();
    const avatarChanged =
      !!avatarFile || (avatarUrl ?? null) !== (baseAvatarUrl ?? null);

    if (!(nameChanged || emailChanged || avatarChanged)) {
      setOkMsg("No changes.");
      setEditMode(false);
      return;
    }

    setSaving(true);
    setError(null);
    setOkMsg(null);

    try {
      let avatarBase64: string | undefined;

      if (
        avatarFile &&
        typeof avatarUrl === "string" &&
        avatarUrl.startsWith("data:")
      ) {
        avatarBase64 = avatarUrl;
      }

      const res = await fetch("/api/admin/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({
          id,
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          avatar: avatarBase64,
        }),
      });

      if (res.status === 401) {
        setError("Session expired. Please log in again.");
        setTimeout(
          () => window.location.replace("/admin/login?next=/admin/bookings"),
          400,
        );
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (res.status === 409 && data?.error === "Email already in use") {
        setEmailError("Email is already in use.");
        throw new Error("Email already in use");
      }

      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || "Save failed");
      }

      const u: ProfileUser = data.user || {};
      setId(u.id);
      setFullName(u.fullName || "");
      setEmail(u.email || "");

      const nextAvatar = u.avatarUrl ?? null;
      setAvatarUrl(nextAvatar);
      setAvatarFile(null);
      setAvatarFileName("None selected");

      setBaseFullName(u.fullName || "");
      setBaseEmail(u.email || "");
      setBaseAvatarUrl(nextAvatar);

      if (typeof window !== "undefined") {
        if (nextAvatar) localStorage.setItem("ks_avatar_url", nextAvatar);
        else localStorage.removeItem("ks_avatar_url");

        if (u.fullName) localStorage.setItem("ks_full_name", u.fullName);
        else localStorage.removeItem("ks_full_name");
      }

      setOkMsg(
        buildUpdateMessage({ avatarChanged, nameChanged, emailChanged }),
      );
      setEditMode(false);
      fetchProfile();
    } catch (err: any) {
      if (!emailError) setError(err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("ks_avatar_url");
        localStorage.removeItem("ks_full_name");
        localStorage.removeItem("ks_user_id");
        localStorage.removeItem("providerId");
      }

      await fetch("/api/admin/auth/logout", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });
    } finally {
      window.location.replace("/admin/login?next=/admin/bookings");
    }
  }

  const AVATAR_FALLBACK = "/assets/img/avatar.png";
  const resolvedAvatar = avatarUrl || AVATAR_FALLBACK;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="profile-trigger profile-trigger--sm"
        onClick={() => (open ? closeSheet() : openSheet())}
        title="Open profile"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="profile-sheet"
      >
        <span className="profile-avatar profile-avatar--sm">
          <img
            src={resolvedAvatar}
            alt={fullName || "Profile"}
            width={28}
            height={28}
          />
          <span
            className={`profile-status-dot ${
              isOnline ? "is-online" : "is-offline"
            }`}
          />
        </span>
        <span className="profile-name profile-name--sm">
          {fullName || "Profile"}
        </span>
      </button>

      <div
        className={`profile-overlay ${open ? "is-open" : ""}`}
        inert={!open}
      />

      <aside
        ref={panelRef}
        id="profile-sheet"
        className={`profile-sheet ${open ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Profile"
        inert={!open}
      >
        <div className="profile-sheet__header">
          <h3 className="profile-sheet__title">Profile</h3>

          <button
            ref={closeBtnRef}
            type="button"
            className="dialog-close profile-sheet__close"
            onClick={closeSheet}
            aria-label="Close"
          >
            <img
              src="/icons/close.svg"
              alt=""
              aria-hidden="true"
              className="icon-img"
            />
          </button>
        </div>

        <div className="profile-sheet__body">
          <div className="profile-card profile-card--sm">
            <div className="profile-card__avatar">
              <img
                src={resolvedAvatar}
                alt={fullName || "Profile"}
                width={64}
                height={64}
              />
              <span
                className={`profile-status-dot ${
                  isOnline ? "is-online" : "is-offline"
                }`}
              />
            </div>

            <div className="profile-card__meta">
              <div className="profile-card__name-row">
                <div
                  className="profile-card__name"
                  title={fullName || "Profile"}
                >
                  {fullName || "Profile"}
                </div>
                <span
                  className={`profile-badge ${
                    isOnline ? "is-online" : "is-offline"
                  }`}
                >
                  {isOnline ? "Active" : "Offline"}
                </span>
              </div>

              {email && (
                <div className="profile-card__email" title={email}>
                  {email}
                </div>
              )}
            </div>
          </div>

          <form
            onSubmit={handleSave}
            className="form mt-3 form--narrow"
            aria-label="Edit profile"
          >
            <div className="form-columns form-columns--single">
              <div className="card card--sm">
                <label className="lbl lbl--sm" htmlFor="pf-fullname">
                  Name
                </label>
                <input
                  id="pf-fullname"
                  className={`input input--sm ${
                    !editMode ? "input--readonly" : ""
                  }`}
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full name"
                  autoComplete="name"
                  readOnly={!editMode}
                  aria-readonly={!editMode}
                />
              </div>

              <div className="card card--sm">
                <label className="lbl lbl--sm" htmlFor="pf-email">
                  Email
                </label>
                <input
                  id="pf-email"
                  className={`input input--sm ${
                    !editMode ? "input--readonly" : ""
                  } ${emailError ? "input--error" : ""}`}
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError(null);
                  }}
                  placeholder="Email address"
                  autoComplete="email"
                  readOnly={!editMode}
                  aria-readonly={!editMode}
                />
                {!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
                  editMode && (
                    <p className="help error">Please enter a valid email.</p>
                  )}
                {emailError && <p className="help error">{emailError}</p>}
              </div>

              <div className="card card--sm">
                <label className="lbl lbl--sm">Profile image</label>

                <div className="upload-row">
                  <input
                    id={avatarInputId}
                    type="file"
                    accept="image/*"
                    onChange={onPickFile}
                    className="sr-only"
                  />
                  <label htmlFor={avatarInputId} className="btn btn--sm">
                    Choose file
                  </label>

                  <span className="upload-filename" title={avatarFileName}>
                    {avatarFileName}
                  </span>
                </div>

                <p className="help">
                  PNG/JPG, ideal 256×256. The preview updates immediately.
                </p>
              </div>

              <div className="profile-actions profile-actions--full">
                {!editMode ? (
                  <>
                    <button
                      type="button"
                      className="btn-ghost btn--sm"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                    <button
                      type="button"
                      className="btn"
                      onClick={enterEditMode}
                      disabled={loading}
                    >
                      Edit
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="btn-ghost btn--sm"
                      onClick={() => {
                        setEditMode(false);
                        fetchProfile();
                      }}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn" disabled={!canSave}>
                      {saving ? "Saving..." : "Save"}
                    </button>
                  </>
                )}
              </div>
            </div>

            {loading && (
              <div className="text-gray-600 mt-3">Loading profile...</div>
            )}
            {error && <div className="text-red-600 mt-3">{error}</div>}
            {okMsg && <div className="ok mt-3">{okMsg}</div>}
          </form>
        </div>
      </aside>
    </>
  );
}

// //src\app\components\ProfileButton.tsx
// "use client";

// import * as React from "react";

// export type ProfileUser = {
//   id?: string;
//   fullName?: string;
//   email?: string;
//   avatarUrl?: string | null;
// };

// type Props = { user?: ProfileUser };

// export default function ProfileButton({ user }: Props) {
//   const [open, setOpen] = React.useState(false);
//   const [editMode, setEditMode] = React.useState(false);

//   const triggerRef = React.useRef<HTMLButtonElement>(null);
//   const closeBtnRef = React.useRef<HTMLButtonElement>(null);
//   const panelRef = React.useRef<HTMLElement>(null);

//   const [id, setId] = React.useState<string | undefined>(user?.id);

//   const [fullName, setFullName] = React.useState<string>(() => {
//     if (typeof window !== "undefined") {
//       const n = localStorage.getItem("ks_full_name");
//       if (n) return n;
//     }
//     return user?.fullName || "";
//   });

//   const [email, setEmail] = React.useState<string>(user?.email || "");

//   // Avatar: zuerst aus localStorage, dann aus props; verhindert Placeholder-Flash
//   const [avatarUrl, setAvatarUrl] = React.useState<string | null>(() => {
//     if (typeof window !== "undefined") {
//       const cached = localStorage.getItem("ks_avatar_url");
//       if (cached) return cached;
//     }
//     return user?.avatarUrl ?? null;
//   });

//   const [avatarFile, setAvatarFile] = React.useState<File | null>(null);

//   // ✅ Filepicker UI State (nur Anzeige)
//   const avatarInputId = React.useId();
//   const [avatarFileName, setAvatarFileName] =
//     React.useState<string>("Keine ausgewählt");

//   const [baseFullName, setBaseFullName] = React.useState<string>(() => {
//     if (typeof window !== "undefined") {
//       const n = localStorage.getItem("ks_full_name");
//       if (n) return n;
//     }
//     return user?.fullName || "";
//   });
//   const [baseEmail, setBaseEmail] = React.useState<string>(user?.email || "");
//   const [baseAvatarUrl, setBaseAvatarUrl] = React.useState<string | null>(
//     user?.avatarUrl ?? null,
//   );

//   const [loading, setLoading] = React.useState(false);
//   const [saving, setSaving] = React.useState(false);
//   const [error, setError] = React.useState<string | null>(null);
//   const [emailError, setEmailError] = React.useState<string | null>(null);
//   const [okMsg, setOkMsg] = React.useState<string | null>(null);

//   // Online/Offline nach 10 Min. Inaktivität
//   const [isOnline, setIsOnline] = React.useState(true);
//   const lastActivityRef = React.useRef<number>(Date.now());
//   React.useEffect(() => {
//     const onActivity = () => {
//       lastActivityRef.current = Date.now();
//       if (!isOnline) setIsOnline(true);
//     };
//     const check = setInterval(() => {
//       if (Date.now() - lastActivityRef.current > 10 * 60 * 1000)
//         setIsOnline(false);
//     }, 30 * 1000);

//     window.addEventListener("mousemove", onActivity, { passive: true });
//     window.addEventListener("keydown", onActivity);
//     window.addEventListener("scroll", onActivity, { passive: true });
//     window.addEventListener("touchstart", onActivity, { passive: true });
//     return () => {
//       clearInterval(check);
//       window.removeEventListener("mousemove", onActivity);
//       window.removeEventListener("keydown", onActivity);
//       window.removeEventListener("scroll", onActivity);
//       window.removeEventListener("touchstart", onActivity);
//     };
//   }, [isOnline]);

//   const initials =
//     (fullName || "Profil")
//       .split(/\s+/)
//       .map((s) => s[0] || "")
//       .join("")
//       .slice(0, 2)
//       .toUpperCase() || "U";

//   React.useEffect(() => {
//     function onKey(e: KeyboardEvent) {
//       if (e.key === "Escape" && open) closeSheet();
//     }
//     function onMouseDown(e: MouseEvent) {
//       if (!open) return;
//       const panel = panelRef.current;
//       const trigger = triggerRef.current;
//       if (!panel || !(e.target instanceof Node)) return;

//       // Klicks auf den Trigger NICHT als "outside" behandeln
//       if (trigger && trigger.contains(e.target)) return;

//       if (!panel.contains(e.target)) closeSheet();
//     }
//     document.addEventListener("keydown", onKey);
//     document.addEventListener("mousedown", onMouseDown);
//     return () => {
//       document.removeEventListener("keydown", onKey);
//       document.removeEventListener("mousedown", onMouseDown);
//     };
//   }, [open]);

//   React.useEffect(() => {
//     if (open) closeBtnRef.current?.focus();
//   }, [open]);

//   const editModeRef = React.useRef(false);
//   React.useEffect(() => {
//     editModeRef.current = editMode;
//   }, [editMode]);

//   const fetchSeq = React.useRef(0);

//   async function fetchProfile() {
//     const seq = ++fetchSeq.current;
//     setError(null);
//     setEmailError(null);
//     setLoading(true);
//     try {
//       const r = await fetch("/api/admin/auth/profile", {
//         credentials: "include",
//         cache: "no-store",
//       });
//       if (r.status === 401) {
//         setError("Bitte erneut einloggen.");
//         setTimeout(
//           () => window.location.replace("/admin/login?next=/admin/bookings"),
//           400,
//         );
//         return;
//       }
//       const data = await r.json().catch(() => ({}));
//       if (!r.ok || data?.ok === false)
//         throw new Error(data?.error || "Profil konnte nicht geladen werden");
//       if (seq !== fetchSeq.current) return;

//       const u: ProfileUser = data.user || {};
//       if (!editModeRef.current) {
//         setId(u.id);
//         setFullName(u.fullName || "");
//         setEmail(u.email || "");

//         const nextAvatar = u.avatarUrl ?? null;
//         setAvatarUrl(nextAvatar);
//         setAvatarFile(null);

//         // ✅ Reset nur Anzeige
//         setAvatarFileName("Keine ausgewählt");

//         setBaseFullName(u.fullName || "");
//         setBaseEmail(u.email || "");
//         setBaseAvatarUrl(nextAvatar);

//         if (typeof window !== "undefined") {
//           if (nextAvatar) localStorage.setItem("ks_avatar_url", nextAvatar);
//           else localStorage.removeItem("ks_avatar_url");

//           if (u.fullName) localStorage.setItem("ks_full_name", u.fullName);
//           else localStorage.removeItem("ks_full_name");
//         }
//       }
//     } catch (e: any) {
//       if (seq !== fetchSeq.current) return;
//       setError(e?.message || "Profil konnte nicht geladen werden");
//     } finally {
//       if (seq === fetchSeq.current) setLoading(false);
//     }
//   }

//   // Body/Seite sperren, wenn Profil offen ist
//   React.useEffect(() => {
//     const root = document.documentElement; // <html>
//     root.classList.toggle("profile-open", open);
//     return () => root.classList.remove("profile-open");
//   }, [open]);

//   function openSheet() {
//     setOkMsg(null);
//     setError(null);
//     setEmailError(null);
//     setEditMode(false);
//     setOpen(true);
//     fetchProfile();
//   }

//   function enterEditMode() {
//     setOkMsg(null);
//     setError(null);
//     setEmailError(null);
//     fetchSeq.current++;
//     setBaseFullName(fullName);
//     setBaseEmail(email);
//     setBaseAvatarUrl(avatarUrl ?? null);
//     setEditMode(true);
//   }

//   function closeSheet() {
//     triggerRef.current?.focus();
//     setOpen(false);
//   }

//   function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
//     const f = e.target.files?.[0] || null;

//     // ✅ nur Anzeige
//     setAvatarFileName(f?.name || "Keine ausgewählt");

//     // Nur bei echter Auswahl und wenn wir noch NICHT im Edit-Modus sind → Edit aktivieren
//     if (f && !editMode) {
//       enterEditMode(); // friert baseFullName/baseEmail/baseAvatarUrl ein
//     }

//     setAvatarFile(f);
//     setOkMsg(null);
//     setError(null);

//     if (f && f.type.startsWith("image/")) {
//       const reader = new FileReader();
//       reader.onload = () => {
//         if (typeof reader.result === "string") {
//           setAvatarUrl(reader.result); // Vorschau; hasChanges() wird dadurch true → "Speichern" aktiv
//         }
//       };
//       reader.readAsDataURL(f);
//     }
//   }

//   function changedName() {
//     return fullName.trim() !== (baseFullName ?? "");
//   }
//   function changedEmail() {
//     return (
//       email.trim().toLowerCase() !== (baseEmail ?? "").trim().toLowerCase()
//     );
//   }
//   function changedAvatar() {
//     return !!avatarFile || (avatarUrl ?? null) !== (baseAvatarUrl ?? null);
//   }
//   function hasChanges() {
//     return changedName() || changedEmail() || changedAvatar();
//   }

//   const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
//   const canSave = !saving && !!fullName.trim() && emailOk && hasChanges();

//   function buildUpdateMessage(opts: {
//     avatarChanged: boolean;
//     nameChanged: boolean;
//     emailChanged: boolean;
//   }) {
//     const parts: string[] = [];
//     if (opts.avatarChanged) parts.push("Bild");
//     if (opts.nameChanged) parts.push("Name");
//     if (opts.emailChanged) parts.push("E-Mail");

//     if (parts.length === 0) return "Keine Änderungen.";
//     if (parts.length === 1) return `${parts[0]} aktualisiert.`;
//     if (parts.length === 2) return `${parts[0]} und ${parts[1]} aktualisiert.`;
//     return `${parts.slice(0, -1).join(", ")} und ${
//       parts[parts.length - 1]
//     } aktualisiert.`;
//   }

//   async function handleSave(e: React.FormEvent) {
//     e.preventDefault();
//     setEmailError(null);

//     const nameChanged = fullName.trim() !== (baseFullName ?? "");
//     const emailChanged =
//       email.trim().toLowerCase() !== (baseEmail ?? "").trim().toLowerCase();
//     const avatarChanged =
//       !!avatarFile || (avatarUrl ?? null) !== (baseAvatarUrl ?? null);

//     if (!(nameChanged || emailChanged || avatarChanged)) {
//       setOkMsg("Keine Änderungen.");
//       setEditMode(false);
//       return;
//     }

//     setSaving(true);
//     setError(null);
//     setOkMsg(null);
//     try {
//       let avatarBase64: string | undefined;
//       if (
//         avatarFile &&
//         typeof avatarUrl === "string" &&
//         avatarUrl.startsWith("data:")
//       ) {
//         avatarBase64 = avatarUrl;
//       }

//       const res = await fetch("/api/admin/auth/profile", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         cache: "no-store",
//         body: JSON.stringify({
//           id,
//           fullName: fullName.trim(),
//           email: email.trim().toLowerCase(),
//           avatar: avatarBase64,
//         }),
//       });

//       if (res.status === 401) {
//         setError("Sitzung abgelaufen – bitte erneut einloggen.");
//         setTimeout(
//           () => window.location.replace("/admin/login?next=/admin/bookings"),
//           400,
//         );
//         return;
//       }

//       const data = await res.json().catch(() => ({}));
//       if (res.status === 409 && data?.error === "Email already in use") {
//         setEmailError("E-Mail ist bereits vergeben.");
//         throw new Error("E-Mail bereits vergeben");
//       }
//       if (!res.ok || data?.ok === false)
//         throw new Error(data?.error || "Speichern fehlgeschlagen");

//       const u: ProfileUser = data.user || {};
//       setId(u.id);
//       setFullName(u.fullName || "");
//       setEmail(u.email || "");

//       const nextAvatar = u.avatarUrl ?? null;
//       setAvatarUrl(nextAvatar);
//       setAvatarFile(null);
//       setAvatarFileName("Keine ausgewählt");

//       setBaseFullName(u.fullName || "");
//       setBaseEmail(u.email || "");
//       setBaseAvatarUrl(nextAvatar);

//       if (typeof window !== "undefined") {
//         if (nextAvatar) localStorage.setItem("ks_avatar_url", nextAvatar);
//         else localStorage.removeItem("ks_avatar_url");

//         if (u.fullName) localStorage.setItem("ks_full_name", u.fullName);
//         else localStorage.removeItem("ks_full_name");
//       }

//       setOkMsg(
//         buildUpdateMessage({ avatarChanged, nameChanged, emailChanged }),
//       );
//       setEditMode(false);
//       fetchProfile();
//     } catch (err: any) {
//       if (!emailError) setError(err?.message || "Speichern fehlgeschlagen");
//     } finally {
//       setSaving(false);
//     }
//   }

//   // async function handleLogout() {
//   //   try {
//   //     if (typeof window !== "undefined") {
//   //       localStorage.removeItem("ks_avatar_url");
//   //       localStorage.removeItem("ks_full_name");
//   //     }
//   //     await fetch("/api/admin/auth/logout", {
//   //       method: "POST",
//   //       credentials: "include",
//   //       cache: "no-store",
//   //     });
//   //   } finally {
//   //     window.location.replace("/admin/login?next=/admin/bookings");
//   //   }
//   // }

//   async function handleLogout() {
//     try {
//       if (typeof window !== "undefined") {
//         localStorage.removeItem("ks_avatar_url");
//         localStorage.removeItem("ks_full_name");
//         localStorage.removeItem("ks_user_id");
//         localStorage.removeItem("providerId");
//       }

//       await fetch("/api/admin/auth/logout", {
//         method: "POST",
//         credentials: "include",
//         cache: "no-store",
//       });
//     } finally {
//       window.location.replace("/admin/login?next=/admin/bookings");
//     }
//   }

//   const AVATAR_FALLBACK = "/assets/img/avatar.png";
//   const resolvedAvatar = avatarUrl || AVATAR_FALLBACK;

//   return (
//     <>
//       <button
//         ref={triggerRef}
//         type="button"
//         className="profile-trigger profile-trigger--sm"
//         onClick={() => (open ? closeSheet() : openSheet())}
//         title="Profil anzeigen"
//         aria-haspopup="dialog"
//         aria-expanded={open}
//         aria-controls="profile-sheet"
//       >
//         <span className="profile-avatar profile-avatar--sm">
//           {/* eslint-disable-next-line @next/next/no-img-element */}
//           <img
//             src={resolvedAvatar}
//             alt={fullName || "Profil"}
//             width={28}
//             height={28}
//           />
//           <span
//             className={`profile-status-dot ${
//               isOnline ? "is-online" : "is-offline"
//             }`}
//           />
//         </span>
//         <span className="profile-name profile-name--sm">
//           {fullName || "Profil"}
//         </span>
//       </button>

//       <div
//         className={`profile-overlay ${open ? "is-open" : ""}`}
//         inert={!open}
//       />

//       <aside
//         ref={panelRef}
//         id="profile-sheet"
//         className={`profile-sheet ${open ? "is-open" : ""}`}
//         role="dialog"
//         aria-modal="true"
//         aria-label="Profil"
//         inert={!open}
//       >
//         <div className="profile-sheet__header">
//           <h3 className="profile-sheet__title">Profil</h3>

//           <button
//             ref={closeBtnRef}
//             type="button"
//             //className="profile-sheet__close"
//             className="modal__close"
//             onClick={closeSheet}
//             aria-label="Schließen"
//           >
//             <img
//               src="/icons/close.svg"
//               alt=""
//               aria-hidden="true"
//               className="icon-img"
//             />
//           </button>
//         </div>

//         <div className="profile-sheet__body">
//           <div className="profile-card profile-card--sm">
//             <div className="profile-card__avatar">
//               {/* eslint-disable-next-line @next/next/no-img-element */}
//               <img
//                 src={resolvedAvatar}
//                 alt={fullName || "Profil"}
//                 width={64}
//                 height={64}
//               />
//               <span
//                 className={`profile-status-dot ${
//                   isOnline ? "is-online" : "is-offline"
//                 }`}
//               />
//             </div>
//             <div className="profile-card__meta">
//               <div className="profile-card__name-row">
//                 <div
//                   className="profile-card__name"
//                   title={fullName || "Profil"}
//                 >
//                   {fullName || "Profil"}
//                 </div>
//                 <span
//                   className={`profile-badge ${
//                     isOnline ? "is-online" : "is-offline"
//                   }`}
//                 >
//                   {isOnline ? "Aktiv" : "Offline"}
//                 </span>
//               </div>
//               {email && (
//                 <div className="profile-card__email" title={email}>
//                   {email}
//                 </div>
//               )}
//             </div>
//           </div>

//           <form
//             onSubmit={handleSave}
//             className="form mt-3 form--narrow"
//             aria-label="Profil bearbeiten"
//           >
//             <div className="form-columns form-columns--single">
//               <div className="card card--sm">
//                 <label className="lbl lbl--sm" htmlFor="pf-fullname">
//                   Name
//                 </label>
//                 <input
//                   id="pf-fullname"
//                   className={`input input--sm ${
//                     !editMode ? "input--readonly" : ""
//                   }`}
//                   type="text"
//                   value={fullName}
//                   onChange={(e) => setFullName(e.target.value)}
//                   placeholder="Vollständiger Name"
//                   autoComplete="name"
//                   readOnly={!editMode}
//                   aria-readonly={!editMode}
//                 />
//               </div>

//               <div className="card card--sm">
//                 <label className="lbl lbl--sm" htmlFor="pf-email">
//                   E-Mail
//                 </label>
//                 <input
//                   id="pf-email"
//                   className={`input input--sm ${
//                     !editMode ? "input--readonly" : ""
//                   } ${emailError ? "input--error" : ""}`}
//                   type="email"
//                   value={email}
//                   onChange={(e) => {
//                     setEmail(e.target.value);
//                     setEmailError(null);
//                   }}
//                   placeholder="E-Mail-Adresse"
//                   autoComplete="email"
//                   readOnly={!editMode}
//                   aria-readonly={!editMode}
//                 />
//                 {!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
//                   editMode && (
//                     <p className="help error">
//                       Bitte eine gültige E-Mail eingeben.
//                     </p>
//                   )}
//                 {emailError && <p className="help error">{emailError}</p>}
//               </div>

//               <div className="card card--sm">
//                 <label className="lbl lbl--sm">Profilbild</label>

//                 {/* ✅ Button-Style Filepicker */}
//                 <div className="upload-row">
//                   <input
//                     id={avatarInputId}
//                     type="file"
//                     accept="image/*"
//                     onChange={onPickFile}
//                     className="sr-only"
//                   />
//                   <label htmlFor={avatarInputId} className="btn btn--sm">
//                     Datei auswählen
//                   </label>

//                   <span className="upload-filename" title={avatarFileName}>
//                     {avatarFileName}
//                   </span>
//                 </div>

//                 <p className="help">
//                   PNG/JPG, ideal 256×256. Vorschau wird sofort angezeigt.
//                 </p>
//               </div>

//               <div className="profile-actions profile-actions--full">
//                 {!editMode ? (
//                   <>
//                     <button
//                       type="button"
//                       className="btn-ghost btn--sm"
//                       onClick={handleLogout}
//                     >
//                       Logout
//                     </button>
//                     <button
//                       type="button"
//                       className="btn"
//                       onClick={enterEditMode}
//                       disabled={loading}
//                     >
//                       Bearbeiten
//                     </button>
//                   </>
//                 ) : (
//                   <>
//                     <button
//                       type="button"
//                       className="btn-ghost btn--sm"
//                       onClick={() => {
//                         setEditMode(false);
//                         fetchProfile();
//                       }}
//                       disabled={saving}
//                     >
//                       Abbrechen
//                     </button>
//                     <button type="submit" className="btn" disabled={!canSave}>
//                       {saving ? "Speichern…" : "Speichern"}
//                     </button>
//                   </>
//                 )}
//               </div>
//             </div>

//             {loading && (
//               <div className="text-gray-600 mt-3">Profil wird geladen…</div>
//             )}
//             {error && <div className="text-red-600 mt-3">{error}</div>}
//             {okMsg && <div className="ok mt-3">{okMsg}</div>}
//           </form>
//         </div>
//       </aside>
//     </>
//   );
// }
