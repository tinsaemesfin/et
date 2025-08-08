"use client";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Input, Textarea, labelClasses } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Segmented } from "@/components/ui/Segmented";
import { ClockIcon, MapPinIcon, PhoneIcon, PowerIcon, WaterIcon, SendIcon } from "@/components/icons";


type OutageType = "power" | "water";
type Report = {
  id: string;
  type: OutageType;
  city: string;
  subcity?: string | null;
  neighborhood?: string | null;
  note?: string | null;
  contact?: string | null;
  lat?: number | null;
  lng?: number | null;
  createdAt: string;
};

type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: string };

export default function Home() {
  const [lang, setLang] = useState<"am" | "en">(() => {
    if (typeof navigator !== "undefined") {
      return navigator.language?.startsWith("am") ? "am" : "en";
    }
    return "en";
  });
  const t = useMemo(() => (lang === "am" ? am : en), [lang]);

  const [type, setType] = useState<OutageType>("power");
  const [city, setCity] = useState("");
  const [subcity, setSubcity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [note, setNote] = useState("");
  const [contact, setContact] = useState("");
  const [contactError, setContactError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<OutageType | "all">("all");

  async function fetchReports() {
    const res = await fetch(`/api/reports`);
    const json: ApiResponse<Report[]> = await res.json();
    if (json.ok) setReports(json.data);
  }

  useEffect(() => {
    fetchReports();
    const id = setInterval(fetchReports, 30_000);
    return () => clearInterval(id);
  }, []);

  async function submitReport(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      // client-side phone validation: Ethiopian format 0 followed by 9 digits
      if (contact && !/^0\d{9}$/.test(contact)) {
        setContactError(t.phoneError);
        setLoading(false);
        return;
      } else {
        setContactError(null);
      }

      const payload = { type, city, subcity, neighborhood, note, contact: contact || null };
      const res = await fetch(`/api/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json: ApiResponse<Report> = await res.json();
      if (json.ok) {
        setMessage(t.thanks);
        setCity("");
        setSubcity("");
        setNeighborhood("");
        setNote("");
        setContact("");

        fetchReports();
      } else {
        setMessage(json.error);
      }
    } catch {
      setMessage(t.error);
    } finally {
      setLoading(false);
    }
  }

  const filtered = reports.filter((r) => (filter === "all" ? true : r.type === filter));

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
            {t.heroTitle}
          </h2>
          <Segmented
            options={[
              { value: "am" as const, label: "አማ" },
              { value: "en" as const, label: "EN" },
            ]}
            value={lang}
            onChange={setLang}
            ariaLabel="Language selector"
          />
        </div>
        <p className="text-sm opacity-85 max-w-prose">{t.tagline}</p>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <Card><CardBody><div className="text-xs opacity-70">{t.statReports}</div><div className="text-lg font-semibold">{reports.length}</div></CardBody></Card>
          <Card><CardBody><div className="text-xs opacity-70">{t.statPower}</div><div className="text-lg font-semibold text-yellow-600 flex items-center gap-1"><PowerIcon className="w-4 h-4" />{reports.filter(r=>r.type==='power').length}</div></CardBody></Card>
          <Card><CardBody><div className="text-xs opacity-70">{t.statWater}</div><div className="text-lg font-semibold text-blue-600 flex items-center gap-1"><WaterIcon className="w-4 h-4" />{reports.filter(r=>r.type==='water').length}</div></CardBody></Card>
        </div>
      </div>

      {/* Form + Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">{t.reportOutage}</h3>
              <Segmented
                options={[
                  { value: "power" as const, label: (<span className="inline-flex items-center gap-1"><PowerIcon className="w-4 h-4" />{t.power}</span>) },
                  { value: "water" as const, label: (<span className="inline-flex items-center gap-1"><WaterIcon className="w-4 h-4" />{t.water}</span>) },
                ]}
                value={type}
                onChange={setType}
                ariaLabel={t.reportOutage}
              />
            </div>
            <form onSubmit={submitReport} className="grid grid-cols-1 gap-3">
              <div>
                <label className={labelClasses}>{t.city}</label>
                <div className="relative">
                  <MapPinIcon className="w-4 h-4 absolute left-2 top-2.5 opacity-50" />
                  <Input required value={city} onChange={(e)=>setCity(e.target.value)} placeholder={t.city} className="pl-8" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelClasses}>{t.subcity}</label>
                  <Input value={subcity} onChange={(e)=>setSubcity(e.target.value)} placeholder={t.subcity} />
                </div>
                <div>
                  <label className={labelClasses}>{t.neighborhood}</label>
                  <Input value={neighborhood} onChange={(e)=>setNeighborhood(e.target.value)} placeholder={t.neighborhood} />
                </div>
              </div>
              <div>
                <label className={labelClasses}>{t.phoneOptional}</label>
                <div className="relative">
                  <PhoneIcon className="w-4 h-4 absolute left-2 top-2.5 opacity-50" />
                  <Input value={contact} onChange={(e)=>setContact(e.target.value)} placeholder={t.phoneOptional} className="pl-8" />
                  {contactError && <p className="text-[11px] text-red-600 mt-1">{contactError}</p>}
                </div>
              </div>
              <div>
                <label className={labelClasses}>{t.note}</label>
                <Textarea value={note} onChange={(e)=>setNote(e.target.value)} placeholder={t.note} rows={4} />
              </div>
              <div>
                <Button type="submit" disabled={loading} leftIcon={<SendIcon className="w-4 h-4" />}>{loading ? t.submitting : t.submit}</Button>
                {message && <p className="text-[12px] mt-2 opacity-80">{message}</p>}
              </div>
            </form>
          </CardBody>
        </Card>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{t.recentReports}</h3>
            <div className="flex items-center gap-2">
              <Badge variant="neutral">{filtered.length} {t.total}</Badge>
              <Segmented
                options={[
                  { value: "all" as const, label: t.all },
                  { value: "power" as const, label: (<span className="inline-flex items-center gap-1"><PowerIcon className="w-4 h-4" />{t.power}</span>) },
                  { value: "water" as const, label: (<span className="inline-flex items-center gap-1"><WaterIcon className="w-4 h-4" />{t.water}</span>) },
                ]}
                value={filter}
                onChange={(v: "all" | OutageType)=>setFilter(v)}
                ariaLabel={t.recentReports}
              />
            </div>
          </div>
          <ul className="space-y-2">
            {filtered.length === 0 && (
              <li className="text-sm opacity-70">{t.noReports}</li>
            )}
            {filtered.map((r) => (
              <li key={r.id} className="rounded-xl border border-white/15 p-3 bg-black/30">
                <div className="flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-2">
                    {r.type === "power" ? (
                      <Badge variant="power"><PowerIcon className="w-3.5 h-3.5" /> {t.power}</Badge>
                    ) : (
                      <Badge variant="water"><WaterIcon className="w-3.5 h-3.5" /> {t.water}</Badge>
                    )}
                    <span className="text-sm"><span className="font-medium">{r.city}</span>{r.subcity ? `, ${r.subcity}` : ""}{r.neighborhood ? `, ${r.neighborhood}` : ""}</span>
                  </div>
                  <span className="text-xs opacity-70 inline-flex items-center gap-1"><ClockIcon className="w-3.5 h-3.5" />{new Date(r.createdAt).toLocaleString()}</span>
                </div>
                {r.note && <p className="text-sm mt-2">{r.note}</p>}
                {r.contact && <p className="text-xs opacity-70 mt-1">{t.contact}: {r.contact}</p>}
          </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

const en = {
  heroTitle: "Community outage reporting",
  tagline: "Report local power and water outages. Simple, fast, mobile-first.",
  statReports: "Reports",
  statPower: "Power",
  statWater: "Water",
  reportOutage: "Report an outage",
  power: "Power",
  water: "Water",
  city: "City",

  subcity: "Sub-city",
  neighborhood: "Neighborhood",
  phoneOptional: "Phone (optional)",
  note: "Note (what happened, since when)",
  submitting: "Submitting...",
  submit: "Submit report",
  thanks: "Thank you! Your report is recorded.",
  error: "Something went wrong",
  recentReports: "Recent reports",
  all: "All",
  noReports: "No reports yet",
  contact: "Contact",
  total: "total",
  phoneError: "Phone must be 10 digits and start with 0",
};

const am = {
  heroTitle: "የማቋረጥ ሪፖርት በማኅበረሰብ",
  tagline: "በከተማዎ ያለውን የመብራት እና የውሃ ማቋረጥ ያመልክቱ። ቀላል፣ ፈጣን፣ በሞባይል የተቀናጀ።",
  statReports: "ሪፖርቶች",
  statPower: "መብራት",
  statWater: "ውሃ",
  reportOutage: "ማቋረጥ ሪፖርት ያቅርቡ",
  power: "መብራት",
  water: "ውሃ",
  city: "ከተማ",

  subcity: "ንዑስ ከተማ",
  neighborhood: "አድራሻ/አቅራቢያ",
  phoneOptional: "ስልክ (አማራጭ)",
  note: "ማብራሪያ (ምን ሆነ ከመቼ ጀምሮ)",
  submitting: "በመላክ ላይ...",
  submit: "ሪፖርት ይላኩ",
  thanks: "አመሰግናለሁ! ሪፖርትዎ ተመዝግቧል።",
  error: "ችግኝ ተፈጥሯል",
  recentReports: "የቅርብ ጊዜ ሪፖርቶች",
  all: "ሁሉም",
  noReports: "እስካሁን ሪፖርት የለም",
  contact: "ስልክ",
  total: "ጠቅላላ",
  phoneError: "ስልኩ 0 የሚጀምር 10 አሃዞች መሆን አለበት",
};
