import type { TFunction } from "i18next";
import type { Customer } from "../../types";
import { childEntries } from "./customerTableData";

type Props = {
  customer: Customer;
  disableTooltips: boolean;
  t: TFunction;
};

function tooltipText(names: string[], t: TFunction): string {
  const previewCount = 8;
  const preview = names.slice(0, previewCount).join("\n");
  const hiddenCount = names.length - previewCount;
  if (hiddenCount <= 0) return preview;
  return `${preview}\n${t("admin.customers.table.children.more", { count: hiddenCount })}`;
}

function childrenLabel(count: number, t: TFunction): string {
  return t("admin.customers.table.children.count", { count });
}

function DisabledChildrenTip({ label }: { label: string }) {
  return (
    <span className="ks-children-tip">
      <span className="ks-children-tip__label">{label}</span>
    </span>
  );
}

function EnabledChildrenTip({ label, tip }: { label: string; tip: string }) {
  return (
    <span className="ks-children-tip" data-ks-tip={tip} tabIndex={0}>
      <span className="ks-children-tip__label">{label}</span>
    </span>
  );
}

export default function CustomerChildrenCell({ customer, disableTooltips, t }: Props) {
  const names = childEntries(customer);
  if (names.length === 0) t("admin.customers.table.common.empty");
  if (names.length === 1) return names[0];
  const label = childrenLabel(names.length, t);
  const tip = tooltipText(names, t);
  if (disableTooltips) return <DisabledChildrenTip label={label} />;
  return <EnabledChildrenTip label={label} tip={tip} />;
}
