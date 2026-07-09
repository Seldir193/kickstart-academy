import type { Translate } from "./types";

export function boldSnippet(t: Translate) {
  return `**${t("common.admin.news.dialog.snippet.bold")}**`;
}

export function headingSnippet(t: Translate) {
  return `## ${t("common.admin.news.dialog.snippet.heading")}`;
}

export function quoteSnippet(t: Translate) {
  return `> ${t("common.admin.news.dialog.snippet.quote")}`;
}

export function bulletSnippet(t: Translate) {
  return [item(t), item(t), item(t)].join("\n");
}

export function orderedSnippet(t: Translate) {
  return [`1. ${itemText(t)}`, `2. ${itemText(t)}`, `3. ${itemText(t)}`].join("\n");
}

function item(t: Translate) {
  return `- ${itemText(t)}`;
}

function itemText(t: Translate) {
  return t("common.admin.news.dialog.snippet.item");
}
