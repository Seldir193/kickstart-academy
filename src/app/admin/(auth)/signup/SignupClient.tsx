"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Form = {
  fullName: string;
  email: string;
  password: string;
  confirm: string;
  terms: boolean;
};

function isValidEmail(s: string) {
  return /^\S+@\S+\.\S+$/.test(s);
}

export default function SignupClient() {
  const router = useRouter();
  const params = useSearchParams();

  const [form, setForm] = useState<Form>({
    fullName: "",
    email: "",
    password: "",
    confirm: "",
    terms: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [formError, setFormError] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");

  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const backHref = useMemo(() => {
    const from = params.get("from");
    if (from) return from;
    return "/admin/login";
  }, [params]);

  useEffect(() => {
    const email = params.get("email") || "";
    if (email) setForm((f) => ({ ...f, email }));
  }, [params]);

  useEffect(() => {
    document.body.classList.add("is-admin-auth");
    return () => document.body.classList.remove("is-admin-auth");
  }, []);

  function validateAll(f: Form) {
    const e: Partial<Record<keyof Form, string>> = {};
    if (!f.fullName.trim()) e.fullName = "Please fill in this field";
    if (!isValidEmail(f.email)) e.email = "*Please fill out the email field";
    if (f.password.length < 6) e.password = "Min. 6 characters";
    if (f.confirm.length < 6) e.confirm = "Min. 6 characters";
    else if (f.password !== f.confirm) e.confirm = "Passwords do not match";
    if (!f.terms) e.terms = "Please accept the terms to continue";
    return e;
  }

  function setField<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      setErrors(validateAll(next));
      return next;
    });
  }

  function handleBlur<K extends keyof Form>(key: K) {
    const e = validateAll(form);
    setErrors((prev) => ({ ...prev, [key]: e[key] }));
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (status === "sending") return;

    setFormError("");
    const e = validateAll(form);
    setErrors(e);
    if (Object.keys(e).length) return;

    setStatus("sending");
    try {
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      };

      const r = await fetch("/api/admin/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
        cache: "no-store",
      });

      const d = await r.json().catch(() => ({}) as any);

      const success = r.ok && (d?.ok === true || d?.user || r.status === 201);
      if (!success) {
        if (d?.errors && typeof d.errors === "object") {
          setErrors((prev) => ({ ...prev, ...d.errors }));
          setFormError("Please fix the errors above.");
        } else {
          const msg =
            d?.error ||
            d?.message ||
            (typeof d?.raw === "string" ? d.raw.slice(0, 200) : "") ||
            `Registration failed (${r.status}). Please try again.`;
          setFormError(msg);
        }
        setStatus("idle");
        return;
      }

      setStatus("done");
      router.replace(`/admin/login?email=${encodeURIComponent(payload.email)}`);
    } catch {
      setFormError("Network error. Please try again.");
      setStatus("idle");
    }
  }

  const disabled = status === "sending";

  return (
    <section className="admin-auth" aria-busy={disabled}>
      <div className="auth-card">
        <div className="auth-head">
          <button
            type="button"
            className="auth-back"
            onClick={() => router.push(backHref)}
            aria-label="Back to login"
          >
            <img
              src="/icons/arrow_right_alt.svg"
              alt=""
              aria-hidden="true"
              className="auth-back__icon"
            />
          </button>

          <h1 className="auth-title">Provider Sign-up</h1>

          <span aria-hidden="true" />
        </div>

        <p className="auth-subtitle">
          Create your provider access. After registration you’ll be redirected
          to the login page.
        </p>

        {formError && (
          <div className="form-error" role="alert" aria-live="polite">
            {formError}
          </div>
        )}

        <form className="auth-form" onSubmit={onSubmit} noValidate>
          <fieldset disabled={disabled} className="auth-fieldset">
            <div className="auth-field">
              <label htmlFor="fullName" className="auth-label">
                Name
              </label>

              <div className="auth-control">
                <span className="auth-icon" aria-hidden="true">
                  <img src="/icons/user.svg" alt="" />
                </span>

                <input
                  id="fullName"
                  name="fullName"
                  className="input auth-input"
                  value={form.fullName}
                  onChange={(e) => setField("fullName", e.target.value)}
                  onBlur={() => handleBlur("fullName")}
                  autoComplete="name"
                  placeholder="Name and surname"
                  required
                  aria-invalid={Boolean(errors.fullName)}
                />
              </div>

              <span className="error-slot" aria-live="polite">
                {errors.fullName ? (
                  <span className="error">{errors.fullName}</span>
                ) : null}
              </span>
            </div>

            <div className="auth-field">
              <label htmlFor="email" className="auth-label">
                E-Mail
              </label>

              <div className="auth-control">
                <span className="auth-icon" aria-hidden="true">
                  <img src="/icons/mail.svg" alt="" />
                </span>

                <input
                  id="email"
                  name="email"
                  type="email"
                  className="input auth-input"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  autoComplete="email"
                  placeholder="admin@example.com"
                  required
                  aria-invalid={Boolean(errors.email)}
                />
              </div>

              <span className="error-slot" aria-live="polite">
                {errors.email ? (
                  <span className="error">{errors.email}</span>
                ) : null}
              </span>
            </div>

            <div className="auth-field">
              <label htmlFor="password" className="auth-label">
                Password
              </label>

              <div className="auth-control">
                <span className="auth-icon" aria-hidden="true">
                  <img src="/icons/lock.svg" alt="" />
                </span>

                <input
                  id="password"
                  name="password"
                  type={showPw ? "text" : "password"}
                  className="input auth-input is-with-eye"
                  value={form.password}
                  onChange={(e) => setField("password", e.target.value)}
                  onBlur={() => handleBlur("password")}
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="Password"
                  required
                  aria-invalid={Boolean(errors.password)}
                />

                <button
                  type="button"
                  className="auth-eye"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  <img
                    src={showPw ? "/icons/eye-off.svg" : "/icons/eye.svg"}
                    alt=""
                    aria-hidden="true"
                  />
                </button>
              </div>

              <span className="error-slot" aria-live="polite">
                {errors.password ? (
                  <span className="error">{errors.password}</span>
                ) : null}
              </span>
            </div>

            <div className="auth-field">
              <label htmlFor="confirm" className="auth-label">
                Confirm password
              </label>

              <div className="auth-control">
                <span className="auth-icon" aria-hidden="true">
                  <img src="/icons/lock.svg" alt="" />
                </span>

                <input
                  id="confirm"
                  name="confirm"
                  type={showConfirm ? "text" : "password"}
                  className="input auth-input is-with-eye"
                  value={form.confirm}
                  onChange={(e) => setField("confirm", e.target.value)}
                  onBlur={() => handleBlur("confirm")}
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="Confirm password"
                  required
                  aria-invalid={Boolean(errors.confirm)}
                />

                <button
                  type="button"
                  className="auth-eye"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  <img
                    src={showConfirm ? "/icons/eye-off.svg" : "/icons/eye.svg"}
                    alt=""
                    aria-hidden="true"
                  />
                </button>
              </div>

              <span className="error-slot" aria-live="polite">
                {errors.confirm ? (
                  <span className="error">{errors.confirm}</span>
                ) : null}
              </span>
            </div>

            <div className="auth-check-row">
              <label className="checkbox auth-checkbox">
                <input
                  type="checkbox"
                  checked={form.terms}
                  onChange={(e) => setField("terms", e.target.checked)}
                  onBlur={() => handleBlur("terms")}
                />
                <span className="auth-checkbox__text">
                  I agree to the{" "}
                  <a className="auth-checkbox__link" href="/agb">
                    Terms (AGB)
                  </a>
                </span>
              </label>

              <span className="error-slot" aria-live="polite">
                {errors.terms ? (
                  <span className="error">{errors.terms}</span>
                ) : null}
              </span>
            </div>

            <div className="auth-actions">
              <button
                className="btn"
                disabled={disabled}
                aria-busy={disabled}
                type="submit"
              >
                {disabled ? "Creating…" : "Create account"}
              </button>

              <button
                type="button"
                className="btn"
                onClick={() => router.push("/admin/login")}
                disabled={disabled}
              >
                I already have an account
              </button>
            </div>
          </fieldset>
        </form>
      </div>
    </section>
  );
}

