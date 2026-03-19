//src\app\admin\(app)\customers\dialogs\CustomerDialog.tsx
"use client";

import React, { useMemo } from "react";
import type { Customer } from "../types";
import { statusLabel } from "./customerDialog/formatters";
import { useCustomerForm } from "./customerDialog/hooks/useCustomerForm";
import { useCustomerFamily } from "./customerDialog/hooks/useCustomerFamily";
import { useCustomerOffers } from "./customerDialog/hooks/useCustomerOffers";
import CustomerDialogHeader from "./customerDialog/components/CustomerDialogHeader";
import CustomerFamilySection from "./customerDialog/components/CustomerFamilySection";
import CustomerChildFieldset from "./customerDialog/components/CustomerChildFieldset";
import CustomerParentFieldset from "./customerDialog/components/CustomerParentFieldset";
import CustomerAddressFieldset from "./customerDialog/components/CustomerAddressFieldset";
import CustomerNotesFieldset from "./customerDialog/components/CustomerNotesFieldset";
import CustomerDialogFooter from "./customerDialog/components/CustomerDialogFooter";
import CustomerSubDialogs from "./customerDialog/components/CustomerSubDialogs";

type Props = {
  mode: "create" | "edit";
  customer?: Customer | null;
  onClose: () => void;
  onCreated?: () => void;
  onSaved?: () => void;
  onDeleted?: () => void;
};

export default function CustomerDialog(p: Props) {
  void p.onDeleted;

  const f = useCustomerForm(p.mode, p.customer);
  const fam = useCustomerFamily(p.mode, p.customer, f.form, f.setForm);
  const offers = useCustomerOffers(p.mode);

  const mk = useMemo(() => {
    const anyForm = f.form as any;
    return {
      provider: anyForm?.marketingProvider as string | undefined,
      status: anyForm?.marketingStatus as string | undefined,
      contactId: anyForm?.marketingContactId as string | undefined,
      lastSyncedAt:
        anyForm?.marketingLastSyncedAt ??
        anyForm?.marketingSyncedAt ??
        anyForm?.lastSyncedAt ??
        null,
      consentAt: anyForm?.marketingConsentAt as any,
      lastError: anyForm?.marketingLastError as string | undefined,
    };
  }, [f.form]);

  const isActive = !f.form?.canceledAt;
  void offers;

  return (
    <div className="ks-modal-root ks-customer-dialog">
      <div className="ks-backdrop" onClick={p.onClose} />
      <div
        className="ks-panel card ks-panel--lg"
        onClick={(e) => e.stopPropagation()}
      >
        <CustomerDialogHeader
          form={f.form}
          mode={p.mode}
          isActive={isActive}
          familyCreateMode={fam.familyCreateMode}
          setDocumentsOpen={f.setDocumentsOpen}
          setBookOpen={f.setBookOpen}
          setCancelOpen={f.setCancelOpen}
          setStornoOpen={f.setStornoOpen}
        />

        {f.err && <div className="mb-2 text-red-600">{f.err}</div>}

        {/* <CustomerFamilySection
          mode={p.mode}
          childFamilyMembers={fam.childFamilyMembers}
          selfFamilyMembers={fam.selfFamilyMembers}
          familyLoading={fam.familyLoading}
          familyError={fam.familyError}
          familyDropdownOpen={fam.familyDropdownOpen}
          selfDropdownOpen={fam.selfDropdownOpen}
          setFamilyDropdownOpen={fam.setFamilyDropdownOpen}
          setSelfDropdownOpen={fam.setSelfDropdownOpen}
          familyDropdownRef={fam.familyDropdownRef}
          selfDropdownRef={fam.selfDropdownRef}
          activeFamilyId={fam.activeFamilyId}
          selectedChildLabel={fam.selectedChildLabel}
          selectedSelfLabel={fam.selectedSelfLabel}
          handleSelectFamilyMember={fam.handleSelectFamilyMember}
          handleAddSibling={fam.handleAddSibling}
        /> */}

        <CustomerFamilySection
          mode={p.mode}
          childFamilyMembers={fam.childFamilyMembers}
          selfFamilyMembers={fam.selfFamilyMembers}
          familyLoading={fam.familyLoading}
          familyError={fam.familyError}
          familyDropdownOpen={fam.familyDropdownOpen}
          selfDropdownOpen={fam.selfDropdownOpen}
          setFamilyDropdownOpen={fam.setFamilyDropdownOpen}
          setSelfDropdownOpen={fam.setSelfDropdownOpen}
          familyDropdownRef={fam.familyDropdownRef}
          selfDropdownRef={fam.selfDropdownRef}
          activeFamilyId={fam.activeFamilyId}
          selectedChildLabel={fam.selectedChildLabel}
          selectedSelfLabel={fam.selectedSelfLabel}
          handleSelectFamilyMember={fam.handleSelectFamilyMember}
          handleAddSibling={fam.handleAddSibling}
          handleAddParent={fam.handleAddParent}
        />

        <div className="form-columns mb-3">
          <CustomerChildFieldset
            form={f.form}
            up={f.up}
            genderOpen={f.genderOpen}
            setGenderOpen={f.setGenderOpen}
            genderDropdownRef={f.genderDropdownRef}
          />

          <CustomerParentFieldset
            form={f.form}
            up={f.up}
            mode={p.mode}
            saving={f.saving || f.newsletterBusy}
            newsletterBusy={f.newsletterBusy}
            setNewsletterBusy={f.setNewsletterBusy}
            setForm={f.setForm}
            setErr={f.setErr}
            salutationOpen={f.salutationOpen}
            setSalutationOpen={f.setSalutationOpen}
            salutationDropdownRef={f.salutationDropdownRef}
            mk={mk}
            statusLabel={statusLabel}
            fmtDE={f.fmtDE}
          />

          <CustomerAddressFieldset form={f.form} up={f.up} />
          <CustomerNotesFieldset form={f.form} up={f.up} />
        </div>

        <CustomerDialogFooter
          mode={p.mode}
          saving={f.saving}
          onClose={p.onClose}
          onCreate={() => f.create(p.onCreated)}
          onSave={() =>
            f.save(
              p.mode,
              fam.familyCreateMode,
              fam.baseCustomerId,
              p.onSaved,
              fam.reloadFamily,
            )
          }
        />

        <CustomerSubDialogs
          form={f.form}
          documentsOpen={f.documentsOpen}
          setDocumentsOpen={f.setDocumentsOpen}
          bookOpen={f.bookOpen}
          setBookOpen={f.setBookOpen}
          cancelOpen={f.cancelOpen}
          setCancelOpen={f.setCancelOpen}
          stornoOpen={f.stornoOpen}
          setStornoOpen={f.setStornoOpen}
          setForm={f.setForm}
        />
      </div>
    </div>
  );
}

