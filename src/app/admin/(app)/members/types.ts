//src\app\admin\(app)\members\types.ts

export type Me = {
  id: string;
  isSuperAdmin: boolean;
  isOwner: boolean;
};

export type Member = {
  id: string;
  fullName: string;
  email: string;
  role: "provider" | "super";
  isOwner?: boolean;
};
