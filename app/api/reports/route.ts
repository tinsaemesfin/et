import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ensureTables, getSql } from "@/lib/db";

// Very simple in-memory rate limiter per IP
const recentByIp = new Map<string, number>();
const RATE_MS = 30_000; // 30 seconds between submissions per IP

const ReportSchema = z.object({
  type: z.enum(["power", "water"]),
  city: z.string().min(2).max(64),
  subcity: z.string().max(64).optional().nullable(),
  neighborhood: z.string().max(64).optional().nullable(),
  note: z.string().max(280).optional().nullable(),
  // Ethiopian phone: 10 digits starting with 0
  contact: z
    .string()
    .regex(/^0\d{9}$/i, { message: "Phone must be 10 digits and start with 0" })
    .optional()
    .nullable(),
  lat: z.number().gte(-90).lte(90).optional().nullable(),
  lng: z.number().gte(-180).lte(180).optional().nullable(),
});

type Report = z.infer<typeof ReportSchema> & { id: string; createdAt: string };

// In-memory fallback storage for local dev if DB is not configured
const memoryStore: Report[] = [];

export async function GET() {
  const sql = getSql();
  if (sql) {
    await ensureTables();
    const rows = (await sql`select id, type, city, subcity, neighborhood, note, contact, lat, lng, created_at from reports order by created_at desc limit 100`) as Array<{
      id: string;
      type: "power" | "water";
      city: string;
      subcity: string | null;
      neighborhood: string | null;
      note: string | null;
      contact: string | null;
      lat: number | null;
      lng: number | null;
      created_at: string;
    }>;
    const list: Report[] = rows.map((r) => ({
      id: r.id,
      type: r.type,
      city: r.city,
      subcity: r.subcity ?? undefined,
      neighborhood: r.neighborhood ?? undefined,
      note: r.note ?? undefined,
      contact: r.contact ?? undefined,
      lat: r.lat ?? undefined,
      lng: r.lng ?? undefined,
      createdAt: new Date(r.created_at).toISOString(),
    }));
    return NextResponse.json({ ok: true, data: list });
  }

  // Fallback to memory
  const list: Report[] = memoryStore.slice(-100).reverse();
  return NextResponse.json({ ok: true, data: list });
}

export async function POST(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";

  const last = recentByIp.get(ip) || 0;
  const now = Date.now();
  if (now - last < RATE_MS) {
    return NextResponse.json(
      { ok: false, error: "Please wait a moment before submitting again." },
      { status: 429 }
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400 }
    );
  }

  const parsed = ReportSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }

  const item: Report = {
    ...parsed.data,
    id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date(now).toISOString(),
  };

  const sql = getSql();
  if (sql) {
    await ensureTables();
    await sql`
      insert into reports (id, type, city, subcity, neighborhood, note, contact, lat, lng, created_at)
      values (${item.id}, ${item.type}, ${item.city}, ${item.subcity ?? null}, ${item.neighborhood ?? null}, ${item.note ?? null}, ${item.contact ?? null}, ${item.lat ?? null}, ${item.lng ?? null}, ${item.createdAt}::timestamptz)
    `;
  } else {
    memoryStore.push(item);
  }

  recentByIp.set(ip, now);
  return NextResponse.json({ ok: true, data: item }, { status: 201 });
}


