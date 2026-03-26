//src\app\admin\(app)\customers\dialogs\documentsDialog\components\TypeChips.tsx
"use client";

import React from "react";

type Props = {
  participation: boolean;
  invoice: boolean;
  cancellation: boolean;
  storno: boolean;
  dunning: boolean;
  contract: boolean;
  creditNote: boolean;
  setParticipation: (v: boolean) => void;
  setInvoice: (v: boolean) => void;
  setCancellation: (v: boolean) => void;
  setStorno: (v: boolean) => void;
  setDunning: (v: boolean) => void;
  setContract: (v: boolean) => void;
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

export function TypeChips({
  participation,
  invoice,
  cancellation,
  storno,
  dunning,
  contract,
  creditNote,
  setParticipation,
  setInvoice,
  setCancellation,
  setStorno,
  setDunning,
  setContract,
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
        label="Credit Note"
        onClick={() => {
          setCreditNote(!creditNote);
          onAnyChange();
        }}
      />
      <Chip
        active={contract}
        label="Contract"
        onClick={() => {
          setContract(!contract);
          onAnyChange();
        }}
      />
    </div>
  );
}

// // src/app/admin/(app)/customers/dialogs/documentsDialog/components/TypeChips.tsx
// "use client";

// import React from "react";

// type Props = {
//   participation: boolean;
//   cancellation: boolean;
//   storno: boolean;
//   dunning: boolean;
//   contract: boolean;
//   creditNote: boolean;
//   setParticipation: (v: boolean) => void;
//   setCancellation: (v: boolean) => void;
//   setStorno: (v: boolean) => void;
//   setDunning: (v: boolean) => void;
//   setContract: (v: boolean) => void;
//   setCreditNote: (v: boolean) => void;
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

// export function TypeChips({
//   participation,
//   cancellation,
//   storno,
//   dunning,
//   contract,
//   creditNote,
//   setParticipation,
//   setCancellation,
//   setStorno,
//   setDunning,
//   setContract,
//   setCreditNote,
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
//         active={invoice}
//         label="Invoice"
//         onClick={() => {
//           setInvoice(!invoice);
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
//       <Chip
//         active={creditNote}
//         label="Credit Note"
//         onClick={() => {
//           setCreditNote(!creditNote);
//           onAnyChange();
//         }}
//       />
//       <Chip
//         active={contract}
//         label="Contract"
//         onClick={() => {
//           if (typeof setContract === "function") setContract(!contract);
//           onAnyChange();
//         }}
//       />
//     </div>
//   );
// }
