import { useState } from "react";
import type { Customer } from "../../types";

export function useCustomersDialogsState() {
  const [editing, setEditing] = useState<Customer | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  return { editing, createOpen, setEditing, setCreateOpen, closeCreate: () => setCreateOpen(false), closeEdit: () => setEditing(null) };
}