// // // app/admin/customers/dialogs/CustomerDialog.tsx
// "use client";

// import React, { useMemo } from "react";
// import type { Customer } from "../types";
// import { statusLabel } from "./customerDialog/formatters";
// import { useCustomerForm } from "./customerDialog/hooks/useCustomerForm";
// import { useCustomerFamily } from "./customerDialog/hooks/useCustomerFamily";
// import { useCustomerOffers } from "./customerDialog/hooks/useCustomerOffers";
// import CustomerDialogHeader from "./customerDialog/components/CustomerDialogHeader";
// import CustomerFamilySection from "./customerDialog/components/CustomerFamilySection";
// import CustomerChildFieldset from "./customerDialog/components/CustomerChildFieldset";
// import CustomerParentFieldset from "./customerDialog/components/CustomerParentFieldset";
// import CustomerAddressFieldset from "./customerDialog/components/CustomerAddressFieldset";
// import CustomerNotesFieldset from "./customerDialog/components/CustomerNotesFieldset";
// import CustomerDialogFooter from "./customerDialog/components/CustomerDialogFooter";
// import CustomerSubDialogs from "./customerDialog/components/CustomerSubDialogs";

// type Props = {
//   mode: "create" | "edit";
//   customer?: Customer | null;
//   onClose: () => void;
//   onCreated?: () => void;
//   onSaved?: () => void;
//   onDeleted?: () => void;
// };

// export default function CustomerDialog(p: Props) {
//   void p.onDeleted;

