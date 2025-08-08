export const dynamic = "force-static";

export default function AboutPage() {
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <h2 className="text-lg font-semibold">About · ስለ መተግበሪያው</h2>
      <p className="mt-2">
        This simple tool helps communities in Ethiopia report local power and
        water outages quickly. It works well on low bandwidth and mobile
        devices, and stores reports temporarily in memory on the server.
      </p>
      <p className="mt-2">
        ይህ መሣሪያ በኢትዮጵያ ውስጥ የመብራት እና የውሃ ማቋረጥ በፍጥነት እንዲመለከቱ ይረዳል። በዝቅተኛ
        ኢንተርኔት ፍጥነት እና በሞባይል ላይ ይሠራል።
      </p>
    </div>
  );
}


