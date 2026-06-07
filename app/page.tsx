import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getUserAccessibleProjects } from "@/lib/project-permissions";
import {
  BookText, Timer, ReceiptEuro, Folder,
  BarChart3, UserCog, MapPin, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

function startOfDay(d: Date) { d.setHours(0, 0, 0, 0); return d; }
function addDays(d: Date, days: number) { const x = new Date(d); x.setDate(x.getDate() + days); return x; }

function greeting(hour: number) {
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Evening";
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

function formatEur(amount: number): string {
  if (amount >= 1000) return `€${(amount / 1000).toFixed(1)}k`;
  return `€${amount.toFixed(0)}`;
}

export default async function Home() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) {
    return (
      <main className="p-6 max-w-lg mx-auto text-center py-16">
        <h1 className="text-2xl font-bold mb-3">Constructional Journal</h1>
        <p className="text-sm" style={{ color: "var(--ink-2)" }}>
          Please{" "}
          <Link href="/auth" className="font-semibold" style={{ color: "var(--accent-deep)" }}>
            sign in
          </Link>{" "}
          to access your sites.
        </p>
      </main>
    );
  }

  const now = new Date();
  const hour = now.getHours();
  const weekStart = startOfDay(addDays(new Date(now), -now.getDay()));
  const sevenDaysAgo = addDays(new Date(now), -7);

  const accessibleProjects = await getUserAccessibleProjects(userId);
  const accessibleProjectIds = accessibleProjects.map((p) => p.id);
  const activeProjects = accessibleProjects.filter((p) => p.active);

  const timeWhere = {
    OR: [{ userId }, { projectId: { in: accessibleProjectIds } }],
  };
  const journalWhere = {
    OR: [{ userId }, { projectId: { in: accessibleProjectIds } }],
  };

  const [weekTime, weekJournalCount, , weekExpenses, latestEntry] =
    await Promise.all([
      db.timeEntry.aggregate({
        _sum: { durationMinutes: true },
        where: { ...timeWhere, date: { gte: weekStart } },
      }),
      db.journalEntry.count({
        where: { ...journalWhere, date: { gte: sevenDaysAgo } },
      }),
      db.journalEntry.count({ where: journalWhere }),
      db.expense.aggregate({
        _sum: { amount: true },
        where: { projectId: { in: accessibleProjectIds }, date: { gte: weekStart } },
      }),
      db.journalEntry.findFirst({
        where: journalWhere,
        include: { project: true },
        orderBy: { date: "desc" },
      }),
    ]);

  const weekHours = ((weekTime._sum?.durationMinutes ?? 0) / 60).toFixed(1);
  const weekExpAmt = Number(weekExpenses._sum?.amount ?? 0);
  const activeProject = activeProjects[0] ?? accessibleProjects[0];

  const firstName = (session?.user?.name ?? "there").split(" ")[0];

  return (
    <main className="p-4 pb-8 max-w-lg mx-auto">
      {/* Hub hero */}
      <div className="mb-5 mt-3">
        <p
          className="font-mono text-[11px] tracking-[.12em] uppercase mb-1.5"
          style={{ color: "var(--ink-3)" }}
        >
          {formatDate(now)}
        </p>
        <h1 className="text-[28px] font-extrabold tracking-[-0.025em] leading-tight mb-1">
          {greeting(hour)}, {firstName}
        </h1>
        <p className="text-sm" style={{ color: "var(--ink-2)" }}>
          {activeProjects.length} active site{activeProjects.length !== 1 ? "s" : ""} ·{" "}
          {weekHours} h logged this week
        </p>
      </div>

      {/* Active project strip */}
      {activeProject && (
        <Link
          href={`/projects/${activeProject.id}`}
          className="flex items-center gap-3 rounded-[18px] p-4 mb-5 transition-transform active:scale-[0.985]"
          style={{
            background: "var(--ink)",
            color: "#fff",
          }}
        >
          <div
            className="w-[42px] h-[42px] rounded-[12px] flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--accent)", color: "var(--on-accent)" }}
          >
            <MapPin className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div
              className="font-mono text-[10.5px] tracking-[.12em] uppercase mb-0.5"
              style={{ opacity: 0.6 }}
            >
              Active site
            </div>
            <div className="text-base font-bold truncate">{activeProject.name}</div>
          </div>
          <ChevronRight className="w-[18px] h-[18px] flex-shrink-0" style={{ opacity: 0.6 }} />
        </Link>
      )}

      {/* Jump-to section header */}
      <div className="flex items-baseline justify-between mb-3">
        <h3
          className="font-mono text-[11px] tracking-[.12em] uppercase font-semibold"
          style={{ color: "var(--ink-3)" }}
        >
          Jump to
        </h3>
      </div>

      {/* Tile grid */}
      <div className="grid grid-cols-2 gap-3 mb-7">
        <HubTile
          href="/journal"
          label="Journal"
          icon={BookText}
          stat={<><b style={{ color: "var(--accent-deep)" }}>{weekJournalCount}</b> / 7 days</>}
          accent
          badge={weekJournalCount > 0 ? String(weekJournalCount) : undefined}
        />
        <HubTile
          href="/time"
          label="Time"
          icon={Timer}
          stat={<><b style={{ color: "var(--accent-deep)" }}>{weekHours}</b> h / wk</>}
        />
        <HubTile
          href="/expenses"
          label="Expenses"
          icon={ReceiptEuro}
          stat={<><b style={{ color: "var(--accent-deep)" }}>{formatEur(weekExpAmt)}</b> / wk</>}
        />
        <HubTile
          href="/projects"
          label="Projects"
          icon={Folder}
          stat={<>{activeProjects.length} active</>}
        />
        <HubTile
          href="/dashboard"
          label="Dashboard"
          icon={BarChart3}
          stat="Reports"
        />
        <HubTile
          href="/personal-lists"
          label="My Lists"
          icon={UserCog}
          stat="People · Cos."
        />
      </div>

      {/* Latest entry */}
      {latestEntry && (
        <>
          <div className="flex items-baseline justify-between mb-3">
            <h3
              className="font-mono text-[11px] tracking-[.12em] uppercase font-semibold"
              style={{ color: "var(--ink-3)" }}
            >
              Latest entry
            </h3>
            <Link
              href="/journal"
              className="text-[13px] font-semibold flex items-center gap-0.5"
              style={{ color: "var(--accent-deep)" }}
            >
              Open journal <ChevronRight className="w-[13px] h-[13px]" />
            </Link>
          </div>
          <JournalEntryRow entry={latestEntry} />
        </>
      )}
    </main>
  );
}