// //src\app\admin\(auth)\signup\SignupClient.tsx
// "use client";

// import React, { useEffect, useMemo, useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";

// type Form = {
//   fullName: string;
//   email: string;
//   password: string;
//   confirm: string;
//   terms: boolean;
// };

// function isValidEmail(s: string) {
//   return /^\S+@\S+\.\S+$/.test(s);
// }

// export default function SignupClient() {
//   const router = useRouter();
//   const params = useSearchParams();

//   const [form, setForm] = useState<Form>({
//     fullName: "",
//     email: "",
//     password: "",
//     confirm: "",
//     terms: false,
//   });

//   const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
//   const [formError, setFormError] = useState("");
//   const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");

//   const [showPw, setShowPw] = useState(false);
//   const [showConfirm, setShowConfirm] = useState(false);

//   const backHref = useMemo(() => {
//     const from = params.get("from");
//     if (from) return from;
//     return "/admin/login";
//   }, [params]);

//   useEffect(() => {
//     const email = params.get("email") || "";
//     if (email) setForm((f) => ({ ...f, email }));
//   }, [params]);

//   useEffect(() => {
//     document.body.classList.add("is-admin-auth");
//     return () => document.body.classList.remove("is-admin-auth");
//   }, []);

//   function validateAll(f: Form) {
//     const e: Partial<Record<keyof Form, string>> = {};
//     if (!f.fullName.trim()) e.fullName = "Please fill in this field";
//     if (!isValidEmail(f.email)) e.email = "*Please fill out the email field";
//     if (f.password.length < 6) e.password = "Min. 6 characters";
//     if (f.confirm.length < 6) e.confirm = "Min. 6 characters";
//     else if (f.password !== f.confirm) e.confirm = "Passwords do not match";
//     if (!f.terms) e.terms = "Please accept the terms to continue";
//     return e;
//   }

