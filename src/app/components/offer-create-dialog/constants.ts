//src\app\components\offer-create-dialog\constants.ts
import type { CategoryKey, CourseOption } from "./types";

export const COURSES: CourseOption[] = [
  {
    label: "Camps (Indoor/Outdoor)",
    value: "camp",
    type: "Camp",
    category: "Holiday",
  },
  {
    label: "Power Training",
    value: "powertraining",
    type: "AthleticTraining",
    category: "Holiday",
    sub_type: "Powertraining",
  },

  {
    label: "Foerdertraining",
    value: "foerdertraining",
    type: "Foerdertraining",
    category: "Weekly",
  },
  {
    label: "Soccer Kindergarten",
    value: "kindergarten",
    type: "Kindergarten",
    category: "Weekly",
  },
  {
    label: "Goalkeeper Training",
    value: "torwarttraining",
    type: "Foerdertraining",
    category: "Weekly",
    sub_type: "Torwarttraining",
  },
  {
    label: "Development Training · Athletik",
    value: "foerder_athletik",
    type: "Foerdertraining",
    category: "Weekly",
    sub_type: "Foerdertraining_Athletik",
  },

  {
    label: "1:1 Training",
    value: "personal",
    type: "PersonalTraining",
    category: "Individual",
  },
  {
    label: "1:1 Training Athletik",
    value: "personal_athletik",
    type: "PersonalTraining",
    category: "Individual",
    sub_type: "Einzeltraining_Athletik",
  },
  {
    label: "1:1 Training Torwart",
    value: "personal_torwart",
    type: "PersonalTraining",
    category: "Individual",
    sub_type: "Einzeltraining_Torwart",
  },

  {
    label: "Training Camps",
    value: "club_program",
    type: "Camp",
    category: "ClubPrograms",
    sub_type: "ClubProgram_Generic",
  },
  {
    label: "Coach Education",
    value: "coach_education",
    type: "Foerdertraining",
    category: "ClubPrograms",
    sub_type: "CoachEducation",
  },

  {
    label: "Rent-a-Coach",
    value: "rent_a_coach",
    type: "Foerdertraining",
    category: "RentACoach",
    sub_type: "RentACoach_Generic",
  },
];

export const CATEGORY_LABEL: Record<CategoryKey, string> = {
  Holiday: "Holiday",
  Weekly: "Weekly",
  Individual: "Individual",
  ClubPrograms: "ClubPrograms",
  RentACoach: "RentACoach",
};

export const CATEGORY_ORDER: CategoryKey[] = [
  "Holiday",
  "Weekly",
  "Individual",
  "ClubPrograms",
  "RentACoach",
];

export const HOLIDAY_WEEK_PRESETS = [
  "Osterferien",
  "Pfingstferien",
  "Sommerferien",
  "Herbstferien",
  "Weihnachtsferien",
] as const;
