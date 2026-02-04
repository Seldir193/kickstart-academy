"use client";

import React from "react";
import type { Offer } from "../types";

type Props = {
  loading: boolean;
  items: Offer[];
  selectedIds: string[];
  allSelected: boolean;

  onToggleAll: (checked: boolean) => void;
  onToggleOne: (id: string, checked: boolean) => void;

  onStartEdit: (o: Offer) => void;
  onOpenEdit: (o: Offer) => void;

  avatarSrc: (o: Offer) => string;
};

export default function TrainingResults(props: Props) {
  const {
    loading,
    items,
    selectedIds,
    allSelected,
    onToggleAll,
    onToggleOne,
    onStartEdit,
    onOpenEdit,
    avatarSrc,
  } = props;

  return (
    <section className="card p-0 overflow-hidden">
      {loading ? (
        <div className="card__empty">Loading…</div>
      ) : items.length === 0 ? (
        <div className="card__empty">No offers found.</div>
      ) : (
        <>
          <div
            className="list-header"
            style={{
              paddingLeft: "calc(var(--card-pad) + 1rem)",
              paddingRight: "calc(var(--card-pad) + 1rem)",
              paddingTop: 8,
              paddingBottom: 8,
              borderBottom: "1px solid #eef2f7",
            }}
          >
            <label
              className="label"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                margin: 0,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={allSelected}
                aria-label="Alle auswählen"
                onChange={(e) => onToggleAll(e.target.checked)}
                onClick={(e) => e.stopPropagation()}
              />
              Alle auswählen
            </label>
          </div>

          <ul className="list list--bleed">
            {items.map((it) => {
              const isChecked = selectedIds.includes(it._id);

              return (
                <li
                  key={it._id}
                  className="list__item chip is-fullhover is-interactive"
                  onClick={() => onStartEdit(it)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onStartEdit(it);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Edit offer ${it.title ?? it.type}`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    aria-label="Zeile auswählen"
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => onToggleOne(it._id, e.target.checked)}
                    style={{ marginRight: 10 }}
                  />

                  <img
                    src={avatarSrc(it) || "/assets/img/avatar.png"}
                    alt={
                      it.coachName ? `Coach ${it.coachName}` : "Coach avatar"
                    }
                    className="list__avatar"
                    onError={(e) => {
                      e.currentTarget.src = "/assets/img/avatar.png";
                    }}
                  />

                  <div className="list__body">
                    {(() => {
                      const rawTitle = (it.title ?? "").trim();
                      const hasDash = rawTitle.includes(" — ");
                      const [left, right] = hasDash
                        ? rawTitle.split(" — ")
                        : [rawTitle, ""];
                      const titleLine = (left || it.type || "Offer").trim();
                      const metaLocation = (right || it.location || "").trim();

                      return (
                        <>
                          <div className="list__title">{titleLine}</div>

                          <div className="list__meta">
                            {metaLocation ? <>{metaLocation} </> : null}

                            {typeof it.price === "number" ? (
                              <>· {it.price} €</>
                            ) : (
                              <>· Price on request</>
                            )}

                            {it.coachName ? (
                              <> · Coach: {it.coachName}</>
                            ) : null}
                            {it.category ? <> · {it.category}</> : null}
                            {it.sub_type ? <> · {it.sub_type}</> : null}
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  <div
                    className="list__actions"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <span
                      className="edit-trigger"
                      role="button"
                      tabIndex={0}
                      title="Edit"
                      aria-label="Edit"
                      onClick={() => onOpenEdit(it)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onOpenEdit(it);
                        }
                      }}
                    >
                      <img
                        src="/icons/edit.svg"
                        alt=""
                        aria-hidden="true"
                        className="icon-img"
                      />
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
