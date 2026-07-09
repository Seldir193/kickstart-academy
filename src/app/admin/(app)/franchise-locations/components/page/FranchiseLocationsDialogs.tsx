import FranchiseLocationDialog from "../../FranchiseLocationDialog";
import DeleteLocationDialog from "../../moderation/DeleteLocationDialog";
import LicenseeInfoDialog from "../../moderation/LicenseeInfoDialog";
import RejectDialog from "../../moderation/RejectDialog";
import { locationName } from "./locationName";
import type { DialogsProps } from "./types";

export default function FranchiseLocationsDialogs(props: DialogsProps) {
  const { p, t, deleteState } = props;
  const onDelete = p.edit?.id ? () => deleteState.openDelete(p.edit!, "mine") : undefined;
  return <><FranchiseLocationDialog open={p.openDialog} initial={p.edit} onClose={p.closeDialog} onSave={p.saveLocation} onDelete={onDelete} /><DeleteLocationDialog open={deleteState.open} locationName={locationName(deleteState.target, t)} onClose={deleteState.close} onConfirm={deleteState.confirm} /><RejectDialog open={p.rejectOpen} onClose={p.closeRejectDialog} onSubmit={p.submitReject} /><LicenseeInfoDialog open={p.infoOpen} item={p.infoItem} onClose={p.closeInfoDialog} /></>;
}
