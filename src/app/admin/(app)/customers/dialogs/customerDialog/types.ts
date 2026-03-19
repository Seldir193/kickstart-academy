// // src/app/admin/(app)/customers/dialogs/customerDialog/types.ts

export type FamilyMember = {
  _id: string;
  userId: number | null;
  childNumber?: number | null;
  parent: {
    salutation?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  parents?: {
    salutation?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    phone2?: string;
  }[];
  child: {
    uid?: string;
    firstName?: string;
    lastName?: string;
    birthDate?: string | null;
  } | null;
  children: {
    uid?: string;
    firstName?: string;
    lastName?: string;
    birthDate?: string | null;
  }[];
};

export type FamilyApiResponse = {
  ok: boolean;
  baseCustomerId: string;
  members: FamilyMember[];
};

export type FamilyCreateMode = "none" | "newChild" | "newParent";
