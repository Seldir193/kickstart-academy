import type { Translate } from "./types";

function templateIntro(t: Translate) {
  return [
    `## ${t("common.admin.news.dialog.template.intro")}`,
    "",
    t("common.admin.news.dialog.template.introText"),
  ];
}

function templateMain(t: Translate) {
  return [
    "",
    `## ${t("common.admin.news.dialog.template.mainSection")}`,
    "",
    `1. ${t("common.admin.news.dialog.template.firstPoint")}`,
    `2. ${t("common.admin.news.dialog.template.secondPoint")}`,
    `3. ${t("common.admin.news.dialog.template.thirdPoint")}`,
  ];
}

function templateChecklist(t: Translate) {
  return [
    "",
    `> ${t("common.admin.news.dialog.template.quoteHint")}`,
    "",
    `## ${t("common.admin.news.dialog.template.checklist")}`,
    "",
    `- ${t("common.admin.news.dialog.template.bulletOne")}`,
    `- ${t("common.admin.news.dialog.template.bulletTwo")}`,
    `- ${t("common.admin.news.dialog.template.bulletThree")}`,
  ];
}

export function templateText(t: Translate) {
  return [
    ...templateIntro(t),
    ...templateMain(t),
    ...templateChecklist(t),
  ].join("\n");
}

export function applyInsert(value: string, insert: string) {
  const trimmed = value ? `${value}\n\n` : "";
  return `${trimmed}${insert}`.trim();
}
