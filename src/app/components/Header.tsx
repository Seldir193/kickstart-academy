// //src\app\components\Header.tsx
//src\app\components\Header.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

const ProfileButton = dynamic(() => import("./ProfileButton"), { ssr: false });

type Props = {
  isAdminInitial?: boolean;
  userInitial?: { id?: string; email?: string };
};

type MeUser = {
  id?: string | null;
  email?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
  role?: string | null;
  isSuperAdmin?: boolean;
  isOwner?: boolean;
};

const WP_CONTACT_URL =
  process.env.NEXT_PUBLIC_WP_CONTACT_URL ||
  "http://localhost/wordpress/index.php/home/";

const adminNav = [
  { href: "/admin", label: "Home" },
  { href: "/admin/orte", label: "Places" },
  { href: "/admin/trainings", label: "Trainings" },
  { href: "/admin/coaches", label: "Coaches" },
  { href: "/admin/invoices", label: "Rechnungen" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/datev", label: "DATEV" },
  { href: "/admin/news", label: "News" },
  { href: "/admin/revenue", label: "Umsatz" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/online-bookings", label: "Online" },
  { href: "/admin/vouchers", label: "Vouchers" },
  { href: "/admin/franchise-locations", label: "Standorte" },
  { href: "/admin/members", label: "Mitglieder" },
];

function isAuthRoute(pathname: string) {
  return (
    pathname === "/admin/login" ||
    pathname === "/admin/signup" ||
    pathname.startsWith("/admin/login") ||
    pathname.startsWith("/admin/signup")
  );
}

function normalize_path(pathname: string) {
  const p = String(pathname || "/").trim();
  if (p === "/") return "/";
  return p.replace(/\/+$/, "");
}

function is_match(currentPath: string, targetPath: string) {
  const current = normalize_path(currentPath);
  const target = normalize_path(targetPath);

  if (target === "/") return current === "/";
  if (target === "/admin") return current === "/admin";

  return current === target || current.startsWith(`${target}/`);
}

function get_active_candidates(href: string) {
  if (href === "/") return ["/", "/admin"];
  if (href === "/orte") return ["/orte", "/admin/orte"];
  if (href === "/trainings") return ["/trainings", "/admin/trainings"];
  if (href === "/customers") return ["/customers", "/admin/customers"];
  return [href];
}

function is_active_route(currentPath: string, href: string) {
  const current = normalize_path(currentPath);
  const candidates = get_active_candidates(href);
  return candidates.some((c) => is_match(current, c));
}

export default function Header({ isAdminInitial = false }: Props) {
  const pathname = usePathname();
  const isAdmin = isAdminInitial;

  const [isLoggingOut] = useState(false);
  const [meUser, setMeUser] = useState<MeUser | null>(null);

  const hidePublicNav = useMemo(() => isAuthRoute(pathname), [pathname]);

  const isSuperAdmin = useMemo(() => {
    const role = String(meUser?.role || "")
      .trim()
      .toLowerCase();
    return meUser?.isSuperAdmin === true || role === "super";
  }, [meUser]);

  useEffect(() => {
    if (!isAdmin) return;

    let cancelled = false;

    (async () => {
      try {
        const r = await fetch("/api/admin/auth/me", { cache: "no-store" });
        const data = await r.json().catch(() => null);

        if (cancelled) return;

        const user = data?.user || null;
        setMeUser(user);
      } catch {
        if (!cancelled) setMeUser(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMoreOpen) return;

    function onPointerDown(e: MouseEvent | TouchEvent) {
      const el = moreRef.current;
      const target = e.target as Node | null;
      if (!el || !target) return;
      if (!el.contains(target)) setIsMoreOpen(false);
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsMoreOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown, { passive: true });
    document.addEventListener("touchstart", onPointerDown, { passive: true });
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isMoreOpen]);

  const { mainLinks, moreLinks } = useMemo(() => {
    const mainHrefs = new Set<string>([
      "/admin",
      "/admin/trainings",
      "/admin/invoices",
      "/admin/customers",
      "/admin/news",
      "/admin/bookings",

      "/admin/franchise-locations",
    ]);

    //const filtered = adminNav.filter(() => true);

    const filtered = adminNav.filter((i) => {
      if (i.href === "/admin/members") return isSuperAdmin;
      return true;
    });

    const main = filtered.filter((i) => mainHrefs.has(i.href));
    const more = filtered.filter((i) => !mainHrefs.has(i.href));

    return { mainLinks: main, moreLinks: more };
  }, [isSuperAdmin]);

  const isMoreActive = useMemo(() => {
    return moreLinks.some((item) => is_active_route(pathname, item.href));
  }, [moreLinks, pathname]);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="Startseite">
          <img src="/assets/img/logo.jpg" alt="Dortmunder Fussballschule" />
        </Link>

        <nav className="nav nav--row">
          {isAdmin ? (
            <>
              <div className="nav__links">
                {mainLinks.map((item) => {
                  const isRouteActive = is_active_route(pathname, item.href);
                  const addActive = !isLoggingOut && isRouteActive;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`nav-link ${addActive ? "active" : ""}`}
                    >
                      {item.label}
                    </Link>
                  );
                })}

                {moreLinks.length > 0 && (
                  <div className="nav-item--group" ref={moreRef}>
                    <button
                      type="button"
                      className={`nav-link nav-link--button ${
                        isMoreOpen || isMoreActive ? "active" : ""
                      }`}
                      aria-haspopup="menu"
                      aria-expanded={isMoreOpen}
                      onClick={() => setIsMoreOpen((v) => !v)}
                    >
                      Mehr
                    </button>

                    <div className={`nav-more ${isMoreOpen ? "is-open" : ""}`}>
                      {moreLinks.map((item) => {
                        const isRouteActive = is_active_route(
                          pathname,
                          item.href,
                        );
                        const addActive = !isLoggingOut && isRouteActive;

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`nav-more__item ${
                              addActive ? "is-active" : ""
                            }`}
                            onClick={() => setIsMoreOpen(false)}
                          >
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="nav__spacer" />

              <div className="header__actions">
                <ProfileButton />
              </div>
            </>
          ) : hidePublicNav ? (
            <div className="nav__spacer" />
          ) : (
            <>
              <Link href="/trainings" className="nav-link">
                Trainings
              </Link>
              <Link href="/coaches" className="nav-link">
                Coaches
              </Link>
              <a href={WP_CONTACT_URL} className="nav-link" rel="noopener">
                Contact
              </a>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

// "use client";

// import React, { useEffect, useMemo, useRef, useState } from "react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import dynamic from "next/dynamic";

// const ProfileButton = dynamic(() => import("./ProfileButton"), { ssr: false });

// type Props = {
//   isAdminInitial?: boolean;
//   userInitial?: { id?: string; email?: string };
// };

// type MeUser = {
//   id?: string | null;
//   email?: string | null;
//   fullName?: string | null;
//   avatarUrl?: string | null;
//   role?: string | null;
//   isSuperAdmin?: boolean;
//   isOwner?: boolean;
// };

// const WP_CONTACT_URL =
//   process.env.NEXT_PUBLIC_WP_CONTACT_URL ||
//   "http://localhost/wordpress/index.php/home/";

// const adminNav = [
//   { href: "/admin", label: "Home" },
//   { href: "/admin/orte", label: "Places" },
//   { href: "/admin/trainings", label: "Trainings" },
//   { href: "/admin/coaches", label: "Coaches" },
//   { href: "/admin/invoices", label: "Rechnungen" },
//   { href: "/admin/customers", label: "Customers" },
//   { href: "/admin/datev", label: "DATEV" },
//   { href: "/admin/news", label: "News" },
//   { href: "/admin/revenue", label: "Umsatz" },
//   { href: "/admin/bookings", label: "Bookings" },
//   { href: "/admin/online-bookings", label: "Online" },
//   { href: "/admin/franchise-locations", label: "Standorte" },
//   { href: "/admin/members", label: "Mitglieder" },
// ];

// function isAuthRoute(pathname: string) {
//   return (
//     pathname === "/admin/login" ||
//     pathname === "/admin/signup" ||
//     pathname.startsWith("/admin/login") ||
//     pathname.startsWith("/admin/signup")
//   );
// }

// function normalize_path(pathname: string) {
//   const p = String(pathname || "/").trim();
//   if (p === "/") return "/";
//   return p.replace(/\/+$/, "");
// }

// function is_match(currentPath: string, targetPath: string) {
//   const current = normalize_path(currentPath);
//   const target = normalize_path(targetPath);

//   if (target === "/") return current === "/";
//   if (target === "/admin") return current === "/admin";

//   return current === target || current.startsWith(`${target}/`);
// }

// function get_active_candidates(href: string) {
//   if (href === "/") return ["/", "/admin"];
//   if (href === "/orte") return ["/orte", "/admin/orte"];
//   if (href === "/trainings") return ["/trainings", "/admin/trainings"];
//   if (href === "/customers") return ["/customers", "/admin/customers"];
//   return [href];
// }

// function is_active_route(currentPath: string, href: string) {
//   const current = normalize_path(currentPath);
//   const candidates = get_active_candidates(href);
//   return candidates.some((c) => is_match(current, c));
// }

// export default function Header({ isAdminInitial = false }: Props) {
//   const pathname = usePathname();
//   const isAdmin = isAdminInitial;

//   const [isLoggingOut] = useState(false);
//   const [meUser, setMeUser] = useState<MeUser | null>(null);

//   const hidePublicNav = useMemo(() => isAuthRoute(pathname), [pathname]);

//   const isSuperAdmin = useMemo(() => {
//     const role = String(meUser?.role || "")
//       .trim()
//       .toLowerCase();
//     return meUser?.isSuperAdmin === true || role === "super";
//   }, [meUser]);

//   useEffect(() => {
//     if (!isAdmin) return;

//     let cancelled = false;

//     (async () => {
//       try {
//         const r = await fetch("/api/admin/auth/me", { cache: "no-store" });
//         const data = await r.json().catch(() => null);

//         if (cancelled) return;

//         const user = data?.user || null;
//         setMeUser(user);
//       } catch {
//         if (!cancelled) setMeUser(null);
//       }
//     })();

//     return () => {
//       cancelled = true;
//     };
//   }, [isAdmin]);

//   const [isMoreOpen, setIsMoreOpen] = useState(false);
//   const moreRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     setIsMoreOpen(false);
//   }, [pathname]);

//   useEffect(() => {
//     if (!isMoreOpen) return;

//     function onPointerDown(e: MouseEvent | TouchEvent) {
//       const el = moreRef.current;
//       const target = e.target as Node | null;
//       if (!el || !target) return;
//       if (!el.contains(target)) setIsMoreOpen(false);
//     }

//     function onKeyDown(e: KeyboardEvent) {
//       if (e.key === "Escape") setIsMoreOpen(false);
//     }

//     document.addEventListener("mousedown", onPointerDown, { passive: true });
//     document.addEventListener("touchstart", onPointerDown, { passive: true });
//     document.addEventListener("keydown", onKeyDown);

//     return () => {
//       document.removeEventListener("mousedown", onPointerDown);
//       document.removeEventListener("touchstart", onPointerDown);
//       document.removeEventListener("keydown", onKeyDown);
//     };
//   }, [isMoreOpen]);

//   const { mainLinks, moreLinks } = useMemo(() => {
//     const mainHrefs = new Set<string>([
//       "/admin",
//       "/admin/trainings",
//       "/admin/invoices",
//       "/admin/customers",
//       "/admin/news",
//       "/admin/bookings",
//       "/admin/franchise-locations",
//     ]);

//     //const filtered = adminNav.filter(() => true);

//     const filtered = adminNav.filter((i) => {
//       if (i.href === "/admin/members") return isSuperAdmin;
//       return true;
//     });

//     const main = filtered.filter((i) => mainHrefs.has(i.href));
//     const more = filtered.filter((i) => !mainHrefs.has(i.href));

//     return { mainLinks: main, moreLinks: more };
//   }, []);

//   const isMoreActive = useMemo(() => {
//     return moreLinks.some((item) => is_active_route(pathname, item.href));
//   }, [moreLinks, pathname]);

//   return (
//     <header className="site-header">
//       <div className="container header-inner">
//         <Link href="/" className="brand" aria-label="Startseite">
//           <img src="/assets/img/logo.jpg" alt="Dortmunder Fussballschule" />
//         </Link>

//         <nav className="nav nav--row">
//           {isAdmin ? (
//             <>
//               <div className="nav__links">
//                 {mainLinks.map((item) => {
//                   const isRouteActive = is_active_route(pathname, item.href);
//                   const addActive = !isLoggingOut && isRouteActive;

//                   return (
//                     <Link
//                       key={item.href}
//                       href={item.href}
//                       className={`nav-link ${addActive ? "active" : ""}`}
//                     >
//                       {item.label}
//                     </Link>
//                   );
//                 })}

//                 {moreLinks.length > 0 && (
//                   <div className="nav-item--group" ref={moreRef}>
//                     <button
//                       type="button"
//                       className={`nav-link nav-link--button ${
//                         isMoreOpen || isMoreActive ? "active" : ""
//                       }`}
//                       aria-haspopup="menu"
//                       aria-expanded={isMoreOpen}
//                       onClick={() => setIsMoreOpen((v) => !v)}
//                     >
//                       Mehr
//                     </button>

//                     <div className={`nav-more ${isMoreOpen ? "is-open" : ""}`}>
//                       {moreLinks.map((item) => {
//                         const isRouteActive = is_active_route(
//                           pathname,
//                           item.href,
//                         );
//                         const addActive = !isLoggingOut && isRouteActive;

//                         return (
//                           <Link
//                             key={item.href}
//                             href={item.href}
//                             className={`nav-more__item ${
//                               addActive ? "is-active" : ""
//                             }`}
//                             onClick={() => setIsMoreOpen(false)}
//                           >
//                             {item.label}
//                           </Link>
//                         );
//                       })}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               <div className="nav__spacer" />

//               <div className="header__actions">
//                 <ProfileButton />
//               </div>
//             </>
//           ) : hidePublicNav ? (
//             <div className="nav__spacer" />
//           ) : (
//             <>
//               <Link href="/trainings" className="nav-link">
//                 Trainings
//               </Link>
//               <Link href="/coaches" className="nav-link">
//                 Coaches
//               </Link>
//               <a href={WP_CONTACT_URL} className="nav-link" rel="noopener">
//                 Contact
//               </a>
//             </>
//           )}
//         </nav>
//       </div>
//     </header>
//   );
// }