//   function setField<K extends keyof Form>(key: K, value: Form[K]) {
//     setForm((prev) => {
//       const next = { ...prev, [key]: value };
//       setErrors(validateAll(next));
//       return next;
//     });
//   }

//   function handleBlur<K extends keyof Form>(key: K) {
//     const e = validateAll(form);
//     setErrors((prev) => ({ ...prev, [key]: e[key] }));
//   }

//   async function onSubmit(ev: React.FormEvent) {
//     ev.preventDefault();
//     if (status === "sending") return;

//     setFormError("");
//     const e = validateAll(form);
//     setErrors(e);
//     if (Object.keys(e).length) return;

//     setStatus("sending");
//     try {
//       const payload = {
//         fullName: form.fullName.trim(),
//         email: form.email.trim().toLowerCase(),
//         password: form.password,
//       };

//       const r = await fetch("/api/admin/auth/signup", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//         credentials: "include",
//         cache: "no-store",
//       });

//       const d = await r.json().catch(() => ({}) as any);

//       const success = r.ok && (d?.ok === true || d?.user || r.status === 201);
//       if (!success) {
//         if (d?.errors && typeof d.errors === "object") {
//           setErrors((prev) => ({ ...prev, ...d.errors }));
//           setFormError("Please fix the errors above.");
//         } else {
//           const msg =
//             d?.error ||
//             d?.message ||
//             (typeof d?.raw === "string" ? d.raw.slice(0, 200) : "") ||
//             `Registration failed (${r.status}). Please try again.`;
//           setFormError(msg);
//         }
//         setStatus("idle");
//         return;
//       }

//       setStatus("done");
//       router.replace(`/admin/login?email=${encodeURIComponent(payload.email)}`);
//     } catch {
//       setFormError("Network error. Please try again.");
//       setStatus("idle");
//     }
//   }

//   const disabled = status === "sending";

//   return (
//     <section className="admin-auth" aria-busy={disabled}>
//       <div className="auth-card">
//         {/* ✅ Header: Back-Icon + Title vertikal mittig wie DABubble */}
//         <div className="auth-head">
//           <button
//             type="button"
//             className="auth-back"
//             onClick={() => router.push(backHref)}
//             aria-label="Back to login"
//           >
//             <img
//               src="/icons/arrow_right_alt.svg"
//               alt=""
//               aria-hidden="true"
//               className="auth-back__icon"
//             />
//           </button>

//           <h1 className="auth-title">Provider Sign-up</h1>

//           {/* spacer rechts damit Title wirklich mittig bleibt */}
//           <span aria-hidden="true" />
//         </div>

//         <p className="auth-subtitle">
//           Create your provider access. After registration you’ll be redirected
//           to the login page.
//         </p>

//         {formError && (
//           <div className="form-error" role="alert" aria-live="polite">
//             {formError}
//           </div>
//         )}

//         <form className="auth-form" onSubmit={onSubmit} noValidate>
//           <fieldset disabled={disabled} className="auth-fieldset">
//             <div className="auth-field">
//               <label htmlFor="fullName" className="auth-label">
//                 Name
//               </label>

//               <div className="auth-control">
//                 <span className="auth-icon" aria-hidden="true">
//                   <img src="/icons/user.svg" alt="" />
//                 </span>

//                 <input
//                   id="fullName"
//                   name="fullName"
//                   className="input auth-input"
//                   value={form.fullName}
//                   onChange={(e) => setField("fullName", e.target.value)}
//                   onBlur={() => handleBlur("fullName")}
//                   autoComplete="name"
//                   placeholder="Name and surname"
//                   required
//                   aria-invalid={Boolean(errors.fullName)}
//                 />
//               </div>

//               <span className="error-slot" aria-live="polite">
//                 {errors.fullName ? (
//                   <span className="error">{errors.fullName}</span>
//                 ) : null}
//               </span>
//             </div>

//             <div className="auth-field">
//               <label htmlFor="email" className="auth-label">
//                 E-Mail
//               </label>

