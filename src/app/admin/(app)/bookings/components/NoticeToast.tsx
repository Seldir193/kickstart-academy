"use client";

export default function NoticeToast(props: {
  notice: { type: "ok" | "error"; text: string };
}) {
  return (
    <div
      className={`notice-toast ${props.notice.type === "ok" ? "ok" : "error"}`}
    >
      {props.notice.text}
    </div>
  );
}
