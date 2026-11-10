import { pool, dbConfigured } from './db';
import { decks, cards, links } from './seed';

type Ev = { cid: string; pid?: string; step?: number; optionId?: string; misc?: string | null; correct?: boolean };
type Rec = { id: string; title: string; misconception: string };

const g = globalThis as any;
const localEvents: any[] = g.__events ||= [];   // survives hot reload in dev
let dbDown = false;                             // one failed query flips the process to seed data for good
let warned = false;
const local = () => !dbConfigured || dbDown;

// Try Postgres, but never turn a broken connection string into a 500 the UI cannot use.
async function guard<T>(fn: () => Promise<T>, fallback: () => T): Promise<T> {
  if (local()) return fallback();
  try { return await fn(); }
  catch (e: any) {
    dbDown = true;
    if (!warned) { warned = true; console.warn(`[primer] database unavailable (${e.message}); serving built-in seed data`); }
    return fallback();
  }
}

const localDecks = () => decks
  .map((d) => ({ id: d.id, title: d.title,
    cards: cards.filter((c) => c.deck_id === d.id).sort((a, b) => a.position - b.position).map((c) => ({ id: c.id, title: c.title })) }))
  .sort((a, b) => a.title.localeCompare(b.title));

export function listDecks() {
  return guard(async () => {
    const { rows } = await pool.query(
      `select d.id, d.title, coalesce(json_agg(json_build_object('id',c.id,'title',c.title) order by c.position) filter (where c.id is not null),'[]') as cards
       from decks d left join cards c on c.deck_id=d.id group by d.id order by d.title`);
    return rows;
  }, localDecks);
}

const localCard = (id: string) => {
  const card = cards.find((c) => c.id === id);
  if (!card) return null;
  const title = (cid: string) => cards.find((c) => c.id === cid)?.title;
  return {
    card,
    links: links.filter((l) => l.from_card === id)
      .map((l) => { const t = cards.find((c) => c.id === l.to_card);
        return { id: l.id, from_start: l.from_start, from_end: l.from_end, to_card: l.to_card, to_start: l.to_start,
          label: l.label, stale: !!t && t.version !== l.to_version, to_title: t?.title }; })
      .sort((a, b) => a.from_start - b.from_start),
    backlinks: links.filter((l) => l.to_card === id).map((l) => ({ id: l.from_card, title: title(l.from_card), pos: l.from_start })),
  };
};

export function getCard(id: string) {
  return guard(async () => {
    const c = await pool.query('select * from cards where id=$1', [id]);
    if (!c.rows[0]) return null;
    const out = await pool.query(
      `select l.id,l.from_start,l.from_end,l.to_card,l.to_start,l.label,(t.version<>l.to_version) as stale, t.title as to_title
       from card_links l join cards t on t.id=l.to_card where l.from_card=$1 order by l.from_start`, [id]);
    const back = await pool.query(
      `select l.from_card as id, f.title, l.from_start as pos from card_links l join cards f on f.id=l.from_card where l.to_card=$1`, [id]);
    return { card: c.rows[0], links: out.rows, backlinks: back.rows };
  }, () => localCard(id));
}

const localRecs = (anonId: string): Rec[] => {
  const n = new Map<string, number>();
  for (const e of localEvents) if (e.anon_id === anonId && e.misconception) n.set(e.misconception, (n.get(e.misconception) || 0) + 1);
  const top = [...n.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([m]) => m);   // 3 most frequent misconceptions
  const seen = new Set<string>(); const recs: Rec[] = [];
  for (const m of top) for (const c of cards) if (c.tags.includes(m) && !seen.has(c.id)) { seen.add(c.id); recs.push({ id: c.id, title: c.title, misconception: m }); }
  return recs.slice(0, 6);
};

const localRecord = (anonId: string, batch: Ev[]): Rec[] => {
  const have = new Set(localEvents.filter((e) => e.anon_id === anonId).map((e) => e.client_id));
  for (const e of batch) if (!have.has(e.cid)) {
    have.add(e.cid);
    localEvents.push({ anon_id: anonId, client_id: e.cid, problem_id: e.pid?.split(':')[0], step: e.step,
      option_id: e.optionId, misconception: e.misc ?? null, correct: e.correct });
  }
  return localRecs(anonId);
};

export function recordEvents(anonId: string, batch: Ev[]) {
  return guard(async () => {
    for (const e of batch) {
      await pool.query(
        `insert into learning_events (anon_id,client_id,assign_id,problem_id,step,option_id,misconception,correct)
         values ($1,$2,$3,$4,$5,$6,$7,$8) on conflict do nothing`,
        [anonId, e.cid, e.pid?.split(':')[0], e.pid, e.step, e.optionId, e.misc ?? null, e.correct]);
    }
    // Recommend Deck cards whose tags match this learner's most frequent misconceptions.
    const recs = await pool.query(
      `with m as (select misconception, count(*) n from learning_events where anon_id=$1 and misconception is not null
                  group by misconception order by n desc limit 3)
       select distinct c.id, c.title, m.misconception from m join cards c on m.misconception = any(c.tags) limit 6`, [anonId]);
    return recs.rows as Rec[];
  }, () => localRecord(anonId, batch));
}

export const mode = () => (local() ? 'local' : 'postgres');
