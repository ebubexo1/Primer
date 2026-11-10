// Built-in copy of supabase/schema.sql seed rows. Used when no real database is configured,
// so the app is fully usable offline / on a fresh clone.
export type Deck = { id: string; title: string; creator: string };
export type Card = {
  id: string; deck_id: string; position: number; title: string;
  image_url: string | null; audio_url: string | null; transcript: string;
  tags: string[]; version: number;
};
export type Link = {
  id: number; from_card: string; from_start: number; from_end: number;
  to_card: string; to_start: number; to_version: number; label: string | null;
};

export const decks: Deck[] = [
  { id: 'algebra', title: 'Algebra basics', creator: 'seed' },
  { id: 'weimar', title: 'Weimar Republic', creator: 'seed' },
  { id: 'inflation', title: 'Inflation', creator: 'seed' },
];

export const cards: Card[] = [
  {
    id: 'undo-ops', deck_id: 'algebra', position: 0, title: 'Undoing an operation', image_url: null, audio_url: null,
    transcript: 'To get x alone, undo what was done to it. If five was added, subtract five from both sides. Adding again only makes the equation bigger. Always do the same thing to both sides.',
    tags: ['wrong-inverse', 'one-side'], version: 1,
  },
  {
    id: 'divide-coef', deck_id: 'algebra', position: 1, title: 'Dividing by the coefficient', image_url: null, audio_url: null,
    transcript: 'When x is multiplied by a number, divide both sides by that number. Multiplying again moves you further away. Subtracting the coefficient does nothing useful.',
    tags: ['sub-coefficient', 'wrong-inverse'], version: 1,
  },
  {
    id: 'weimar-crash', deck_id: 'weimar', position: 2, title: 'The 1929 crash and 1933', image_url: null, audio_url: null,
    transcript: 'The Weimar Republic was already fragile. Hyperinflation in 1923 had wiped out savings. Then the 1929 crash ended foreign loans, unemployment rose, and by 1933 the republic collapsed.',
    tags: ['history'], version: 1,
  },
  {
    id: 'inflation-1', deck_id: 'inflation', position: 3, title: 'What is inflation', image_url: null, audio_url: null,
    transcript: 'Inflation means prices rise, so each unit of money buys less. In 1923 Germany printed money to pay debts and prices doubled within days. Savings became worthless.',
    tags: ['economics'], version: 1,
  },
];

export const links: Link[] = [
  { id: 1, from_card: 'weimar-crash', from_start: 70, from_end: 125, to_card: 'inflation-1', to_start: 0, to_version: 1, label: 'Inflation explained' },
];
