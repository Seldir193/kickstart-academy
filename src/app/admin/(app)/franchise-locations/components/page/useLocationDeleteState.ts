import { useState } from "react";
import type { FranchiseLocation } from "../../types";
import type { DeleteMode, PageState } from "./types";

type TargetState = {
  open: boolean;
  target: FranchiseLocation | null;
  mode: DeleteMode;
};

function useTargetState() {
  const [state, setState] = useState<TargetState>(initialState());
  const openDelete = (target: FranchiseLocation, mode: DeleteMode) => setState({ open: true, target, mode });
  const close = () => setState(initialState());
  return { state, openDelete, close };
}

function initialState(): TargetState {
  return { open: false, target: null, mode: "mine" };
}

async function runDelete(p: PageState, state: TargetState) {
  if (!state.target?.id) return;
  if (state.mode === "admin") await p.deleteOneAdmin(state.target);
  if (state.mode !== "admin") await p.removeMineOne(state.target.id);
}

export function useLocationDeleteState(p: PageState) {
  const s = useTargetState();
  async function confirm() {
    await runDelete(p, s.state);
    s.close();
  }
  return { ...s.state, close: s.close, confirm, openDelete: s.openDelete };
}
