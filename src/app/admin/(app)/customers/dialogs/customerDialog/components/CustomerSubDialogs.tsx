// src/app/admin/(app)/customers/dialogs/customerDialog/components/CustomerSubDialogs.tsx
"use client";

import React, { useMemo } from "react";
import type { Customer } from "../../../types";
import BookDialog from "../..//BookDialog";
import CancelDialog from "../../CancelDialog";
import StornoDialog from "../../StornoDialog";
import DocumentsDialog from "../../DocumentsDialog";

type Props = {
  form: Customer;
  documentsOpen: boolean;
  setDocumentsOpen: (v: boolean) => void;
  bookOpen: boolean;
  setBookOpen: (v: boolean) => void;
  cancelOpen: boolean;
  setCancelOpen: (v: boolean) => void;
  stornoOpen: boolean;
  setStornoOpen: (v: boolean) => void;
  setForm: (v: any) => void;
};

function safeText(v: unknown) {
  return String(v ?? "").trim();
}

export default function CustomerSubDialogs(p: Props) {
  const childUid = useMemo(
    () => safeText((p.form as any)?.child?.uid),
    [p.form],
  );

  const childFirst = useMemo(
    () => safeText((p.form as any)?.child?.firstName),
    [p.form],
  );

  const childLast = useMemo(
    () => safeText((p.form as any)?.child?.lastName),
    [p.form],
  );

  const docsKey = useMemo(() => {
    const cid = safeText((p.form as any)?._id);
    return `${cid}::docs::${childUid || "nochild"}`;
  }, [p.form, childUid]);

  return (
    <>
      {/* {p.documentsOpen && (
        <DocumentsDialog
          key={docsKey}
          customerId={p.form._id}
          childUid={childUid}
          childFirst={childFirst}
          childLast={childLast}
          onClose={() => p.setDocumentsOpen(false)}
        />
      )} */}

      {p.documentsOpen && (
        <DocumentsDialog
          customerId={p.form._id}
          onClose={() => p.setDocumentsOpen(false)}
        />
      )}

      {p.bookOpen && (
        <BookDialog
          customerId={p.form._id}
          initialChildUid={childUid}
          onClose={() => p.setBookOpen(false)}
          onBooked={(fresh) => p.setForm(fresh)}
        />
      )}

      {p.cancelOpen && (
        <CancelDialog
          customer={p.form}
          // childFirst={childFirst}
          // childLast={childLast}
          onClose={() => p.setCancelOpen(false)}
          onChanged={(fresh) => p.setForm(fresh)}
        />
      )}
      {/* {p.cancelOpen && (
        <CancelDialog
          key={`${safeText((p.form as any)?._id)}::cancel::${childUid || "nochild"}`}
          customer={p.form}
          childFirst={childFirst}
          childLast={childLast}
          onClose={() => p.setCancelOpen(false)}
          onChanged={(fresh) => p.setForm(fresh)}
        />
      )} */}

      {p.stornoOpen && (
        <StornoDialog
          customer={p.form}
          // childFirst={childFirst}
          // childLast={childLast}
          onClose={() => p.setStornoOpen(false)}
          onChanged={(fresh) => p.setForm(fresh)}
        />
      )}

      {/* {p.stornoOpen && (
        <StornoDialog
          key={`${safeText((p.form as any)?._id)}::storno::${childUid || "nochild"}`}
          customer={p.form}
          childFirst={childFirst}
          childLast={childLast}
          onClose={() => p.setStornoOpen(false)}
          onChanged={(fresh) => p.setForm(fresh)}
        />
      )} */}
    </>
  );
}
