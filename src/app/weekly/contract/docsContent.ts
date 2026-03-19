//src\app\weekly\contract\docsContent.ts
export type DocKey = "agb" | "privacy" | "photo";

export const docsHtml: Record<DocKey, string> = {
  agb: `
    <h2>Teilnahmebedingungen (AGB)</h2>
    <p>Hier kommt dein AGB-Text rein. Du kannst ihn beliebig lang machen.</p>
  `,
  privacy: `
    <h2>Datenschutzhinweise</h2>
    <p>Hier kommt dein Datenschutz-Text rein. Du kannst ihn beliebig lang machen.</p>
  `,
  photo: `
    <h2>Foto/Video Einwilligung</h2>
    <p>Hier kommt der Text zur Foto/Video Einwilligung rein (optional).</p>
  `,
};
