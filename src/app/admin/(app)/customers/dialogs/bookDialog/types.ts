//src\app\admin\(app)\customers\dialogs\bookDialog\types.ts
export type Tab = "customers" | "newsletter" | "all";
export type NewsletterFilter = "all" | "true" | "false";

export type FamilyChild = {
  uid: string;
  firstName: string;
  lastName: string;
  birthDate: string | null;
};

export type FamilyParent = {
  salutation: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  phone2?: string;
};

export type FamilyMember = {
  _id: string;
  userId: number | null;
  parent: FamilyParent;
  parents?: FamilyParent[];
  child: FamilyChild | null;
  children: FamilyChild[];
};

export type FamilyResponse = {
  ok?: boolean;
  baseCustomerId?: string;
  members?: FamilyMember[];
  error?: string;
};

// export type Tab = "customers" | "newsletter" | "all";
// export type NewsletterFilter = "all" | "true" | "false";

// export type FamilyChild = {
//   firstName: string;
//   lastName: string;
//   birthDate: string | null;
// };

// export type FamilyParent = {
//   salutation: string;
//   firstName: string;
//   lastName: string;
//   email: string;
// };

// export type FamilyMember = {
//   _id: string;
//   userId: number | null;
//   parent: FamilyParent;
//   child: FamilyChild | null;
//   children: FamilyChild[];
// };

// export type FamilyResponse = {
//   ok?: boolean;
//   baseCustomerId?: string;
//   members?: FamilyMember[];
//   error?: string;
// };
