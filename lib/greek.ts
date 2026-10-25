// Greek titles shown next to the rank letters.
// This is display only: the database still uses E, D, C ... Monarch.

const GREEK_TITLES: Record<string, string> = {
  E: "Mortal",
  D: "Acolyte",
  C: "Athlete",
  B: "Hoplite",
  A: "Champion",
  S: "Hero",
  SS: "Demigod",
  SSS: "Titan",
  Monarch: "Olympian",
};

export function greekTitle(rankName: string): string {
  return GREEK_TITLES[rankName] ?? rankName;
}