//               <div className="auth-control">
//                 <span className="auth-icon" aria-hidden="true">
//                   <img src="/icons/mail.svg" alt="" />
//                 </span>

//                 <input
//                   id="email"
//                   name="email"
//                   type="email"
//                   className="input auth-input"
//                   value={form.email}
//                   onChange={(e) => setField("email", e.target.value)}
//                   onBlur={() => handleBlur("email")}
//                   autoComplete="email"
//                   placeholder="admin@example.com"
//                   required
//                   aria-invalid={Boolean(errors.email)}
//                 />
//               </div>

//               <span className="error-slot" aria-live="polite">
//                 {errors.email ? (
//                   <span className="error">{errors.email}</span>
//                 ) : null}
//               </span>
//             </div>

//             <div className="auth-field">
//               <label htmlFor="password" className="auth-label">
//                 Password
//               </label>

//               <div className="auth-control">
//                 <span className="auth-icon" aria-hidden="true">
//                   <img src="/icons/lock.svg" alt="" />
//                 </span>

//                 <input
//                   id="password"
//                   name="password"
//                   type={showPw ? "text" : "password"}
//                   className="input auth-input is-with-eye"
//                   value={form.password}
//                   onChange={(e) => setField("password", e.target.value)}
//                   onBlur={() => handleBlur("password")}
//                   minLength={6}
//                   autoComplete="new-password"
//                   placeholder="Password"
//                   required
//                   aria-invalid={Boolean(errors.password)}
//                 />

//                 <button
//                   type="button"
//                   className="auth-eye"
//                   onClick={() => setShowPw((v) => !v)}
//                   aria-label={showPw ? "Hide password" : "Show password"}
//                 >
//                   <img
//                     src={showPw ? "/icons/eye-off.svg" : "/icons/eye.svg"}
//                     alt=""
//                     aria-hidden="true"
//                   />
//                 </button>
//               </div>

//               <span className="error-slot" aria-live="polite">
//                 {errors.password ? (
//                   <span className="error">{errors.password}</span>
//                 ) : null}
//               </span>
//             </div>

//             <div className="auth-field">
//               <label htmlFor="confirm" className="auth-label">
//                 Confirm password
//               </label>

//               <div className="auth-control">
//                 <span className="auth-icon" aria-hidden="true">
//                   <img src="/icons/lock.svg" alt="" />
//                 </span>

//                 <input
//                   id="confirm"
//                   name="confirm"
//                   type={showConfirm ? "text" : "password"}
//                   className="input auth-input is-with-eye"
//                   value={form.confirm}
//                   onChange={(e) => setField("confirm", e.target.value)}
//                   onBlur={() => handleBlur("confirm")}
//                   minLength={6}
//                   autoComplete="new-password"
//                   placeholder="Confirm password"
//                   required
//                   aria-invalid={Boolean(errors.confirm)}
//                 />

//                 <button
//                   type="button"
//                   className="auth-eye"
//                   onClick={() => setShowConfirm((v) => !v)}
//                   aria-label={showConfirm ? "Hide password" : "Show password"}
//                 >
//                   <img
//                     src={showConfirm ? "/icons/eye-off.svg" : "/icons/eye.svg"}
//                     alt=""
//                     aria-hidden="true"
//                   />
//                 </button>
//               </div>

//               <span className="error-slot" aria-live="polite">
//                 {errors.confirm ? (
//                   <span className="error">{errors.confirm}</span>
//                 ) : null}
//               </span>
//             </div>

//             <div className="auth-check-row">
//               <label className="check">
//                 <input
//                   type="checkbox"
//                   checked={form.terms}
//                   onChange={(e) => setField("terms", e.target.checked)}
//                   onBlur={() => handleBlur("terms")}
//                 />
//                 <span className="check__box" aria-hidden="true" />
//                 <span className="check__text">
//                   I agree to the{" "}
//                   <a className="check__link" href="/agb">
//                     Terms (AGB)
//                   </a>
//                 </span>
//               </label>

//               <span className="error-slot" aria-live="polite">
//                 {errors.terms ? (
//                   <span className="error">{errors.terms}</span>
//                 ) : null}
//               </span>
//             </div>

//             <div className="auth-actions">
//               <button
//                 className="btn"
//                 disabled={disabled}
//                 aria-busy={disabled}
//                 type="submit"
//               >
//                 {disabled ? "Creating…" : "Create account"}
//               </button>

//               <button
//                 type="button"
//                 className="btn"
//                 onClick={() => router.push("/admin/login")}
//                 disabled={disabled}
//               >
//                 I already have an account
//               </button>
//             </div>
//           </fieldset>
//         </form>
//       </div>
//     </section>
//   );
// }
