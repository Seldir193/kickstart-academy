"use client";

export default function NoticeToast(props: {
  notice: { type: "ok" | "error"; text: string };
}) {
  return (
    <div
      className={props.notice.type === "ok" ? "ok" : "error"}
      style={{
        position: "fixed",
        right: 12,
        bottom: 12,
        zIndex: 6000,
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: "10px 12px",
        boxShadow: "0 10px 25px rgba(17, 24, 39, .08)",
      }}
    >
      {props.notice.text}
    </div>
  );
}
