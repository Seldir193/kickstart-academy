export type ImprintLinks = {
  portalUrl: string;
  privacyUrl: string;
  publicPrivacyUrl: string;
};

function getPublicPrivacyUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_WP_BASE_URL;
  return baseUrl ? `${baseUrl.replace(/\/$/, "")}/datenschutz/` : "";
}

export function getImprintLinks(): ImprintLinks {
  return {
    portalUrl: process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3000",
    privacyUrl: "/admin/privacy",
    publicPrivacyUrl: getPublicPrivacyUrl(),
  };
}
