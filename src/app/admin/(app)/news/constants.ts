// src/app/admin/news/constants.ts
import type { Category } from "./types";

export const PAGE_LIMIT = 10;

// export const CATEGORIES: Category[] = [
//   "Allgemein",
//   "News",
//   "Partnerverein",
//   "Projekte",
// ];

export const CATEGORIES: Category[] = [
  "General",
  "News",
  "Partner Club",
  "Projects",
];

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

//export const NEWS_API = `${API_BASE}/api/news`;
export const NEWS_API = "/api/admin/news";
//export const UPLOAD_API = `${API_BASE}/api/upload`;
export const UPLOAD_API = "/api/admin/upload";

export const WP_DETAIL_BASE =
  process.env.NEXT_PUBLIC_WP_NEWS_DETAIL ||
  "http://localhost/wordpress/index.php/news-detail/?slug=";

export const DEFAULT_CATEGORY: Category = "News";
