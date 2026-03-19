"use client";

export default function SelectOption(props: {
  active: boolean;
  onClick: () => void;
  text: string;
}) {
  const cls =
    "ks-training-select__option" + (props.active ? " is-selected" : "");

  return (
    <li>
      <button type="button" className={cls} onClick={props.onClick}>
        {props.text}
      </button>
    </li>
  );
}
