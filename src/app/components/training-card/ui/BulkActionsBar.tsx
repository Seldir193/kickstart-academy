"use client";

import React from "react";

type Props = {
  selectedCount: number;
  onClear: () => void;
  onBulkDelete: () => void;
};

export default function BulkActionsBar({
  selectedCount,
  onClear,
  onBulkDelete,
}: Props) {
  if (selectedCount <= 0) return null;

  return (
    <section className="card" aria-live="polite">
      <div className="card-head">
        <h3 className="card-title m-0">{selectedCount} selected</h3>
        <div className="card-actions" style={{ display: "flex", gap: 8 }}>
          <button className="btn" onClick={onClear}>
            Clear
          </button>
          <button className="btn btn--danger" onClick={onBulkDelete}>
            Delete selected
          </button>
        </div>
      </div>
    </section>
  );
}
