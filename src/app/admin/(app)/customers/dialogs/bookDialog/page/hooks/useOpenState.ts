import { useState } from "react";

export function useOpenState() {
  const [open, setOpen] = useState(false);
  return { open, setOpen };
}
