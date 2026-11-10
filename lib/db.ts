import { Pool } from 'pg';
// DATABASE_URL points at the connection pooler (pgbouncer / Supabase Supavisor). Keep the per-instance pool small.
const g = globalThis as any;
const url = process.env.DATABASE_URL || '';
// .env.example placeholders (REGION / PROJECTREF / changeme) mean "not configured": use the built-in seed data
// instead of dialing a host that does not exist and failing every request.
export const dbConfigured = !!url && !/REGION|PROJECTREF|changeme/i.test(url);
export const pool: Pool = g.__pool ||= new Pool({
  connectionString: url,
  max: 5,
  ssl: url.includes('supabase.com') ? { rejectUnauthorized: false } : undefined,
});
