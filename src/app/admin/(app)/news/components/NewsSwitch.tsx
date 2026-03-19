"use client";

import React from "react";

type Props = {
  checked: boolean;
  busy: boolean;
  onToggle: () => void;
};

function stop(e: React.SyntheticEvent) {
  e.preventDefault();
  e.stopPropagation();
}

function onActionKey(
  e: React.KeyboardEvent,
  cb: () => void,
  disabled: boolean,
) {
  if (disabled) return;
  if (e.key !== "Enter" && e.key !== " ") return;
  e.preventDefault();
  e.stopPropagation();
  cb();
}

export default function NewsSwitch({ checked, busy, onToggle }: Props) {
  return (
    <span
      className={`coach-switch ${checked ? "is-on" : ""} ${
        busy ? "is-busy" : ""
      }`}
      role="switch"
      aria-checked={!!checked}
      tabIndex={0}
      onPointerDown={stop}
      onMouseDown={stop}
      onClick={(e) => {
        stop(e);
        if (busy) return;
        onToggle();
      }}
      onKeyDown={(e) => onActionKey(e, onToggle, busy)}
      title={checked ? "Online" : "Offline"}
    >
      <span className="coach-switch__track">
        <span className="coach-switch__thumb" />
      </span>
    </span>
  );
}

// //src\app\admin\(app)\news\components\NewsSwitch.tsx
// "use client";

// type Props = {
//   checked: boolean;
//   busy: boolean;
//   label: string;
//   onToggle: (next: boolean) => void;
// };

// export default function NewsSwitch({ checked, busy, label, onToggle }: Props) {
//   return (
//     <button
//       type="button"
//       className={`coach-switch ${checked ? "is-on" : ""} ${busy ? "is-busy" : ""}`}
//       aria-label={label}
//       aria-pressed={checked}
//       disabled={busy}
//       onClick={() => {
//         if (busy) return;
//         onToggle(!checked);
//       }}
//     >
//       <span className="coach-switch__track">
//         <span className="coach-switch__thumb" />
//       </span>
//     </button>
//   );
// }
