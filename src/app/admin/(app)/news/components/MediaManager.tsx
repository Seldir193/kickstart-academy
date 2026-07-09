"use client";

import { useRef, useState } from "react";
import type { ChangeEvent, RefObject } from "react";
import { useTranslation } from "react-i18next";
import type { MediaItem, NewsUploadPurpose } from "../types";

type UploadResult = { url: string; mimetype: string };

type Props = {
  items: MediaItem[];
  onChange: (next: MediaItem[]) => void;
  upload: (file: File, purpose: NewsUploadPurpose) => Promise<UploadResult>;
};

function clean(value: unknown) {
  return String(value ?? "").trim();
}

function mediaTypeOf(mimetype: string) {
  return clean(mimetype).startsWith("video/") ? "video" : "image";
}

function toMedia(upload: UploadResult): MediaItem {
  return { type: mediaTypeOf(upload.mimetype), url: clean(upload.url), alt: "", title: "" };
}

export default function MediaManager({ items, onChange, upload }: Props) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const emptyLabel = t("common.admin.news.mediaManager.noFileSelected");
  const [fileName, setFileName] = useState(emptyLabel);
  const ctx = { items, onChange, upload, inputRef, fileName, setFileName, emptyLabel, t };
  return <MediaManagerView ctx={ctx} />;
}

type ManagerContext = {
  items: MediaItem[];
  onChange: (next: MediaItem[]) => void;
  upload: Props["upload"];
  inputRef: RefObject<HTMLInputElement | null>;
  fileName: string;
  setFileName: (value: string) => void;
  emptyLabel: string;
  t: (key: string) => string;
};

function MediaManagerView({ ctx }: { ctx: ManagerContext }) {
  return (
    <div className="media-manager">
      <MediaFilePicker ctx={ctx} />
      {ctx.items.length ? <MediaList ctx={ctx} /> : null}
    </div>
  );
}

function MediaFilePicker({ ctx }: { ctx: ManagerContext }) {
  return (
    <div className="ks-file">
      <MediaFileInput ctx={ctx} />
      <MediaFileButton ctx={ctx} />
      <MediaFileName ctx={ctx} />
    </div>
  );
}

function MediaFileInput({ ctx }: { ctx: ManagerContext }) {
  return <input ref={ctx.inputRef} type="file" accept="image/*,video/*" hidden onChange={(event) => handleFileChange(ctx, event)} />;
}

function MediaFileButton({ ctx }: { ctx: ManagerContext }) {
  return <button type="button" className="btn ks-file__btn" onClick={() => ctx.inputRef.current?.click()}>{ctx.t("common.admin.news.mediaManager.chooseFile")}</button>;
}

function MediaFileName({ ctx }: { ctx: ManagerContext }) {
  return <span className={fileNameClass(ctx)} aria-live="polite">{ctx.fileName}</span>;
}

function MediaList({ ctx }: { ctx: ManagerContext }) {
  return <div className="media-manager__list">{ctx.items.map((item, index) => <MediaRow ctx={ctx} item={item} index={index} key={`${item.url}-${index}`} />)}</div>;
}

function MediaRow({ ctx, item, index }: MediaRowProps) {
  return (
    <div className="media-manager__row">
      <span className="badge">{String(item.type).toUpperCase()}</span>
      <a className="btn" href={item.url} target="_blank" rel="noreferrer">{ctx.t("common.admin.news.mediaManager.open")}</a>
      <button className="btn" type="button" onClick={() => removeIndex(ctx, index)}>{ctx.t("common.admin.news.mediaManager.remove")}</button>
    </div>
  );
}

type MediaRowProps = {
  ctx: ManagerContext;
  item: MediaItem;
  index: number;
};

async function addFile(ctx: ManagerContext, file?: File) {
  if (!file) return;
  const uploaded = await ctx.upload(file, "news-media");
  ctx.onChange([...(ctx.items || []), toMedia(uploaded)]);
  resetFileInput(ctx);
}

function resetFileInput(ctx: ManagerContext) {
  if (ctx.inputRef.current) ctx.inputRef.current.value = "";
  ctx.setFileName(ctx.emptyLabel);
}

function removeIndex(ctx: ManagerContext, index: number) {
  const next = [...(ctx.items || [])];
  next.splice(index, 1);
  ctx.onChange(next);
}

function handleFileChange(ctx: ManagerContext, event: ChangeEvent<HTMLInputElement>) {
  const file = event.target.files?.[0];
  ctx.setFileName(file?.name || ctx.emptyLabel);
  addFile(ctx, file);
}

function fileNameClass(ctx: ManagerContext) {
  return "ks-file__name" + (ctx.fileName === ctx.emptyLabel ? " is-empty" : "");
}
