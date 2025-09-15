// src/app/admin/customers/lib/courseOptions.ts



export type CourseOption =
  | { mode: 'type'; value: string; label: string }
  | {
      mode: 'subtype';
      value: string;
      label: string;
      category: 'Weekly' | 'Individual' | 'Holiday' | 'ClubPrograms' | 'RentACoach';
    };

/** Nice, sectioned catalogue used by all dialogs */
const GROUPS: Array<{ label: string; items: CourseOption[] }> = [
  {
    label: 'Holiday Programs',
    items: [
      { mode: 'type', value: 'Camp', label: 'Camps (Indoor/Outdoor)' },
      { mode: 'subtype', category: 'Holiday', value: 'Powertraining', label: 'Power Training' },
    ],
  },
  {
    label: 'Weekly Courses',
    items: [
      { mode: 'type', value: 'Foerdertraining', label: 'Foerdertraining' },
      { mode: 'type', value: 'Kindergarten', label: 'Soccer Kindergarten' },
      { mode: 'subtype', category: 'Weekly', value: 'Torwarttraining', label: 'Goalkeeper Training' },
      {
        mode: 'subtype',
        category: 'Weekly',
        value: 'Foerdertraining_Athletik',
        label: 'Development Training • Athletik',
      },
    ],
  },
  {
    label: 'Individual Courses',
    items: [
      { mode: 'type', value: 'PersonalTraining', label: '1:1 Training' },
      {
        mode: 'subtype',
        category: 'Individual',
        value: 'Einzeltraining_Athletik',
        label: '1:1 Training Athletik',
      },
      {
        mode: 'subtype',
        category: 'Individual',
        value: 'Einzeltraining_Torwart',
        label: '1:1 Training Torwart',
      },
    ],
  },
  {
    label: 'Club Programs',
    items: [
      { mode: 'subtype', category: 'RentACoach', value: 'RentACoach_Generic', label: 'Rent-a-Coach' },
      { mode: 'subtype', category: 'ClubPrograms', value: 'ClubProgram_Generic', label: 'Training Camps' },
      { mode: 'subtype', category: 'ClubPrograms', value: 'CoachEducation', label: 'Coach Education' },
    ],
  },
];

export const GROUPED_COURSE_OPTIONS = GROUPS;
export const ALL_COURSE_OPTIONS: CourseOption[] = GROUPS.flatMap((g) => g.items);

/** Check if an offer matches the selected course (type or sub_type). Empty => match all. */
export function offerMatchesCourse(selectedValue: string, offer: any): boolean {
  if (!selectedValue) return true;
  const t = String(offer?.type ?? '');
  const st = String(offer?.sub_type ?? '');
  return t === selectedValue || st === selectedValue;
}

/** Map a booking to its course value by looking up the linked offer. */
export function courseValueFromBooking(booking: any, offersById: Map<string, any>): string {
  const oid = String(booking?.offerId ?? '');
  const offer = oid ? offersById.get(oid) : null;
  if (!offer) return '';
  const st = String(offer?.sub_type ?? '');
  if (st) return st;
  const t = String(offer?.type ?? '');
  return t || '';
}





