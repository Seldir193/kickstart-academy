export type LoginField = "email" | "password";

export type LoginErrors = {
  email?: string;
  password?: string;
};

export type LoginValues = {
  email: string;
  password: string;
};
