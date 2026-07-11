import type { ProgramOption, SortKey } from "./filtersBar.types";
import type { StatusOrAll } from "../../types";

export const weeklyOptions: ProgramOption[] = [
  ["weekly_foerdertraining", "weeklyFoerdertraining"],
  ["weekly_kindergarten", "weeklyKindergarten"],
  ["weekly_goalkeeper", "weeklyGoalkeeper"],
  ["weekly_development_athletik", "weeklyDevelopmentAthletik"],
];

export const individualOptions: ProgramOption[] = [
  ["ind_1to1", "individual1to1"],
  ["ind_1to1_athletik", "individual1to1Athletik"],
  ["ind_1to1_goalkeeper", "individual1to1Goalkeeper"],
];

export const clubOptions: ProgramOption[] = [
  ["club_rentacoach", "clubRentACoach"],
  ["club_trainingcamps", "clubTrainingCamps"],
  ["club_coacheducation", "clubCoachEducation"],
];

export const statusOptions: StatusOrAll[] = [
  "all",
  "pending",
  "processing",
  "confirmed",
  "cancelled",
  "deleted",
];

export const sortOptions: SortKey[] = ["newest", "oldest", "nameAsc", "nameDesc"];