/* ---- HubTile ---- */
function HubTile({
  href,
  label,
  icon: Icon,
  stat,
  accent,
  badge,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  stat: React.ReactNode;
  accent?: boolean;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative flex flex-col justify-between",
        "rounded-[18px] border p-[15px] min-h-[112px]",
        "transition-transform active:scale-95"
      )}
      style={{
        background: "var(--surface)",
        borderColor: accent ? "var(--accent)" : "var(--line)",
        boxShadow: "var(--shadow-sm)",
        color: "var(--ink)",
      }}
    >
      {badge && (
        <span
          className="absolute top-3 right-3.5 min-w-[22px] h-[22px] px-1.5 rounded-full font-mono text-[12px] font-semibold flex items-center justify-center"
          style={{ background: "var(--accent)", color: "var(--on-accent)" }}
        >
          {badge}
        </span>
      )}
      <div
        className="w-10 h-10 rounded-[12px] flex items-center justify-center border"
        style={
          accent
            ? { background: "var(--accent)", borderColor: "transparent", color: "var(--on-accent)" }
            : { background: "var(--surface-2)", borderColor: "var(--line)", color: "var(--ink)" }
        }
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-[15px] font-bold tracking-[-0.01em]">{label}</div>
        <div className="font-mono text-[12px] mt-0.5" style={{ color: "var(--ink-3)" }}>
          {stat}
        </div>
      </div>
    </Link>
  );
}

/* ---- JournalEntryRow ---- */
function JournalEntryRow({
  entry,
}: {
  entry: { title: string; notes: string | null; date: Date; project: { name: string } };
}) {
  return (
    <div
      className="rounded-[16px] border p-[14px_15px]"
      style={{
        background: "var(--surface)",
        borderColor: "var(--line)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className="flex items-center gap-2.5 mb-1.5">
        <span
          className="font-mono text-[11px] px-[7px] py-[2px] rounded-[7px] border max-w-[55%] truncate"
          style={{
            color: "var(--ink-2)",
            background: "var(--surface-2)",
            borderColor: "var(--line)",
          }}
        >
          {entry.project.name}
        </span>
        <span
          className="ml-auto font-mono text-[12px] whitespace-nowrap"
          style={{ color: "var(--ink-3)" }}
        >
          {new Date(entry.date).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
          })}
        </span>
      </div>
      <h4 className="text-base font-bold tracking-[-0.01em] mb-1">{entry.title}</h4>
      {entry.notes && (
        <p
          className="text-[13.5px] leading-relaxed line-clamp-2"
          style={{ color: "var(--ink-2)" }}
        >
          {entry.notes}
        </p>
      )}
    </div>
  );
}
