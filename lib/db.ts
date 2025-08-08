import { neon } from "@neondatabase/serverless";

type SqlClient = ReturnType<typeof neon>;

let sql: SqlClient | null = null;

export function getSql(): SqlClient | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (!sql) {
    sql = neon(url);
  }
  return sql;
}

export async function ensureTables() {
  const client = getSql();
  if (!client) return;
  await client`
    create table if not exists reports (
      id text primary key,
      type text not null check (type in ('power','water')),
      city text not null,
      subcity text,
      neighborhood text,
      note text,
      contact text,
      lat double precision,
      lng double precision,
      created_at timestamptz not null
    );
    create index if not exists reports_created_idx on reports(created_at desc);
    create index if not exists reports_geo_idx on reports(lat, lng);
  `;
}


