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
  // Neon serverless: one statement per query
  await client`
    create table if not exists reports (
      id text primary key,
      type text not null check (type in ('power','water')),
      city text not null,
      subcity text,
      neighborhood text,
      note text,
      contact text,

      created_at timestamptz not null
    )
  `;
  await client`create index if not exists reports_created_idx on reports(created_at desc)`;

}


