//src\app\admin\(app)\news\components\MediaManager.tsx
"use client";

import { useId, useRef, useState } from "react";
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
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const [fileName, setFileName] = useState("Keine ausgewählt");

  async function addFile(file?: File) {
    if (!file) return;
    const up = await upload(file);
    onChange([...(items || []), toMedia(up)]);
    if (inputRef.current) inputRef.current.value = "";
    setFileName("Keine ausgewählt");
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
          id={inputId}
          ref={inputRef}
          className="ks-file__input"
          type="file"
          accept="image/*,video/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            setFileName(file?.name || "Keine ausgewählt");
            addFile(file);
          }}
        />

        <label className="btn ks-file__btn" htmlFor={inputId}>
          Datei auswählen
        </label>

        <span
          className={
            "ks-file__name" +
            (fileName === "Keine ausgewählt" ? " is-empty" : "")
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
                Open
              </a>
              <button
                className="btn"
                type="button"
                onClick={() => removeIndex(i)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

// "use client";

// import { useId, useRef, useState } from "react";
// import type { Media } from "../types";

// type UploadResult = { url: string; mimetype: string };

// type Props = {
//   items: Media[];
//   onChange: (next: Media[]) => void;
//   upload: (file: File) => Promise<UploadResult>;
// };

// function toMedia(up: UploadResult): Media {
//   const isVideo = String(up.mimetype || "").startsWith("video/");
//   const type: Media["type"] = isVideo ? "video" : "image";
//   return { type, url: up.url, alt: "", title: "" };
// }

// export default function MediaManager({ items, onChange, upload }: Props) {
//   const inputRef = useRef<HTMLInputElement>(null);
//   const inputId = useId();
//   const [fileName, setFileName] = useState<string>("Keine ausgewählt");

//   async function addFile(file?: File) {
//     if (!file) return;
//     const up = await upload(file);
//     onChange([...(items || []), toMedia(up)]);

//     // reset input + label text
//     if (inputRef.current) inputRef.current.value = "";
//     setFileName("Keine ausgewählt");
//   }

//   function removeIndex(index: number) {
//     const next = [...(items || [])];
//     next.splice(index, 1);
//     onChange(next);
//   }

//   return (
//     <div className="media-manager">
//       {/* Styled file picker */}
//       <div className="ks-file">
//         <input
//           id={inputId}
//           ref={inputRef}
//           className="ks-file__input"
//           type="file"
//           accept="image/*,video/*"
//           onChange={(e) => {
//             const file = e.target.files?.[0];
//             setFileName(file?.name || "Keine ausgewählt");
//             addFile(file);
//           }}
//         />

//         <label className="btn ks-file__btn" htmlFor={inputId}>
//           Datei auswählen
//         </label>

//         <span
//           className={
//             "ks-file__name" +
//             (fileName === "Keine ausgewählt" ? " is-empty" : "")
//           }
//           aria-live="polite"
//         >
//           {fileName}
//         </span>
//       </div>

//       {items.length ? (
//         <div className="media-manager__list">
//           {items.map((m, i) => (
//             <div className="media-manager__row" key={`${m.url}-${i}`}>
//               <span className="badge">{m.type.toUpperCase()}</span>
//               <a className="btn" href={m.url} target="_blank" rel="noreferrer">
//                 Open
//               </a>
//               <button
//                 className="btn"
//                 type="button"
//                 onClick={() => removeIndex(i)}
//               >
//                 Remove
//               </button>
//             </div>
//           ))}
//         </div>
//       ) : null}
//     </div>
//   );
// }
