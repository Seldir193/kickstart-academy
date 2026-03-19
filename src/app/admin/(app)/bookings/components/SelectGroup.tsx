"use client";

export default function SelectGroup(props: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="ks-training-select__group">
      <div className="ks-training-select__group-label">{props.label}</div>
      {props.children}
    </div>
  );
}
