import { recordEvents } from '@/lib/repo';
import { rateLimit } from '@/lib/redis';
// Idempotent: (anon_id, client_id) is unique, so retrying a sync never double counts.
export async function POST(req: Request) {
  const { anonId, events } = await req.json();
  if (!anonId || !Array.isArray(events)) return Response.json({ error: 'bad body' }, { status: 400 });
  if (!(await rateLimit(`sync:${anonId}`, 30, 60))) return Response.json({ error: 'slow down' }, { status: 429 });
  const batch = events.slice(0, 500);
  const recs = await recordEvents(anonId, batch);
  return Response.json({ ok: true, synced: batch.length, recs });
}
