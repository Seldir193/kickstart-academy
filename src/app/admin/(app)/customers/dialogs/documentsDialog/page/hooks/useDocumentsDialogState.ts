import { useTranslation } from "react-i18next";
import { useFixedSelectbox } from "../../../../hooks/useFixedSelectbox";
import { useOverlayVars } from "../../hooks/useOverlayVars";
import type { DocumentsDialogProps, DocumentsDialogState } from "../types";
import { useDocumentFilters } from "./useDocumentFilters";
import { useDocumentTypes } from "./useDocumentTypes";
import { useDocumentsList } from "./useDocumentsList";
import { useFamilyScope } from "./useFamilyScope";

export function useDocumentsDialogState(props: DocumentsDialogProps): DocumentsDialogState {
  const { t } = useTranslation();
  const filters = useDocumentFilters();
  const types = useDocumentTypes();
  const scope = useFamilyScope(props.customerId, t);
  const selects = useDialogSelectboxes();
  const list = useDocumentsList({ customerId: props.customerId, t, filters, scope, selectedTypes: types.selectedTypes, filterItems: types.filterItems });
  return { t, onClose: props.onClose, types: types.chipState, selectedTypes: types.selectedTypes, filters, scope, list, ...selects };
}

function useDialogSelectboxes() {
  const docsSelect = useFixedSelectbox();
  const perPageSelect = useFixedSelectbox();
  const sortSelect = useFixedSelectbox();
  useOverlayVars(docsSelect);
  useOverlayVars(perPageSelect);
  useOverlayVars(sortSelect);
  return { docsSelect, perPageSelect, sortSelect };
}
