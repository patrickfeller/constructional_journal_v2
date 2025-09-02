import { db } from "@/lib/db";
import { createPerson, deletePerson } from "./actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PersonEditForm } from "./PersonEditForm";
import { PersonForm } from "./PersonForm";
import { DeletePersonButton } from "./DeletePersonButton";

export default async function PeoplePage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const [people, companies, hoursByPerson] = await Promise.all([
    db.person.findMany({ where: userId ? { userId } : undefined, include: { company: true }, orderBy: { name: "asc" } }),
    db.company.findMany({ where: userId ? { userId } : undefined, orderBy: { name: "asc" } }),
    db.timeEntry.groupBy({ by: ["personId"], _sum: { durationMinutes: true } }),
  ]);

  const minutesMap = new Map<string, number>(
    hoursByPerson
      .filter((h) => h.personId)
      .map((h) => [h.personId as string, h._sum.durationMinutes ?? 0])
  );
  const toHours = (mins?: number | null) => (((mins ?? 0) / 60)).toFixed(1);
  return (
    <main className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">People</h1>
      <section className="rounded-2xl bg-card text-card-foreground shadow-sm p-4 border">
        <h2 className="font-medium mb-2">Add person</h2>
        <PersonForm companies={companies} />
      </section>
      <section className="rounded-2xl bg-card text-card-foreground shadow-sm p-4 border">
        <h2 className="font-medium mb-2">People</h2>
        <ul className="divide-y divide-border">
          {people.map((p) => {
            const totalMinutes = minutesMap.get(p.id) ?? 0;
            return (
              <li key={p.id} className="py-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-sm text-muted-foreground">{p.company?.name ?? "—"}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm font-medium text-muted-foreground">{toHours(totalMinutes)}h</div>
                    <div className="flex gap-2">
                      <PersonEditForm person={p} companies={companies} />
                      <DeletePersonButton personId={p.id} personName={p.name} />
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}


