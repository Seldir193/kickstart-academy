import { useState } from "react";
import { getDownloadIconSrc } from "../lib/documentDisplay";

type Props = { href: string; label: string };

export function DownloadButton({ href, label }: Props) {
  const [isActive, setIsActive] = useState(false);
  return <DownloadLink href={href} label={label} isActive={isActive} setIsActive={setIsActive} />;
}

function DownloadLink(props: Props & { isActive: boolean; setIsActive: (value: boolean) => void }) {
  return (
    <a href={props.href} className="btn documents-dialog__downloadBtn" title={props.label} aria-label={props.label} onMouseEnter={() => props.setIsActive(true)} onMouseLeave={() => props.setIsActive(false)} onFocus={() => props.setIsActive(true)} onBlur={() => props.setIsActive(false)}>
      <img src={getDownloadIconSrc(props.isActive)} alt="" aria-hidden="true" className="documents-dialog__downloadIcon" />
      <span>{props.label}</span>
    </a>
  );
}
