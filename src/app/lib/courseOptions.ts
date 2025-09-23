// src/app/admin/customers/lib/courseOptions.ts

export type CourseOption =
  | { mode: 'type'; value: string; label: string }
  | {
      mode: 'subtype';
      value: string;
      label: string;
      category: 'Weekly' | 'Individual' | 'Holiday' | 'ClubPrograms' | 'RentACoach';
    };

/** Katalog (UI) */
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

/* ====================== Matching-Logik ====================== */

type OfferLike = {
  _id: string;
  type?: string;
  sub_type?: string;
  category?: string;
  title?: string;
  location?: string;
};

const lc = (s?: string) => String(s ?? '').toLowerCase();

const isWeekly = (o: OfferLike) =>
  o?.category === 'Weekly' || o?.type === 'Foerdertraining' || o?.type === 'Kindergarten';

const isHoliday = (o: OfferLike) => o?.category === 'Holiday' || o?.type === 'Camp';

const isClubPrograms = (o: OfferLike) => lc(o?.category) === 'clubprograms';



const isRentACoach = (o: OfferLike) => {
  const st = lc(o?.sub_type);
  const cat = lc(o?.category);
  const title = lc(o?.title);
  // Strict: explicit subtype or category
  if (st === 'rentacoach_generic') return true;
  if (cat === 'rentacoach') return true;
  // last resort: exact phrase in title (keeps noise low)
  return /\brent\s*a\s*coach\b/.test(title);
};

const isCoachEducation = (o: OfferLike) => {
  const st = lc(o?.sub_type);
  const cat = lc(o?.category);
  const title = lc(o?.title);
  // Strict: explicit subtype, or clearly tagged under ClubPrograms
  if (st === 'coacheducation') return true;
  if (cat === 'clubprograms' && /\bcoach\s*education\b/.test(title)) return true;
  return false;
};


const isPlainFoerdertraining = (o: OfferLike) =>
  o?.type === 'Foerdertraining' && !/torwart|keeper|athletik|athletic/i.test(o?.sub_type || '');

const isPlainPersonalTraining = (o: OfferLike) =>
  o?.type === 'PersonalTraining' && !o?.sub_type;

/** Hilfsfunktion: Option-Metadaten zur ausgewählten value finden */
function findOptionByValue(value: string): CourseOption | undefined {
  return ALL_COURSE_OPTIONS.find((opt) => opt.value === value);
}

/**
 * Striktes Matching pro Auswahl:
 * - Holiday/Camps: nur echte Holiday/Camp-Angebote, KEINE ClubPrograms
 * - Weekly/Fördertraining: nur “plain” Foerdertraining (ohne Torwart/Athletik), KEINE RentACoach/CoachEducation
 * - Weekly/Kindergarten: nur Kindergarten
 * - Individual/PersonalTraining: nur “plain” PersonalTraining (ohne Einzeltraining_* Subtypes)
 * - Subtype-Optionen matchen exakt ihren Subtype + passende Kategorie
 * - ClubPrograms/RentACoach/CoachEducation sauber getrennt
 * - Leere Auswahl zeigt alles
 */
export function offerMatchesCourse(selectedValue: string, offer: OfferLike): boolean {
  if (!selectedValue) return true;

  const opt = findOptionByValue(selectedValue);
  const t = String(offer?.type || '');
  const st = String(offer?.sub_type || '');

  // Falls Option unbekannt ist: Fallback auf dein altes Gleichheits-Matching
  if (!opt) return t === selectedValue || st === selectedValue;



  // ...
if (opt.mode === 'type') {
  switch (opt.value) {
    case 'Camp':
      // Nur echte Camps ohne Subtype (Powertraining raus) und keine ClubPrograms
      return isHoliday(offer) && !isClubPrograms(offer) && !offer.sub_type;

    case 'Foerdertraining':
      return isWeekly(offer) && isPlainFoerdertraining(offer) && !isRentACoach(offer) && !isCoachEducation(offer);

    case 'Kindergarten':
      return isWeekly(offer) && offer.type === 'Kindergarten';

    case 'PersonalTraining':
      return isPlainPersonalTraining(offer);

    default:
      return offer.type === opt.value;
  }
}
// ...


  // mode === 'subtype'
  const want = opt.value;
  switch (opt.category) {
    case 'Weekly':
      return isWeekly(offer) && st === want;

    case 'Holiday':
      return isHoliday(offer) && st === want;

    case 'Individual':
      return lc(t) === 'personaltraining' && st === want;

    case 'ClubPrograms':
      return isClubPrograms(offer) && st === want;

    case 'RentACoach':
      return isRentACoach(offer);

    default:
      // Fallback: exakter Subtype
      return st === want;
  }
}



/** Wie vorher: Wert für Kurs-Dropdown aus einer Buchung ableiten */
export function courseValueFromBooking(booking: any, offersById: Map<string, any>): string {
  const oid = String(booking?.offerId ?? '');
  const offer = oid ? offersById.get(oid) : null;
  if (!offer) return '';
  const st = String(offer?.sub_type ?? '');
  if (st) return st;
  const t = String(offer?.type ?? '');
  return t || '';
}















