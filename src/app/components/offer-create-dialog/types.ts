//src\app\components\offer-create-dialog\types.ts
import type { Place } from "@/types/place";

export type OfferType =
  | "Camp"
  | "Foerdertraining"
  | "Kindergarten"
  | "PersonalTraining"
  | "AthleticTraining";

export type CategoryKey =
  | "Holiday"
  | "Weekly"
  | "Individual"
  | "ClubPrograms"
  | "RentACoach";

export type CourseOption = {
  label: string;
  value: string;
  type: OfferType;
  category: CategoryKey;
  sub_type?: string;
};

export type CreateOfferPayload = {
  type: OfferType | "";
  category?: CategoryKey | "";
  sub_type?: string;

  placeId?: string;
  location: string;

  price: number | "";
  timeFrom: string;
  timeTo: string;
  ageFrom: number | "";
  ageTo: number | "";
  info: string;
  onlineActive: boolean;

  coachName: string;
  coachEmail: string;
  coachImage: string;

  holidayWeekLabel?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type OfferDialogMode = "create" | "edit";

export type OfferDialogInitial =
  | (Partial<CreateOfferPayload> & { _id?: string })
  | null;

export type PlacesState = {
  places: Place[];
  selectedPlace: Place | null;
};
