export type Offer = {
  _id: string;
  title?: string;
  type?: string;
  sub_type?: string;
  location?: string;
  price?: number;
  days?: string[];
  timeFrom?: string;
  timeTo?: string;
  ageFrom?: number;
  ageTo?: number;
  info?: string;
  category?: string;

  coachName?: string;
  coachFirst?: string;
  coachLast?: string;
  coach?: string;
  coachImage?: string;
  coachPhoto?: string;
  coachAvatar?: string;
  coachPic?: string;
  coachImg?: string;
  coachEmail?: string;
  email?: string;
  contactEmail?: string;

  holidayWeekLabel?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type Gender = "weiblich" | "männlich" | "";

export type FormState = {
  offerId: string;
  childFirst: string;
  childLast: string;
  childGender: Gender;
  birthDay: string;
  birthMonth: string;
  birthYear: string;
  salutation: "Frau" | "Herr" | "";
  parentFirst: string;
  parentLast: string;
  street: string;
  houseNo: string;
  zip: string;
  city: string;
  phone: string;
  phone2: string;
  email: string;
  voucher: string;
  source: string;
  accept: boolean;
  level: "U8" | "U10" | "U12" | "U14" | "U16" | "U18";
  date: string;
  message: string;

  tshirtSize: string;
  goalkeeper: "yes" | "no" | "";

  siblingEnabled: boolean;
  siblingFirst: string;
  siblingLast: string;
  siblingGender: Gender;
  siblingBirthDay: string;
  siblingBirthMonth: string;
  siblingBirthYear: string;
  siblingTshirtSize: string;
  siblingGoalkeeper: "yes" | "no" | "";
};

export const initialForm: FormState = {
  offerId: "",
  childFirst: "",
  childLast: "",
  childGender: "",
  birthDay: "",
  birthMonth: "",
  birthYear: "",
  salutation: "",
  parentFirst: "",
  parentLast: "",
  street: "",
  houseNo: "",
  zip: "",
  city: "",
  phone: "",
  phone2: "",
  email: "",
  voucher: "",
  source: "",
  accept: false,
  level: "U10",
  date: "",
  message: "",
  tshirtSize: "",
  goalkeeper: "",
  siblingEnabled: false,
  siblingFirst: "",
  siblingLast: "",
  siblingGender: "",
  siblingBirthDay: "",
  siblingBirthMonth: "",
  siblingBirthYear: "",
  siblingTshirtSize: "",
  siblingGoalkeeper: "",
};

export type PtMetaItem = {
  id?: string;
  day?: string;
  dateFrom?: string;
  dateTo?: string;
  timeFrom?: string;
  timeTo?: string;
  price?: number;
};

export type TShirtOption = {
  value: string;
  labelKey: string;
};

export const TSHIRT_OPTIONS: TShirtOption[] = [
  {
    value: "player_xxs_116",
    labelKey: "tshirt.playerXXS116",
  },
  {
    value: "player_xs_128",
    labelKey: "tshirt.playerXS128",
  },
  {
    value: "player_s_140",
    labelKey: "tshirt.playerS140",
  },
  {
    value: "player_m_152",
    labelKey: "tshirt.playerM152",
  },
  {
    value: "player_l_164",
    labelKey: "tshirt.playerL164",
  },
  {
    value: "player_xl_174",
    labelKey: "tshirt.playerXL174",
  },
  {
    value: "men_s",
    labelKey: "tshirt.menS",
  },
  {
    value: "goalkeeper_xs_128",
    labelKey: "tshirt.goalkeeperXS128",
  },
  {
    value: "goalkeeper_m_152",
    labelKey: "tshirt.goalkeeperM152",
  },
  {
    value: "goalkeeper_l_164",
    labelKey: "tshirt.goalkeeperL164",
  },
  {
    value: "goalkeeper_xl_174",
    labelKey: "tshirt.goalkeeperXL174",
  },
];

// // app/book/bookTypes.ts

// export type Offer = {
//   _id: string;
//   title?: string;
//   type?: string;
//   sub_type?: string;
//   location?: string;
//   price?: number;
//   days?: string[];
//   timeFrom?: string;
//   timeTo?: string;
//   ageFrom?: number;
//   ageTo?: number;
//   info?: string;
//   category?: string;

//   coachName?: string;
//   coachFirst?: string;
//   coachLast?: string;
//   coach?: string;
//   coachImage?: string;
//   coachPhoto?: string;
//   coachAvatar?: string;
//   coachPic?: string;
//   coachImg?: string;
//   coachEmail?: string;
//   email?: string;
//   contactEmail?: string;

//   holidayWeekLabel?: string;
//   dateFrom?: string;
//   dateTo?: string;
// };

// export type Gender = 'weiblich' | 'männlich' | '';

// export type FormState = {
//   offerId: string;
//   childFirst: string;
//   childLast: string;
//   childGender: Gender;
//   birthDay: string;
//   birthMonth: string;
//   birthYear: string;
//   salutation: 'Frau' | 'Herr' | '';
//   parentFirst: string;
//   parentLast: string;
//   street: string;
//   houseNo: string;
//   zip: string;
//   city: string;
//   phone: string;
//   phone2: string;
//   email: string;
//   voucher: string;
//   source: string;
//   accept: boolean;
//   level: 'U8' | 'U10' | 'U12' | 'U14' | 'U16' | 'U18';
//   date: string;
//   message: string;

//   tshirtSize: string;
//   goalkeeper: 'yes' | 'no' | '';

//   siblingEnabled: boolean;
//   siblingFirst: string;
//   siblingLast: string;
//   siblingGender: Gender;
//   siblingBirthDay: string;
//   siblingBirthMonth: string;
//   siblingBirthYear: string;
//   siblingTshirtSize: string;
//   siblingGoalkeeper: 'yes' | 'no' | '';
// };

// export const initialForm: FormState = {
//   offerId: '',
//   childFirst: '',
//   childLast: '',
//   childGender: '',
//   birthDay: '',
//   birthMonth: '',
//   birthYear: '',
//   salutation: '',
//   parentFirst: '',
//   parentLast: '',
//   street: '',
//   houseNo: '',
//   zip: '',
//   city: '',
//   phone: '',
//   phone2: '',
//   email: '',
//   voucher: '',
//   source: '',
//   accept: false,
//   level: 'U10',
//   date: '',
//   message: '',
//   tshirtSize: '',
//   goalkeeper: '',
//   siblingEnabled: false,
//   siblingFirst: '',
//   siblingLast: '',
//   siblingGender: '',
//   siblingBirthDay: '',
//   siblingBirthMonth: '',
//   siblingBirthYear: '',
//   siblingTshirtSize: '',
//   siblingGoalkeeper: '',
// };

// export type PtMetaItem = {
//   id?: string;
//   day?: string;
//   dateFrom?: string;
//   dateTo?: string;
//   timeFrom?: string;
//   timeTo?: string;
//   price?: number;
// };

// export const TSHIRT_OPTIONS: string[] = [
//   'Spielertrikot XXS (116)',
//   'Spielertrikot XS (128)',
//   'Spielertrikot S (140)',
//   'Spielertrikot M (152)',
//   'Spielertrikot L (164)',
//   'Spielertrikot XL (174)',
//   'Herren S',
//   'Torwarttrikot XS (128)',
//   'Torwarttrikot M (152)',
//   'Torwarttrikot L (164)',
//   'Torwarttrikot XL (174)',
// ];
