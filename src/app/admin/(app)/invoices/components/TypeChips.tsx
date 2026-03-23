// src/app/admin/(app)/invoices/components/TypeChips.tsx
"use client";

import React from "react";

type Props = {
  participation: boolean;
  cancellation: boolean;
  storno: boolean;
  dunning: boolean;
  creditNote: boolean;

  invoice: boolean;
  setInvoice: (v: boolean) => void;

  setParticipation: (v: boolean) => void;
  setCancellation: (v: boolean) => void;
  setStorno: (v: boolean) => void;
  setDunning: (v: boolean) => void;
  setCreditNote: (v: boolean) => void;

  onAnyChange: () => void;
};

function Chip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={"ks-filter-chip" + (active ? " ks-filter-chip--active" : "")}
      aria-pressed={active}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export default function TypeChips({
  participation,
  invoice,
  cancellation,
  storno,
  dunning,
  creditNote,
  setParticipation,
  setInvoice,
  setCancellation,
  setStorno,
  setDunning,
  setCreditNote,
  onAnyChange,
}: Props) {
  return (
    <div className="ks-filter-chips">
      <Chip
        active={participation}
        label="Participation"
        onClick={() => {
          setParticipation(!participation);
          onAnyChange();
        }}
      />
      <Chip
        active={invoice}
        label="Invoice"
        onClick={() => {
          setInvoice(!invoice);
          onAnyChange();
        }}
      />
      <Chip
        active={cancellation}
        label="Cancellation"
        onClick={() => {
          setCancellation(!cancellation);
          onAnyChange();
        }}
      />
      <Chip
        active={storno}
        label="Storno"
        onClick={() => {
          setStorno(!storno);
          onAnyChange();
        }}
      />
      <Chip
        active={dunning}
        label="Dunning"
        onClick={() => {
          setDunning(!dunning);
          onAnyChange();
        }}
      />
      <Chip
        active={creditNote}
        label="Credit note"
        onClick={() => {
          setCreditNote(!creditNote);
          onAnyChange();
        }}
      />
    </div>
  );
}

// // src/app/admin/(app)/invoices/components/TypeChips.tsx
// "use client";

// import React from "react";

// type Props = {
//   participation: boolean;
//   cancellation: boolean;
//   storno: boolean;
//   dunning: boolean;
//   setParticipation: (v: boolean) => void;
//   setCancellation: (v: boolean) => void;
//   setStorno: (v: boolean) => void;
//   setDunning: (v: boolean) => void;
//   onAnyChange: () => void;
// };

// function Chip({
//   active,
//   label,
//   onClick,
// }: {
//   active: boolean;
//   label: string;
//   onClick: () => void;
// }) {
//   return (
//     <button
//       type="button"
//       className={"ks-filter-chip" + (active ? " ks-filter-chip--active" : "")}
//       aria-pressed={active}
//       onClick={onClick}
//     >
//       {label}
//     </button>
//   );
// }

// export default function TypeChips({
//   participation,
//   cancellation,
//   storno,
//   dunning,
//   setParticipation,
//   setCancellation,
//   setStorno,
//   setDunning,
//   onAnyChange,
// }: Props) {
//   return (
//     <div className="ks-filter-chips">
//       <Chip
//         active={participation}
//         label="Participation"
//         onClick={() => {
//           setParticipation(!participation);
//           onAnyChange();
//         }}
//       />
//       <Chip
//         active={cancellation}
//         label="Cancellation"
//         onClick={() => {
//           setCancellation(!cancellation);
//           onAnyChange();
//         }}
//       />
//       <Chip
//         active={storno}
//         label="Storno"
//         onClick={() => {
//           setStorno(!storno);
//           onAnyChange();
//         }}
//       />
//       <Chip
//         active={dunning}
//         label="Dunning"
//         onClick={() => {
//           setDunning(!dunning);
//           onAnyChange();
//         }}
//       />
//     </div>
//   );
// }
