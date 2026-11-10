import { pool } from '@/lib/db';
import { mode } from '@/lib/repo';
export async function GET() {
  const m = mode();
  if (m === 'local') return Response.json({ ok: true, mode: m, db: false });
  try { await pool.query('select 1'); return Response.json({ ok: true, mode: m, db: true, pid: process.pid }); }
  catch (e: any) { return Response.json({ ok: true, mode: m, db: false, error: e.message }, { status: 503 }); }
}
