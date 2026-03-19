export type ContractParent = {
  salutation: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  mobile: string;
};

export type ContractAddress = {
  street: string;
  houseNo: string;
  zip: string;
  city: string;
};

export type ContractChild = {
  firstName: string;
  lastName: string;
  birthDate: string;
};

export type ContractConsents = {
  acceptAgb: boolean;
  acceptPrivacy: boolean;
  consentPhotoVideo: boolean;
};

export type ContractDraft = {
  parent: ContractParent;
  address: ContractAddress;
  child: ContractChild;
  consents: ContractConsents;
  signatureName: string;
};

export type ContractInitOk = {
  ok: true;
  bookingId: string;
  offerTitle: string;
  location: string;
  startDate: string;
  dayLabel: string;
  timeLabel: string;
  parent: Partial<ContractParent>;
  address: Partial<ContractAddress>;
  child: Partial<ContractChild>;
};

export type ContractInitErr = { ok: false; code?: string };

export type ContractSubmitOk = {
  ok: true;
  url: string;
  sessionId: string;
  contractSignedAt: string;
};

export type ContractSubmitErr = {
  ok: false;
  code?: string;
  errors?: Record<string, string>;
};
