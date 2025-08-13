import { db } from "@/lib/db";
import { createCompany } from "./actions";
import { getServerSession } from "next-auth";
import { authOptions } from "app/api/auth/[...nextauth]/route";

export default async function CompaniesPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const [companies, peopleByCompany] = await Promise.all([
    db.company.findMany({ where: userId ? { userId } : undefined, orderBy: { name: "asc" } }),
    db.person.groupBy({ by: ["companyId"], _count: { _all: true } }),
  ]);
  const countMap = new Map<string, number>(
    peopleByCompany
      .filter((g) => g.companyId)
      .map((g) => [g.companyId as string, g._count._all])
  );

  return (
    <main className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Companies</h1>
      <section className="rounded-2xl bg-card text-card-foreground shadow-sm p-4 border">
        <h2 className="font-medium mb-2">Add company</h2>
        <form action={createCompany} className="grid sm:grid-cols-3 gap-2 items-end">
          <input name="name" aria-label="Name" placeholder="Name" className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800" required />
          <input name="hourlyRateDefault" aria-label="Default hourly rate" placeholder="Hourly rate (optional)" className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800" />
          <button className="rounded-md bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2">Save</button>
        </form>
      </section>
      <section className="rounded-2xl bg-card text-card-foreground shadow-sm p-4 border">
        <h2 className="font-medium mb-2">Company list</h2>
        <ul className="divide-y divide-border">
          {companies.map((c) => (
            <li key={c.id} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{c.name}</div>
                <div className="text-sm text-muted-foreground">
                  {typeof c.hourlyRateDefault === "object" || typeof c.hourlyRateDefault === "number"
                    ? `Default rate: ${c.hourlyRateDefault}`
                    : "No default rate"}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">{countMap.get(c.id) ?? 0} people</div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}