//   const f = useCustomerForm(p.mode, p.customer);
//   const fam = useCustomerFamily(p.mode, p.customer, f.form, f.setForm);
//   const offers = useCustomerOffers(p.mode);

//   const mk = useMemo(() => {
//     const anyForm = f.form as any;
//     return {
//       provider: anyForm?.marketingProvider as string | undefined,
//       status: anyForm?.marketingStatus as string | undefined,
//       contactId: anyForm?.marketingContactId as string | undefined,
//       lastSyncedAt:
//         anyForm?.marketingLastSyncedAt ??
//         anyForm?.marketingSyncedAt ??
//         anyForm?.lastSyncedAt ??
//         null,
//       consentAt: anyForm?.marketingConsentAt as any,
//       lastError: anyForm?.marketingLastError as string | undefined,
//     };
//   }, [f.form]);

//   const isActive = !f.form?.canceledAt;

//   return (
//     <div className="ks-modal-root ks-customer-dialog">
//       <div className="ks-backdrop" onClick={p.onClose} />
//       <div
//         className="ks-panel card ks-panel--lg"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <CustomerDialogHeader
//           form={f.form}
//           mode={p.mode}
//           isActive={isActive}
//           familyCreateMode={fam.familyCreateMode}
//           setDocumentsOpen={f.setDocumentsOpen}
//           setBookOpen={f.setBookOpen}
//           setCancelOpen={f.setCancelOpen}
//           setStornoOpen={f.setStornoOpen}
//         />

//         {f.err && <div className="mb-2 text-red-600">{f.err}</div>}

//         <CustomerFamilySection
//           mode={p.mode}
//           familyMembers={fam.familyMembers}
//           familyLoading={fam.familyLoading}
//           familyError={fam.familyError}
//           familyDropdownOpen={fam.familyDropdownOpen}
//           setFamilyDropdownOpen={fam.setFamilyDropdownOpen}
//           familyDropdownRef={fam.familyDropdownRef}
//           activeFamilyId={fam.activeFamilyId}
//           selectedChildLabel={fam.selectedChildLabel}
//           handleSelectFamilyMember={fam.handleSelectFamilyMember}
//           handleAddSibling={fam.handleAddSibling}
//         />

//         <div className="form-columns mb-3">
//           <CustomerChildFieldset
//             form={f.form}
//             up={f.up}
//             genderOpen={f.genderOpen}
//             setGenderOpen={f.setGenderOpen}
//             genderDropdownRef={f.genderDropdownRef}
//           />

//           <CustomerParentFieldset
//             form={f.form}
//             up={f.up}
//             mode={p.mode}
//             // saving={f.saving}
//             saving={f.saving || f.newsletterBusy}
//             newsletterBusy={f.newsletterBusy}
//             setNewsletterBusy={f.setNewsletterBusy}
//             setForm={f.setForm}
//             setErr={f.setErr}
//             salutationOpen={f.salutationOpen}
//             setSalutationOpen={f.setSalutationOpen}
//             salutationDropdownRef={f.salutationDropdownRef}
//             mk={mk}
//             statusLabel={statusLabel}
//             fmtDE={f.fmtDE}
//           />

//           <CustomerAddressFieldset form={f.form} up={f.up} />

//           <CustomerNotesFieldset form={f.form} up={f.up} />
//         </div>

//         <CustomerDialogFooter
//           mode={p.mode}
//           saving={f.saving}
//           onClose={p.onClose}
//           onCreate={() => f.create(p.onCreated)}
//           onSave={() =>
//             f.save(
//               p.mode,
//               fam.familyCreateMode,
//               fam.baseCustomerId,
//               p.onSaved,
//               fam.reloadFamily,
//             )
//           }
//         />

//         <CustomerSubDialogs
//           form={f.form}
//           documentsOpen={f.documentsOpen}
//           setDocumentsOpen={f.setDocumentsOpen}
//           bookOpen={f.bookOpen}
//           setBookOpen={f.setBookOpen}
//           cancelOpen={f.cancelOpen}
//           setCancelOpen={f.setCancelOpen}
//           stornoOpen={f.stornoOpen}
//           setStornoOpen={f.setStornoOpen}
//           setForm={f.setForm}
//         />
//       </div>
//     </div>
//   );
// }
