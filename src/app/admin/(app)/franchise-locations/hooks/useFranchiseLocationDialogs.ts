import { useCallback, useState } from "react";
import type { FranchiseLocation } from "../types";

export function useFranchiseLocationDialogs() {
  const [openDialog, setOpenDialog] = useState(false);
  const [edit, setEdit] = useState<FranchiseLocation | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<FranchiseLocation | null>(
    null,
  );
  const [infoOpen, setInfoOpen] = useState(false);
  const [infoItem, setInfoItem] = useState<FranchiseLocation | null>(null);
  const openCreate = useCallback(() => {
    setEdit(null);
    setOpenDialog(true);
  }, []);
  const openEdit = useCallback((item: FranchiseLocation) => {
    setEdit(item);
    setOpenDialog(true);
  }, []);
  const closeDialog = useCallback(() => setOpenDialog(false), []);
  const openInfo = useCallback((item: FranchiseLocation) => {
    setInfoItem(item);
    setInfoOpen(true);
  }, []);
  const closeInfoDialog = useCallback(() => setInfoOpen(false), []);
  const openReject = useCallback((item: FranchiseLocation) => {
    setRejectTarget(item);
    setRejectOpen(true);
  }, []);
  const closeRejectDialog = useCallback(() => {
    setRejectOpen(false);
    setRejectTarget(null);
  }, []);
  return {
    openDialog,
    setOpenDialog,
    edit,
    openCreate,
    openEdit,
    closeDialog,
    rejectOpen,
    rejectTarget,
    openReject,
    closeRejectDialog,
    infoOpen,
    infoItem,
    openInfo,
    closeInfoDialog,
  };
}
