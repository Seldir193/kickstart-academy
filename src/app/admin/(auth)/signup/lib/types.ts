export type SignupForm = {
  confirm: string;
  email: string;
  fullName: string;
  password: string;
  terms: boolean;
};

export type SignupErrors = Partial<Record<keyof SignupForm, string>>;

export type SignupStatus = "idle" | "sending" | "done";
