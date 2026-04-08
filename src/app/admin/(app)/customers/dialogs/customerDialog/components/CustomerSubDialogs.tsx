"use client";

import React, { useMemo } from "react";
import type { Customer } from "../../../types";
import BookDialog from "../../BookDialog";
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

  void childFirst;
  void childLast;

  return (
    <>
      {p.documentsOpen ? (
        <DocumentsDialog
          customerId={p.form._id}
          onClose={() => p.setDocumentsOpen(false)}
        />
      ) : null}

      {p.bookOpen ? (
        <BookDialog
          customerId={p.form._id}
          initialChildUid={childUid}
          onClose={() => p.setBookOpen(false)}
          onBooked={(fresh) => p.setForm(fresh)}
        />
      ) : null}

      {p.cancelOpen ? (
        <CancelDialog
          customer={p.form}
          onClose={() => p.setCancelOpen(false)}
          onChanged={(fresh) => p.setForm(fresh)}
        />
      ) : null}

      {p.stornoOpen ? (
        <StornoDialog
          customer={p.form}
          onClose={() => p.setStornoOpen(false)}
          onChanged={(fresh) => p.setForm(fresh)}
        />
      ) : null}
    </>
  );
}
