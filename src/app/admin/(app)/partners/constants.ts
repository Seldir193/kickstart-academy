import type { Partner } from "./types";

export const PARTNERS_API = "/api/admin/partners";
export const UPLOAD_API = "/api/admin/upload";

export const EMPTY_PARTNER: Partner = {
  name: "",
  logoUrl: "",
  url: "",
  isActive: true,
  sortOrder: 100,
};
