"use client";

type Notice = {
  type: "ok" | "error";
  text: string;
};

type AdminNoticeProps = {
  notice: Notice | null;
};

export default function AdminNotice({ notice }: AdminNoticeProps) {
  if (!notice) return null;
  const className = `notice-toast ${notice.type === "ok" ? "ok" : "error"}`;
  return <div className={className}>{notice.text}</div>;
}
