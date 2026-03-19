"use client";

export default function SearchInput(props: {
  value: string;
  onChange: (v: string) => void;
  onKeyDown: (key: string) => void;
}) {
  return (
    <div className="input-with-icon">
      <img
        src="/icons/search.svg"
        alt=""
        aria-hidden="true"
        className="input-with-icon__icon"
      />
      <input
        className="input input-with-icon__input"
        placeholder="Name, email, level, code, message…"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        onKeyDown={(e) => props.onKeyDown(e.key)}
      />
    </div>
  );
}
