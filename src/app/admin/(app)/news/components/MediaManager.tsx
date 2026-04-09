"use client";

import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { MediaItem } from "../types";

type UploadResult = { url: string; mimetype: string };

type Props = {
  items: MediaItem[];
  onChange: (next: MediaItem[]) => void;
  upload: (file: File) => Promise<UploadResult>;
};

function clean(v: unknown) {
  return String(v ?? "").trim();
}

function mediaTypeOf(mimetype: string) {
  return clean(mimetype).startsWith("video/") ? "video" : "image";
}

function toMedia(up: UploadResult): MediaItem {
  return {
    type: mediaTypeOf(up.mimetype),
    url: clean(up.url),
    alt: "",
    title: "",
  };
}

export default function MediaManager({ items, onChange, upload }: Props) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState(
    t("common.admin.news.mediaManager.noFileSelected"),
  );

  async function addFile(file?: File) {
    if (!file) return;
    const up = await upload(file);
    onChange([...(items || []), toMedia(up)]);
    if (inputRef.current) inputRef.current.value = "";
    setFileName(t("common.admin.news.mediaManager.noFileSelected"));
  }

  function removeIndex(index: number) {
    const next = [...(items || [])];
    next.splice(index, 1);
    onChange(next);
  }

  return (
    <div className="media-manager">
      <div className="ks-file">
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            setFileName(
              file?.name || t("common.admin.news.mediaManager.noFileSelected"),
            );
            addFile(file);
          }}
        />

        <button
          type="button"
          className="btn ks-file__btn"
          onClick={() => inputRef.current?.click()}
        >
          {t("common.admin.news.mediaManager.chooseFile")}
        </button>

        <span
          className={
            "ks-file__name" +
            (fileName === t("common.admin.news.mediaManager.noFileSelected")
              ? " is-empty"
              : "")
          }
          aria-live="polite"
        >
          {fileName}
        </span>
      </div>

      {items.length ? (
        <div className="media-manager__list">
          {items.map((m, i) => (
            <div className="media-manager__row" key={`${m.url}-${i}`}>
              <span className="badge">{String(m.type).toUpperCase()}</span>
              <a className="btn" href={m.url} target="_blank" rel="noreferrer">
                {t("common.admin.news.mediaManager.open")}
              </a>
              <button
                className="btn"
                type="button"
                onClick={() => removeIndex(i)}
              >
                {t("common.admin.news.mediaManager.remove")}
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
